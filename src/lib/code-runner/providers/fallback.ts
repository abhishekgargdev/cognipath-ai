import vm from 'node:vm';

export interface FallbackExecutionOptions {
  language: string;
  sourceCode: string;
  stdin?: string;
  expectedOutput?: string;
  timeoutMs?: number;
}

export interface FallbackExecutionResult {
  statusId: number; // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded, 6 = Error
  statusDescription: string;
  stdout: string;
  stderr: string;
  timeMs: number;
}

export async function runFallbackExecution(
  options: FallbackExecutionOptions
): Promise<FallbackExecutionResult> {
  const startTime = Date.now();
  const timeout = options.timeoutMs ?? 3000;

  const logs: string[] = [];
  const errors: string[] = [];

  const sandbox = {
    console: {
      log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      error: (...args: any[]) => errors.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      info: (...args: any[]) => logs.push(args.map((a) => String(a)).join(' ')),
      warn: (...args: any[]) => logs.push(args.map((a) => String(a)).join(' ')),
    },
    stdin: options.stdin || '',
    output: undefined as any,
  };

  const context = vm.createContext(sandbox);

  try {
    // Wrap code to return output or execute solution function if stdin provided
    let wrappedScript = options.sourceCode;

    if (options.stdin) {
      wrappedScript += `\n\nif (typeof solution === 'function') { output = solution(${options.stdin}); }`;
    }

    const script = new vm.Script(wrappedScript);
    script.runInContext(context, { timeout });

    const runtimeMs = Date.now() - startTime;
    let actualOutput = logs.join('\n');
    if (sandbox.output !== undefined) {
      actualOutput = typeof sandbox.output === 'object' ? JSON.stringify(sandbox.output) : String(sandbox.output);
    }

    let isPassed = true;
    if (options.expectedOutput !== undefined) {
      const normalizedActual = actualOutput.trim();
      const normalizedExpected = options.expectedOutput.trim();
      isPassed = normalizedActual === normalizedExpected;
    }

    return {
      statusId: isPassed ? 3 : 4,
      statusDescription: isPassed ? 'Accepted' : 'Wrong Answer',
      stdout: actualOutput,
      stderr: errors.join('\n'),
      timeMs: runtimeMs,
    };
  } catch (err: any) {
    const runtimeMs = Date.now() - startTime;
    const isTimeout = err?.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' || err?.message?.includes('timed out');

    return {
      statusId: isTimeout ? 5 : 6,
      statusDescription: isTimeout ? 'Time Limit Exceeded' : 'Runtime Error',
      stdout: logs.join('\n'),
      stderr: err?.message || String(err),
      timeMs: runtimeMs,
    };
  }
}
