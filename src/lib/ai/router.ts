import { callGeminiProvider } from './providers/gemini';
import { callNvidiaProvider } from './providers/nvidia';
import { getRedisInstance } from './cache';

export interface RouterCallOptions {
  prompt: string;
  systemPrompt?: string;
  jsonMode?: boolean;
  temperature?: number;
  timeoutMs?: number;
}

export interface RouterCallResult {
  text: string;
  provider: 'gemini' | 'nvidia';
  modelUsed: string;
  keyIndexUsed?: number;
}

class AIRouter {
  private currentKeyIndex = 0;

  private getGeminiKeys(): string[] {
    const keys: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const key = process.env[`GEMINI_API_KEY_${i}`];
      if (key && key.trim().length > 0) {
        keys.push(key.trim());
      }
    }
    return keys;
  }

  private getTodayDateKey(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private async isKeyRateLimited(keyIndex: number): Promise<boolean> {
    const redis = getRedisInstance();
    if (!redis) return false;
    try {
      const redisKey = `gemini:quota:${keyIndex}:${this.getTodayDateKey()}`;
      const isLimited = await redis.get<number | string>(redisKey);
      return Boolean(isLimited);
    } catch {
      return false;
    }
  }

  private async flagKeyRateLimited(keyIndex: number): Promise<void> {
    const redis = getRedisInstance();
    if (!redis) return;
    try {
      const redisKey = `gemini:quota:${keyIndex}:${this.getTodayDateKey()}`;
      await redis.set(redisKey, 1, { ex: 86400 });
      console.warn(`[AI Router] Gemini key index ${keyIndex} flagged as rate limited for date ${this.getTodayDateKey()}`);
    } catch {
      // Upstash Redis connection unavailable or offline, skip remote flagging
    }
  }

  public async execute(options: RouterCallOptions): Promise<RouterCallResult> {
    const geminiKeys = this.getGeminiKeys();

    if (geminiKeys.length > 0) {
      const startIndex = this.currentKeyIndex % geminiKeys.length;

      for (let attempt = 0; attempt < geminiKeys.length; attempt++) {
        const index = (startIndex + attempt) % geminiKeys.length;
        const keyIndex1Based = index + 1;
        const apiKey = geminiKeys[index];

        const isExhausted = await this.isKeyRateLimited(keyIndex1Based);
        if (isExhausted) {
          console.log(`[AI Router] Skipping Gemini key #${keyIndex1Based} (Redis quota limit active)`);
          continue;
        }

        // Try calling Gemini with 1 retry on error
        for (let retry = 0; retry < 2; retry++) {
          try {
            console.log(`[AI Router] Invoking Gemini provider with key #${keyIndex1Based} (Attempt ${retry + 1})`);
            const result = await callGeminiProvider({
              apiKey,
              prompt: options.prompt,
              systemPrompt: options.systemPrompt,
              jsonMode: options.jsonMode,
              temperature: options.temperature,
              timeoutMs: options.timeoutMs ?? 10000,
            });

            // Advance round-robin pointer for next call
            this.currentKeyIndex = (index + 1) % geminiKeys.length;

            return {
              text: result.text,
              provider: 'gemini',
              modelUsed: result.modelUsed,
              keyIndexUsed: keyIndex1Based,
            };
          } catch (err: any) {
            const errorMsg = err?.message || String(err);
            const isRateLimit =
              errorMsg.includes('429') ||
              errorMsg.includes('Quota') ||
              errorMsg.includes('RESOURCE_EXHAUSTED') ||
              errorMsg.includes('rate limit');

            if (isRateLimit) {
              console.warn(`[AI Router] Gemini key #${keyIndex1Based} hit rate limit 429: ${errorMsg}`);
              await this.flagKeyRateLimited(keyIndex1Based);
              break; // Break retry loop, move to next Gemini key
            }

            if (retry === 0) {
              console.warn(`[AI Router] Gemini call error on key #${keyIndex1Based}, retrying in 500ms...`);
              await new Promise((r) => setTimeout(r, 500));
            } else {
              console.warn(`[AI Router] Gemini key #${keyIndex1Based} failed after retries: ${errorMsg}`);
            }
          }
        }
      }
    }

    // All Gemini keys failed or rate-limited -> Fallback to NVIDIA
    console.warn('[AI Router] All Gemini API keys rate-limited or unavailable. Failing over to NVIDIA provider...');
    try {
      const nvidiaResult = await callNvidiaProvider({
        prompt: options.prompt,
        systemPrompt: options.systemPrompt,
        jsonMode: options.jsonMode,
        temperature: options.temperature,
        timeoutMs: options.timeoutMs ?? 15000,
      });

      return {
        text: nvidiaResult.text,
        provider: 'nvidia',
        modelUsed: nvidiaResult.modelUsed,
      };
    } catch (nvidiaErr: any) {
      console.error('[AI Router] Both Gemini and NVIDIA providers failed!', nvidiaErr);
      throw new Error(`AI Service Unavailable: Gemini exhausted and NVIDIA fallback failed (${nvidiaErr?.message || nvidiaErr})`);
    }
  }
}

export const aiRouter = new AIRouter();
