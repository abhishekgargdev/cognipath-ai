import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { PracticeQuestion } from '@/lib/db/models/PracticeQuestion';
import { AiRecommendation } from '@/lib/db/models/AiRecommendation';
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
    // 1. Authorization header check against CRON_SECRET
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization');

    if (cronSecret) {
      const isValidBearer = authHeader === `Bearer ${cronSecret}`;
      const isValidDirect = authHeader === cronSecret;
      if (!isValidBearer && !isValidDirect) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    await connectToDatabase();

    // 2. Find users active in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeProfiles = await UserProfile.find({
      updatedAt: { $gte: sevenDaysAgo },
    }).lean();

    const topicSet = new Set<string>();
    for (const profile of activeProfiles) {
      if (profile.currentTopicId) {
        topicSet.add(profile.currentTopicId);
      }
    }

    // Default fallback topic if no active profiles found
    if (topicSet.size === 0) {
      topicSet.add('js-event-loop');
    }

    const activeTopics = Array.from(topicSet);

    // 3. Maintenance: Ensure tomorrow's practice pool has enough questions (cap AI calls at 10 per run)
    const MAX_AI_CALLS = 10;
    let totalAiCalls = 0;
    let questionsGeneratedCount = 0;

    for (const topicId of activeTopics) {
      if (totalAiCalls >= MAX_AI_CALLS) break;

      const existingCount = await PracticeQuestion.countDocuments({ topicId });

      if (existingCount < 5) {
        const needed = 5 - existingCount;

        for (let i = 0; i < needed; i++) {
          if (totalAiCalls >= MAX_AI_CALLS) break;

          const qType = QUESTION_TYPES[(existingCount + i) % QUESTION_TYPES.length];
          const questionId = `q_${topicId}_${existingCount + i + 1}_${Date.now()}`;

          try {
            totalAiCalls++;
            const aiGenerated = await generateQuestionTask({
              topic: topicId.replace(/-/g, ' '),
              topicId,
              difficulty: 'Intermediate',
              type: qType,
            });

            await PracticeQuestion.findOneAndUpdate(
              { id: aiGenerated.id || questionId },
              {
                ...aiGenerated,
                id: aiGenerated.id || questionId,
                topicId,
                sequenceOrder: existingCount + i + 1,
              },
              { upsert: true, new: true }
            );

            questionsGeneratedCount++;
          } catch (genErr) {
            console.warn(`[Daily Cron] Question generation failed for topic ${topicId}:`, genErr);
          }
        }
      }
    }

    // 4. Refresh stale AiRecommendation rows (older than 3 days)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const deletedStaleRes = await AiRecommendation.deleteMany({
      status: 'pending',
      createdAt: { $lt: threeDaysAgo },
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        activeUsersCount: activeProfiles.length,
        activeTopicsProcessed: activeTopics,
        questionsGeneratedCount,
        totalAiCalls,
        staleRecommendationsCleaned: deletedStaleRes.deletedCount || 0,
      },
    });
  } catch (error: any) {
    console.error('[Daily Cron API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Daily cron execution failed' },
      { status: 500 }
    );
  }
}
