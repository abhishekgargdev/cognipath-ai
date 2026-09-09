export interface JDoodleSubmissionOptions {
  language: string;
  sourceCode: string;
  stdin?: string;
  versionIndex?: string;
}

export interface JDoodleExecutionResult {
  statusCode: number;
  stdout: string;
  stderr: string;
  error?: string;
  timeMs: number;
  memoryKb: number;
  rawOutput: string;
}

export interface JDoodleLanguageConfig {
  language: string;
  versionIndex: string;
}

const LANGUAGE_MAP: Record<string, JDoodleLanguageConfig> = {
  javascript: { language: 'nodejs', versionIndex: '4' },
  js: { language: 'nodejs', versionIndex: '4' },
  node: { language: 'nodejs', versionIndex: '4' },
  nodejs: { language: 'nodejs', versionIndex: '4' },
  typescript: { language: 'typescript', versionIndex: '0' },
  ts: { language: 'typescript', versionIndex: '0' },
  python: { language: 'python3', versionIndex: '4' },
  py: { language: 'python3', versionIndex: '4' },
  python3: { language: 'python3', versionIndex: '4' },
  cpp: { language: 'cpp', versionIndex: '5' },
  'c++': { language: 'cpp', versionIndex: '5' },
  java: { language: 'java', versionIndex: '4' },
};

export function getJDoodleLanguageConfig(language: string): JDoodleLanguageConfig {
  const normalized = language.toLowerCase().trim();
  return LANGUAGE_MAP[normalized] || { language: 'nodejs', versionIndex: '4' };
}

export async function runJDoodleSubmission(
  options: JDoodleSubmissionOptions
): Promise<JDoodleExecutionResult> {
  const clientId = (process.env.JDOODLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.JDOODLE_CLIENT_SECRET || '').trim();
  const apiUrl = (process.env.JDOODLE_API_URL || 'https://api.jdoodle.com/v1/execute').trim();

  if (!clientId || !clientSecret || clientId === 'your_client_id' || clientSecret === 'your_client_secret') {
    throw new Error('JDOODLE_CLIENT_ID or JDOODLE_CLIENT_SECRET is not configured with real API credentials');
  }

  const { language: jdLanguage, versionIndex: defaultVersion } = getJDoodleLanguageConfig(options.language);
  const versionIndex = options.versionIndex || defaultVersion;

  const payload = {
    clientId,
    clientSecret,
    script: options.sourceCode,
    stdin: options.stdin || '',
    language: jdLanguage,
    versionIndex,
  };

  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutTimer);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`JDoodle API error [${res.status}]: ${errText || res.statusText}`);
    }

    const data = await res.json();

    if (data.statusCode && data.statusCode !== 200) {
      const errorMsg = data.error || data.output || `JDoodle execution error (status: ${data.statusCode})`;
      return {
        statusCode: data.statusCode,
        stdout: '',
        stderr: errorMsg,
        error: errorMsg,
        timeMs: Math.round(parseFloat(data.cpuTime || '0') * 1000),
        memoryKb: parseInt(data.memory || '0', 10),
        rawOutput: data.output || '',
      };
    }

    const output = data.output || '';
    const timeMs = Math.round(parseFloat(data.cpuTime || '0') * 1000);
    const memoryKb = parseInt(data.memory || '0', 10);

    return {
      statusCode: 200,
      stdout: output,
      stderr: '',
      timeMs,
      memoryKb,
      rawOutput: output,
    };
  } catch (err: any) {
    clearTimeout(timeoutTimer);
    if (err.name === 'AbortError') {
      throw new Error('JDoodle execution timed out (> 8s wall clock)');
    }
    throw err;
  }
}

export async function getJDoodleAuthToken(): Promise<{ token: string; expiresInSeconds: number }> {
  const clientId = (process.env.JDOODLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.JDOODLE_CLIENT_SECRET || '').trim();

  if (!clientId || !clientSecret || clientId === 'your_client_id' || clientSecret === 'your_client_secret') {
    throw new Error('JDOODLE_CLIENT_ID or JDOODLE_CLIENT_SECRET is not configured');
  }

  const res = await fetch('https://api.jdoodle.com/v1/auth-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientId,
      clientSecret,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`JDoodle Auth Token API error [${res.status}]: ${errText || res.statusText}`);
  }

  const tokenStr = await res.text();
  return {
    token: tokenStr.replace(/"/g, '').trim(),
    expiresInSeconds: 180,
  };
}
