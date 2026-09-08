import { OpenAI } from 'openai';

export interface NvidiaCallOptions {
  prompt: string;
  systemPrompt?: string;
  jsonMode?: boolean;
  temperature?: number;
  timeoutMs?: number;
}

export interface NvidiaCallResult {
  text: string;
  modelUsed: string;
}

export async function callNvidiaProvider(options: NvidiaCallOptions): Promise<NvidiaCallResult> {
  const apiKey = (process.env.NVIDIA_API_KEY || '').trim();
  const baseURL = (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').trim();

  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY environment variable is missing');
  }

  const openai = new OpenAI({ apiKey, baseURL });

  const primaryModel = (process.env.NVIDIA_MODEL_TEXT || 'meta/llama-3.1-70b-instruct').trim();
  const candidateModels = Array.from(
    new Set([primaryModel, 'meta/llama-3.1-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct', 'mistralai/mistral-7b-instruct-v0.3'])
  );

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

  let userContent = options.prompt;
  if (options.jsonMode) {
    userContent += '\n\nIMPORTANT: Respond with valid, raw JSON only. Do not include markdown code block formatting (```json) or extra conversational text.';
  }

  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }

  messages.push({ role: 'user', content: userContent });

  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const timeoutMs = options.timeoutMs ?? 15000;
      let timer: NodeJS.Timeout;

      const callPromise = openai.chat.completions.create({
        model: modelName,
        messages,
        temperature: options.temperature ?? 0.2,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`NVIDIA request timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      const res = await Promise.race([callPromise, timeoutPromise]);
      clearTimeout(timer!);

      let text = res.choices[0]?.message?.content || '';
      if (!text) {
        throw new Error('NVIDIA returned empty completion content');
      }

      if (options.jsonMode) {
        text = text.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '').trim();
      }

      return { text, modelUsed: modelName };
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      if (msg.includes('404') || msg.includes('Not Found') || msg.includes('410') || msg.includes('Gone')) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All candidate NVIDIA models failed');
}
