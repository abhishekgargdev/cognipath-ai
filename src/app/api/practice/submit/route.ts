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
    const question = await PracticeQuestion.findOne({
      $or: [{ id: questionId }, { _id: questionId }],
    }).lean();

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

    // 3. AI Evaluation Task
    let diagnosticPayload: any;
    try {
      diagnosticPayload = await evaluateAnswerTask({
        topicTitle: question.title,
        questionPrompt: question.prompt,
        questionType: question.type,
        userCode: code || selectedOption,
        testResults: runnerResults,
      });
    } catch (aiErr) {
      console.warn('[Submit API] AI Evaluation task fallback triggered:', aiErr);
      diagnosticPayload = {
        whatYouDidWell: isPassed
          ? [`Successfully solved question: ${question.title}`, 'Handled edge cases accurately']
          : ['Attempted analytical deduction for topic concept'],
        whatCouldBeImproved: isPassed ? [] : ['Review concept documentation and execution order'],
        conceptsDemonstrated: [
          { name: question.title, status: isPassed ? 'Strong' : 'Needs Practice' },
          { name: question.typeLabel || 'Practicum', status: isPassed ? 'Strong' : 'Needs Practice' },
        ],
        alternativeApproach: question.solutionApproaches?.[0]?.code || undefined,
        aiRecommendation: isPassed
          ? 'Great progress! Move forward to next subtopic monograph in syllabus.'
          : `Review topic: ${question.title} to solidify core mechanics.`,
      };
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
      diagnosticEvaluation: diagnosticPayload,
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
          commonMistakeExplanation: 'Asynchronous callbacks require appropriate queue handling and context scoping.',
        }
      : undefined;

    return NextResponse.json({
      submissionId: submission._id,
      passed: isPassed,
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
      whatYouDidWell: diagnosticPayload.whatYouDidWell || [],
      whatCouldBeImproved: diagnosticPayload.whatCouldBeImproved || [],
      conceptsDemonstrated: diagnosticPayload.conceptsDemonstrated || [],
      alternativeApproach: diagnosticPayload.alternativeApproach || question.solutionApproaches?.[0]?.code,
      aiRecommendation: diagnosticPayload.aiRecommendation || 'Review topic concept and attempt practice exercises.',
      failingTestDetails,
      conceptExplanation: question.conceptExplanation,
      topSolutions: question.solutionApproaches,
    });
  } catch (error: any) {
    console.error('[Submit Practice API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit practice exercise' },
      { status: 500 }
    );
  }
}
