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

  private getDailyLimitPerKey(): number {
    const limit = parseInt(process.env.GEMINI_DAILY_LIMIT_PER_KEY || '1000', 10);
    return isNaN(limit) || limit <= 0 ? 1000 : limit;
  }

  private async isKeyQuotaExhausted(keyIndex: number): Promise<boolean> {
    const redis = getRedisInstance();
    if (!redis) return false;
    try {
      const redisKey = `gemini:quota:${keyIndex}:${this.getTodayDateKey()}`;
      const count = await redis.get<number | string>(redisKey);
      if (count === null || count === undefined) return false;
      const numCount = typeof count === 'number' ? count : parseInt(String(count), 10);
      return !isNaN(numCount) && numCount >= this.getDailyLimitPerKey();
    } catch {
      return false;
    }
  }

  private async incrementKeyQuota(keyIndex: number): Promise<void> {
    const redis = getRedisInstance();
    if (!redis) return;
    try {
      const redisKey = `gemini:quota:${keyIndex}:${this.getTodayDateKey()}`;
      const newCount = await redis.incr(redisKey);
      if (newCount === 1) {
        // First request today for this key, set 24h TTL
        await redis.expire(redisKey, 86400);
      }
    } catch {
      // Redis offline or error, proceed
    }
  }

  private async flagKeyExhausted(keyIndex: number): Promise<void> {
    const redis = getRedisInstance();
    if (!redis) return;
    try {
      const redisKey = `gemini:quota:${keyIndex}:${this.getTodayDateKey()}`;
      const limit = this.getDailyLimitPerKey();
      await redis.set(redisKey, limit, { ex: 86400 });
      console.warn(`[AI Router] Gemini key index ${keyIndex} flagged as daily quota exhausted (${limit} calls) for date ${this.getTodayDateKey()}`);
    } catch {
      // Redis offline
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

        const isExhausted = await this.isKeyQuotaExhausted(keyIndex1Based);
        if (isExhausted) {
          console.log(`[AI Router] Skipping Gemini key #${keyIndex1Based} (Daily quota limit reached for ${this.getTodayDateKey()})`);
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
              timeoutMs: options.timeoutMs ?? 15000,
            });

            // Increment per-day Redis call counter
            await this.incrementKeyQuota(keyIndex1Based);

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
              await this.flagKeyExhausted(keyIndex1Based);
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

    // All Gemini keys failed or daily quota exhausted -> Fallback to NVIDIA if enabled
    console.warn('[AI Router] All Gemini API keys rate-limited or daily quota exhausted. Checking NVIDIA fallback...');
    try {
      const nvidiaResult = await callNvidiaProvider({
        prompt: options.prompt,
        systemPrompt: options.systemPrompt,
        jsonMode: options.jsonMode,
        temperature: options.temperature,
        timeoutMs: options.timeoutMs ?? 30000,
      });

      return {
        text: nvidiaResult.text,
        provider: 'nvidia',
        modelUsed: nvidiaResult.modelUsed,
      };
    } catch (nvidiaErr: any) {
      console.error('[AI Router] Gemini keys exhausted and NVIDIA fallback unavailable/failed:', nvidiaErr?.message || nvidiaErr);
      throw new Error(`AI Service Unavailable: Gemini daily quotas exhausted and NVIDIA fallback unavailable (${nvidiaErr?.message || nvidiaErr})`);
    }
  }
}

export const aiRouter = new AIRouter();
