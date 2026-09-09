import { validateCodeGuardrails } from './guardrails';
import { runJDoodleSubmission } from './providers/jdoodle';
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
  providerUsed: 'jdoodle' | 'fallback';
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

  const clientId = (process.env.JDOODLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.JDOODLE_CLIENT_SECRET || '').trim();
  const isJDoodleConfigured = Boolean(
    clientId &&
      clientSecret &&
      clientId !== 'your_client_id' &&
      clientSecret !== 'your_client_secret'
  );

  let providerUsed: 'jdoodle' | 'fallback' = isJDoodleConfigured ? 'jdoodle' : 'fallback';

  const testResults: TestCaseResult[] = [];
  let totalRuntimeMs = 0;
  let aggregatedStdout = '';
  let aggregatedStderr = '';

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

    if (providerUsed === 'jdoodle') {
      try {
        const jdResult = await runJDoodleSubmission({
          language,
          sourceCode: code,
          stdin: tc.input,
        });

        actualOutput = normalizeOutput(jdResult.stdout);
        actualStderr = normalizeOutput(jdResult.stderr);
        tcRuntimeMs = jdResult.timeMs;

        if (jdResult.statusCode === 200) {
          isTestCasePassed = true;
        } else {
          isTestCasePassed = false;
          tcError = jdResult.error || `JDoodle execution error (status: ${jdResult.statusCode})`;
        }
      } catch (jdErr: any) {
        console.warn(
          '[Code Runner] JDoodle API call failed, falling back to local runner:',
          jdErr.message || jdErr
        );
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
export * from './providers/jdoodle';
export * from './providers/fallback';
