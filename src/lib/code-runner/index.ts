import { validateCodeGuardrails } from './guardrails';
import { runJudge0Submission } from './providers/judge0';
import { runFallbackExecution } from './providers/fallback';

export interface TestCaseInput {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface TestCaseResult {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden?: boolean;
  error?: string;
  timeMs?: number;
}

export interface CodeRunnerOptions {
  language: string;
  code: string;
  stdin?: string;
  testCases?: TestCaseInput[];
}

export interface CodeRunnerExecutionResponse {
  passed: boolean;
  guardrailPassed: boolean;
  guardrailError?: string;
  results: TestCaseResult[];
  runtimeMs: number;
  stdout: string;
  stderr: string;
  passedTests: number;
  totalTests: number;
  providerUsed: 'judge0' | 'fallback';
}

function normalizeOutput(output: string): string {
  if (!output) return '';
  return output.replace(/\r\n/g, '\n').trim();
}

export async function execute(options: CodeRunnerOptions): Promise<CodeRunnerExecutionResponse> {
  const { language, code, stdin = '', testCases = [] } = options;

  // 1. Guardrail Validation
  const guardrail = validateCodeGuardrails(code, language);
  if (!guardrail.allowed) {
    return {
      passed: false,
      guardrailPassed: false,
      guardrailError: guardrail.reason,
      results: [],
      runtimeMs: 0,
      stdout: '',
      stderr: guardrail.reason || 'Code blocked by security guardrails',
      passedTests: 0,
      totalTests: testCases.length,
      providerUsed: 'fallback',
    };
  }

  const isJudge0Configured = Boolean((process.env.JUDGE0_API_URL || '').trim());
  let providerUsed: 'judge0' | 'fallback' = isJudge0Configured ? 'judge0' : 'fallback';

  const testResults: TestCaseResult[] = [];
  let totalRuntimeMs = 0;
  let aggregatedStdout = '';
  let aggregatedStderr = '';

  // If no specific test cases provided, run single execution
  const casesToRun: TestCaseInput[] =
    testCases.length > 0
      ? testCases
      : [{ id: 'tc-main', input: stdin, expectedOutput: '', isHidden: false }];

  for (const tc of casesToRun) {
    let actualOutput = '';
    let actualStderr = '';
    let isTestCasePassed = false;
    let tcError: string | undefined = undefined;
    let tcRuntimeMs = 0;

    if (providerUsed === 'judge0') {
      try {
        const j0Result = await runJudge0Submission({
          language,
          sourceCode: code,
          stdin: tc.input,
          expectedOutput: tc.expectedOutput || undefined,
          cpuTimeLimitSeconds: 5,
        });

        actualOutput = normalizeOutput(j0Result.stdout);
        actualStderr = normalizeOutput(j0Result.stderr || j0Result.compileOutput);
        tcRuntimeMs = j0Result.timeMs;

        if (j0Result.statusId === 3) {
          isTestCasePassed = true;
        } else if (j0Result.statusId === 4) {
          isTestCasePassed = false;
        } else {
          isTestCasePassed = false;
          tcError = j0Result.statusDescription;
        }
      } catch (j0Err: any) {
        console.warn('[Code Runner] Judge0 API call failed, falling back to local isolated runner:', j0Err.message || j0Err);
        providerUsed = 'fallback';
      }
    }

    if (providerUsed === 'fallback') {
      const fbResult = await runFallbackExecution({
        language,
        sourceCode: code,
        stdin: tc.input,
        expectedOutput: tc.expectedOutput || undefined,
        timeoutMs: 4000,
      });

      actualOutput = normalizeOutput(fbResult.stdout);
      actualStderr = normalizeOutput(fbResult.stderr);
      tcRuntimeMs = fbResult.timeMs;

      if (fbResult.statusId === 3) {
        isTestCasePassed = true;
      } else {
        isTestCasePassed = false;
        if (fbResult.statusId !== 4) {
          tcError = fbResult.statusDescription;
        }
      }
    }

    if (tc.expectedOutput) {
      const expectedNorm = normalizeOutput(tc.expectedOutput);
      if (actualOutput === expectedNorm) {
        isTestCasePassed = true;
      } else {
        isTestCasePassed = false;
      }
    }

    totalRuntimeMs += tcRuntimeMs;
    if (actualOutput) aggregatedStdout += (aggregatedStdout ? '\n' : '') + actualOutput;
    if (actualStderr) aggregatedStderr += (aggregatedStderr ? '\n' : '') + actualStderr;

    testResults.push({
      id: tc.id,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput,
      passed: isTestCasePassed,
      isHidden: tc.isHidden,
      error: tcError,
      timeMs: tcRuntimeMs,
    });
  }

  const passedTests = testResults.filter((r) => r.passed).length;
  const overallPassed = testCases.length > 0 ? passedTests === testCases.length : passedTests > 0;

  return {
    passed: overallPassed,
    guardrailPassed: true,
    results: testResults,
    runtimeMs: totalRuntimeMs,
    stdout: aggregatedStdout,
    stderr: aggregatedStderr,
    passedTests,
    totalTests: testCases.length,
    providerUsed,
  };
}

export * from './guardrails';
export * from './providers/judge0';
export * from './providers/fallback';
