import { GoogleGenAI } from '@google/genai';

export interface GeminiCallOptions {
  apiKey: string;
  prompt: string;
  systemPrompt?: string;
  jsonMode?: boolean;
  temperature?: number;
  timeoutMs?: number;
}

export interface GeminiCallResult {
  text: string;
  modelUsed: string;
}

export async function callGeminiProvider(options: GeminiCallOptions): Promise<GeminiCallResult> {
  const apiKey = options.apiKey.trim();
  if (!apiKey) {
    throw new Error('Gemini API key is empty');
  }

  const ai = new GoogleGenAI({ apiKey });

  const primaryModel = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();
  const candidateModels = Array.from(
    new Set([primaryModel, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'])
  );

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const config: any = {
        temperature: options.temperature ?? 0.2,
      };

      if (options.systemPrompt) {
        config.systemInstruction = options.systemPrompt;
      }

      if (options.jsonMode) {
        config.responseMimeType = 'application/json';
      }

      const callPromise = ai.models.generateContent({
        model: modelName,
        contents: options.prompt,
        config,
      });

      const timeoutMs = options.timeoutMs ?? 15000;
      let timer: NodeJS.Timeout;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Gemini request timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      const res = await Promise.race([callPromise, timeoutPromise]);
      clearTimeout(timer!);

      const text = res.text || '';
      if (!text) {
        throw new Error('Gemini returned an empty response text');
      }

      return { text, modelUsed: modelName };
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      // If 404/Not Found, try next candidate model
      if (msg.includes('404') || msg.includes('not found') || msg.includes('NOT_FOUND')) {
        continue;
      }
      // If 429 rate limit or 403 quota or authentication error, rethrow immediately for router key rotation
      throw err;
    }
  }

  throw lastError || new Error('All candidate Gemini models failed');
}
