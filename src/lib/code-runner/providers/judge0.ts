export interface Judge0SubmissionOptions {
  language: string;
  sourceCode: string;
  stdin?: string;
  expectedOutput?: string;
  cpuTimeLimitSeconds?: number;
}

export interface Judge0ExecutionResult {
  statusId: number;
  statusDescription: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  timeMs: number;
  memoryKb: number;
}

const LANGUAGE_ID_MAP: Record<string, number> = {
  javascript: 63,
  js: 63,
  node: 63,
  typescript: 74,
  ts: 74,
  python: 71,
  py: 71,
  python3: 71,
  cpp: 54,
  'c++': 54,
  java: 62,
};

export function getJudge0LanguageId(language: string): number {
  const normalized = language.toLowerCase().trim();
  return LANGUAGE_ID_MAP[normalized] || 63; // Default to JavaScript (63)
}

export async function runJudge0Submission(
  options: Judge0SubmissionOptions
): Promise<Judge0ExecutionResult> {
  const baseUrl = (process.env.JUDGE0_API_URL || '').trim().replace(/\/$/, '');
  const apiKey = (process.env.JUDGE0_API_KEY || '').trim();

  if (!baseUrl) {
    throw new Error('JUDGE0_API_URL is not configured');
  }

  const languageId = getJudge0LanguageId(options.language);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (baseUrl.includes('rapidapi.com')) {
    try {
      const parsed = new URL(baseUrl);
      headers['X-RapidAPI-Host'] = parsed.hostname;
    } catch {
      headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }
    if (apiKey) {
      headers['X-RapidAPI-Key'] = apiKey;
    }
  } else if (apiKey) {
    headers['X-Auth-Token'] = apiKey;
  }

  const payload = {
    language_id: languageId,
    source_code: options.sourceCode,
    stdin: options.stdin || '',
    expected_output: options.expectedOutput || undefined,
    cpu_time_limit: options.cpuTimeLimitSeconds ?? 5,
  };

  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutTimer);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Judge0 API error [${res.status}]: ${errText || res.statusText}`);
    }

    const data = await res.json();

    return {
      statusId: data.status?.id ?? 3,
      statusDescription: data.status?.description || 'Accepted',
      stdout: data.stdout || '',
      stderr: data.stderr || '',
      compileOutput: data.compile_output || '',
      timeMs: Math.round((parseFloat(data.time || '0') || 0) * 1000),
      memoryKb: data.memory || 0,
    };
  } catch (err: any) {
    clearTimeout(timeoutTimer);
    if (err.name === 'AbortError') {
      throw new Error('Judge0 execution timed out (wall clock > 5s)');
    }
    throw err;
  }
}
