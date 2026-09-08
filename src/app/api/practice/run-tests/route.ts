import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db/mongoose';
import { PracticeQuestion } from '@/lib/db/models/PracticeQuestion';
import { execute } from '@/lib/code-runner';

const runTestsBodySchema = z.object({
  questionId: z.string().min(1),
  code: z.string(),
  language: z.string().default('javascript'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questionId, code, language } = runTestsBodySchema.parse(body);

    await connectToDatabase();

    // 1. Fetch question from Mongo
    const isValidObjectId = mongoose.Types.ObjectId.isValid(questionId) && questionId.length === 24;
    const question = await PracticeQuestion.findOne(
      isValidObjectId
        ? { $or: [{ id: questionId }, { _id: questionId }] }
        : { id: questionId }
    ).lean();

    // If question has custom testCases, filter for visible ones only
    const allTestCases = question?.testCases || [];
    const visibleTestCases = allTestCases
      .filter((tc: any) => !tc.isHidden)
      .map((tc: any) => ({
        id: tc.id || tc._id?.toString() || '1',
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        isHidden: false,
      }));

    // Default fallback test case if question has none defined
    const testCasesToRun =
      visibleTestCases.length > 0
        ? visibleTestCases
        : [
            { id: '1', input: 'sample', expectedOutput: 'sample', isHidden: false },
          ];

    // 2. Execute via sandboxed code runner
    const result = await execute({
      language: language || question?.language || 'javascript',
      code,
      stdin: '',
      testCases: testCasesToRun,
    });

    const passedCount = result.results.filter((r) => r.passed).length;
    const totalCount = result.results.length;
    const message = result.passed
      ? `All ${totalCount} test case${totalCount === 1 ? '' : 's'} passed in ${result.runtimeMs}ms`
      : `${totalCount - passedCount} of ${totalCount} test case${totalCount === 1 ? '' : 's'} failed`;

    return NextResponse.json({
      passed: result.passed,
      message,
      results: result.results.map((r, idx) => ({
        id: r.id || `${idx + 1}`,
        name: `Test ${idx + 1}: ${r.input ? `input: ${r.input}` : 'Evaluation pass'}`,
        expected: r.expectedOutput,
        actual: r.actualOutput,
        passed: r.passed,
      })),
      runtimeMs: result.runtimeMs,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  } catch (error: any) {
    console.error('[Run Tests API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute test cases' },
      { status: 500 }
    );
  }
}
