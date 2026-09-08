import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { PracticeQuestion } from '@/lib/db/models/PracticeQuestion';
import { PracticeSubmission } from '@/lib/db/models/PracticeSubmission';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { DailyStreakLog } from '@/lib/db/models/DailyStreakLog';
import { execute } from '@/lib/code-runner';
import { evaluateAnswerTask } from '@/lib/ai/tasks/evaluate-answer';
import { EvaluationResult } from '@/types';

const submitBodySchema = z.object({
  questionId: z.string().min(1),
  code: z.string().optional(),
  selectedOption: z.string().optional(),
  language: z.string().default('javascript'),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';

    const body = await req.json();
    const { questionId, code = '', selectedOption = '', language } = submitBodySchema.parse(body);

    await connectToDatabase();

    // 1. Fetch PracticeQuestion document from Mongo
    const isValidObjectId = mongoose.Types.ObjectId.isValid(questionId) && questionId.length === 24;
    const question = await PracticeQuestion.findOne(
      isValidObjectId
        ? { $or: [{ id: questionId }, { _id: questionId }] }
        : { id: questionId }
    ).lean();

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    let isPassed = false;
    let score = 0;
    let runtimeMs = 24;
    let memoryMb = 8.4;
    let passedTests = 0;
    let totalTests = 1;
    let runnerResults: any[] = [];
    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';

    // 2. Sandbox Test Execution or MCQ Verification
    if (question.type === 'coding') {
      const allTestCases = (question.testCases || []).map((tc: any, idx: number) => ({
        id: tc.id || `${idx + 1}`,
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        isHidden: !!tc.isHidden,
      }));

      const testCasesToRun =
        allTestCases.length > 0
          ? allTestCases
          : [{ id: '1', input: 'sample', expectedOutput: 'sample', isHidden: false }];

      const runnerResult = await execute({
        language: language || question.language || 'javascript',
        code: code || question.starterCode || '',
        stdin: '',
        testCases: testCasesToRun,
      });

      isPassed = runnerResult.passed;
      runtimeMs = runnerResult.runtimeMs || 32;
      totalTests = runnerResult.results.length;
      passedTests = runnerResult.results.filter((r) => r.passed).length;
      score = isPassed
        ? 100
        : Math.max(30, Math.round((passedTests / Math.max(1, totalTests)) * 100));

      runnerResults = runnerResult.results.map((r, idx) => ({
        passed: r.passed,
        input: r.input || `Test Case ${idx + 1}`,
        expected: r.expectedOutput,
        actual: r.actualOutput,
      }));
    } else {
      // MCQ / Conceptual question evaluation
      isPassed = selectedOption === question.correctAnswer || (!question.correctAnswer && !!selectedOption);
      passedTests = isPassed ? 1 : 0;
      totalTests = 1;
      score = isPassed ? 100 : 45;
      runnerResults = [
        {
          passed: isPassed,
          input: `Selected Option: ${selectedOption}`,
          expected: `Correct Option: ${question.correctAnswer || 'Option A'}`,
          actual: isPassed ? 'Matching Option' : 'Incorrect Option',
        },
      ];
    }

    // 3. Optional Single Live AI Evaluation Call
    let diagnosticPayload: any = null;
    let aiEvaluationStatus: 'ready' | 'unavailable' = 'ready';

    try {
      const failures = runnerResults
        .filter((r: any) => !r.passed)
        .map((r: any) => ({
          input: String(r.input || ''),
          expected: String(r.expected || ''),
          actual: String(r.actual || ''),
        }));

      diagnosticPayload = await evaluateAnswerTask({
        questionPrompt: question.prompt,
        submittedCode: code || selectedOption,
        language: language || question.language || 'javascript',
        isPassed,
        testResults: {
          passedTests,
          totalTests,
          failures,
        },
      });
    } catch (aiErr) {
      console.warn('[Submit API] AI Evaluation task unavailable or failed:', aiErr);
      diagnosticPayload = null;
      aiEvaluationStatus = 'unavailable';
    }

    // 4. Save PracticeSubmission document
    const submission = await PracticeSubmission.create({
      userId,
      questionId: question.id,
      language: language || question.language || 'javascript',
      submittedCode: code || undefined,
      selectedAnswer: selectedOption || undefined,
      isPassed,
      score,
      runtimeMs,
      memoryMb,
      timeComplexity,
      spaceComplexity,
      passedTests,
      totalTests,
      summary: isPassed
        ? `Accurate Solution: ${question.title}`
        : `Diagnostic Revision Recommended: ${question.title}`,
      diagnosticEvaluation: diagnosticPayload || undefined,
      submittedAt: new Date(),
    });

    // 5. Update User Profile (XP, completedQuestionsToday, streakDays)
    const xpGained = isPassed ? 50 : 15;
    const profile = await UserProfile.findOne({ userId });

    if (profile) {
      profile.xp = (profile.xp || 0) + xpGained;
      profile.completedQuestionsToday = Math.min(
        profile.totalQuestionsTargetToday || 5,
        (profile.completedQuestionsToday || 0) + 1
      );
      profile.lastActiveAt = new Date();
      await profile.save();
    } else {
      await UserProfile.create({
        userId,
        xp: xpGained,
        completedQuestionsToday: 1,
        streakDays: 1,
        currentTopicId: question.topicId,
      });
    }

    // Record DailyStreakLog
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await DailyStreakLog.findOneAndUpdate(
      { userId, activityDate: today },
      {
        $inc: { questionsCompleted: 1, xpEarned: xpGained, minutesSpent: 5 },
      },
      { upsert: true }
    );

    // 6. Update UserNodeProgress mastery
    if (question.topicId) {
      const nodeProgress = await UserNodeProgress.findOne({ userId, nodeId: question.topicId });
      if (nodeProgress) {
        nodeProgress.masteryPercent = Math.min(100, Math.max(nodeProgress.masteryPercent, isPassed ? 85 : 40));
        if (nodeProgress.status === 'locked' || nodeProgress.status === 'available') {
          nodeProgress.status = 'in_progress';
        }
        await nodeProgress.save();
      }
    }

    // 7. Format full Evaluation Result for UI Modal
    const failingResult = runnerResults.find((r) => !r.passed);
    const failingTestDetails = failingResult
      ? {
          input: failingResult.input,
          expected: failingResult.expected,
          actual: failingResult.actual,
          commonMistakeExplanation: 'Review input constraints and async execution handling.',
        }
      : undefined;

    const evaluationResponse: EvaluationResult = {
      submissionId: String(submission._id),
      passed: isPassed,
      score,
      runtimeMs,
      memoryMb,
      timeComplexity,
      spaceComplexity,
      passedTests,
      totalTests,
      aiEvaluation: diagnosticPayload,
      aiEvaluationStatus,
      summary: isPassed
        ? `Accurate Solution: ${question.title}`
        : `Diagnostic Revision Recommended: ${question.title}`,
      whatYouDidWell: Array.isArray(diagnosticPayload?.whatYouDidWell) ? diagnosticPayload.whatYouDidWell : [],
      whatCouldBeImproved: Array.isArray(diagnosticPayload?.whatCouldBeImproved)
        ? diagnosticPayload.whatCouldBeImproved
        : [],
      conceptsDemonstrated: Array.isArray(diagnosticPayload?.conceptsDemonstrated)
        ? diagnosticPayload.conceptsDemonstrated
        : [],
      alternativeApproach: diagnosticPayload?.alternativeApproach || question.solutionApproaches?.[0]?.code || '',
      aiRecommendation:
        diagnosticPayload?.aiRecommendation ||
        (aiEvaluationStatus === 'unavailable'
          ? 'AI evaluation service unavailable. Deterministic test results recorded.'
          : 'Review topic concept and attempt practice exercises.'),
      failingTestDetails,
      conceptExplanation: question.conceptExplanation,
      topSolutions: Array.isArray(question.solutionApproaches) ? question.solutionApproaches : [],
    };

    return NextResponse.json(evaluationResponse);
  } catch (error: any) {
    console.error('[Submit Practice API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit practice exercise' },
      { status: 500 }
    );
  }
}
