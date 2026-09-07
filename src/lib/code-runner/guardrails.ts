export interface GuardrailValidationResult {
  allowed: boolean;
  reason?: string;
}

const MAX_CODE_BYTES = 64 * 1024; // 64KB

const FORBIDDEN_JS_PATTERNS = [
  /require\s*\(\s*['"`](fs|child_process|net|os|http|https|tls|cluster|dgram)['"`]\s*\)/i,
  /import\s+.*from\s+['"`](fs|child_process|net|os|http|https)['"`]/i,
  /process\.exit/i,
  /process\.env/i,
  /child_process/i,
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /eval\s*\(/i,
  /new\s+Function\s*\(/i,
  /__proto__/i,
];

const FORBIDDEN_PYTHON_PATTERNS = [
  /import\s+(os|sys|subprocess|shutil|socket|requests|urllib)/i,
  /from\s+(os|sys|subprocess|shutil|socket|requests|urllib)\s+import/i,
  /__import__\s*\(/i,
  /open\s*\(/i,
  /exec\s*\(/i,
  /eval\s*\(/i,
];

export function validateCodeGuardrails(code: string, language: string): GuardrailValidationResult {
  if (!code || typeof code !== 'string') {
    return { allowed: false, reason: 'Code payload is empty or invalid.' };
  }

  // 1. Size Limit Check (64KB max)
  const byteLength = Buffer.byteLength(code, 'utf8');
  if (byteLength > MAX_CODE_BYTES) {
    return {
      allowed: false,
      reason: `Code size (${Math.round(byteLength / 1024)}KB) exceeds the 64KB maximum limit.`,
    };
  }

  const lang = language.toLowerCase();

  // 2. Pattern Pre-Filter for JavaScript / TypeScript
  if (lang.includes('js') || lang.includes('javascript') || lang.includes('ts') || lang.includes('typescript')) {
    for (const pattern of FORBIDDEN_JS_PATTERNS) {
      if (pattern.test(code)) {
        return {
          allowed: false,
          reason: `Code contains forbidden pattern matching: ${pattern.source}`,
        };
      }
    }
  }

  // 3. Pattern Pre-Filter for Python
  if (lang.includes('py') || lang.includes('python')) {
    for (const pattern of FORBIDDEN_PYTHON_PATTERNS) {
      if (pattern.test(code)) {
        return {
          allowed: false,
          reason: `Code contains forbidden pattern matching: ${pattern.source}`,
        };
      }
    }
  }

  return { allowed: true };
}
