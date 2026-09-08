import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { PracticeQuestion, IPracticeQuestion } from '@/lib/db/models/PracticeQuestion';
import { acquireLock, releaseLock } from '@/lib/ai/cache';
import { generateQuestionTask } from '@/lib/ai/tasks/generate-question';

const QUESTION_TYPES: Array<'concept' | 'mcq' | 'output_prediction' | 'coding' | 'debugging' | 'scenario'> = [
  'mcq',
  'output_prediction',
  'concept',
  'coding',
  'debugging',
];

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';

    await connectToDatabase();

    // 1. Fetch user profile
    const profile = await UserProfile.findOne({ userId });
    const currentTopicId = profile?.currentTopicId || 'js-event-loop';
    const experienceLevel = profile?.experienceLevel || 'Intermediate';

    // 2. Lock via Upstash Redis to prevent concurrent generation
    const todayStr = new Date().toISOString().split('T')[0];
    const lockKey = `daily:${userId}:${todayStr}`;
    const acquired = await acquireLock(lockKey, 30);

    try {
      // 3. Check existing question pool in MongoDB
      let questions = await PracticeQuestion.find({
        $or: [{ topicId: currentTopicId }, { topicId: 'js-event-loop' }, { topicId: 'javascript' }],
      })
        .sort({ sequenceOrder: 1, createdAt: 1 })
        .limit(5)
        .lean();

      // If pool has fewer than 5 questions, generate missing questions
      if (questions.length < 5) {
        const existingCount = questions.length;
        const needed = 5 - existingCount;

        for (let i = 0; i < needed; i++) {
          const qType = QUESTION_TYPES[(existingCount + i) % QUESTION_TYPES.length];
          const questionId = `q_${currentTopicId}_${existingCount + i + 1}_${Date.now()}`;

          try {
            const aiGenerated = await generateQuestionTask({
              topic: currentTopicId.replace(/-/g, ' '),
              topicId: currentTopicId,
              difficulty: 'Intermediate',
              type: qType,
            });

            const newQ = await PracticeQuestion.findOneAndUpdate(
              { id: aiGenerated.id || questionId },
              {
                ...aiGenerated,
                id: aiGenerated.id || questionId,
                topicId: currentTopicId,
                sequenceOrder: existingCount + i + 1,
              },
              { upsert: true, returnDocument: 'after' }
            ).lean();

            questions.push(newQ as any);
          } catch (genErr) {
            console.warn(`[Daily Practice API] AI question generation failed for item ${i + 1}:`, genErr);
          }
        }

        // Re-fetch 5 questions from Mongo
        questions = await PracticeQuestion.find({
          $or: [{ topicId: currentTopicId }, { topicId: 'js-event-loop' }, { topicId: 'javascript' }],
        })
          .sort({ sequenceOrder: 1, createdAt: 1 })
          .limit(5)
          .lean();
      }

      return NextResponse.json({
        questions,
        completedQuestionsToday: profile?.completedQuestionsToday || 0,
        totalQuestionsTargetToday: profile?.totalQuestionsTargetToday || 5,
        streakDays: profile?.streakDays || 1,
        currentTopicId,
      });
    } finally {
      if (acquired) {
        await releaseLock(lockKey);
      }
    }
  } catch (error: any) {
    console.error('[Daily Practice GET API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch daily practice questions' },
      { status: 500 }
    );
  }
}
