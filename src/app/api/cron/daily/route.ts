import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { Lesson } from '@/lib/db/models/Lesson';
import { PracticeQuestion } from '@/lib/db/models/PracticeQuestion';
import { AiRecommendation } from '@/lib/db/models/AiRecommendation';
import { generateLessonTask } from '@/lib/ai/tasks/generate-lesson';
import { generateQuestionTask } from '@/lib/ai/tasks/generate-question';
import { recommendSkillsTask } from '@/lib/ai/tasks/recommend-skills';

const QUESTION_TYPES: Array<'concept' | 'mcq' | 'output_prediction' | 'coding' | 'debugging' | 'scenario'> = [
  'coding',
  'mcq',
  'output_prediction',
  'concept',
  'debugging',
];

export async function GET(req: Request) {
  try {
    // 1. Authorization check
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

    const MAX_AI_CALLS = parseInt(process.env.AI_CALLS_PER_CRON_RUN || '15', 10);
    let totalAiCalls = 0;
    let lessonsGenerated = 0;
    let questionsGenerated = 0;
    let recommendationsRefreshed = 0;

    // 2. Step A: Advance active users' roadmaps based on prerequisites and availableFrom <= tomorrow
    const activeProfiles = await UserProfile.find().lean();
    const topicDemandMap = new Map<string, number>();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    for (const profile of activeProfiles) {
      const userProgress = await UserNodeProgress.find({ userId: profile.userId });
      const completedOrMasteredNodeIds = new Set(
        userProgress
          .filter((p) => p.status === 'completed' || p.masteryPercent >= 60)
          .map((p) => p.nodeId)
      );

      for (const progress of userProgress) {
        if (progress.status === 'locked') {
          const nodeDoc = await RoadmapNode.findOne({ id: progress.nodeId }).lean();
          const prereqs = nodeDoc?.prerequisites || [];
          const prereqsMet = prereqs.every((prereqId) => completedOrMasteredNodeIds.has(prereqId));
          const availableFromMet = !progress.availableFrom || progress.availableFrom <= tomorrow;

          if (prereqsMet && availableFromMet) {
            progress.status = 'available';
            await progress.save();
          }
        }

        if (progress.status === 'available' || progress.status === 'in_progress') {
          const currentCount = topicDemandMap.get(progress.nodeId) || 0;
          topicDemandMap.set(progress.nodeId, currentCount + 1);
        }
      }
    }

    // Default topics if database is newly initialized
    if (topicDemandMap.size === 0) {
      topicDemandMap.set('js-event-loop', 1);
      topicDemandMap.set('js-closures-memory', 1);
      topicDemandMap.set('async-promises', 1);
    }

    // Sort distinct topicIds by highest user demand first
    const prioritizedTopics = Array.from(topicDemandMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([topicId]) => topicId);

    // 3. Step B & C: Lessons Generation (Shared Pool)
    for (const topicId of prioritizedTopics) {
      if (totalAiCalls >= MAX_AI_CALLS) break;

      let lessonDoc = await Lesson.findOne({ topicId });

      if (!lessonDoc || lessonDoc.status !== 'ready') {
        if (!lessonDoc) {
          lessonDoc = await Lesson.create({
            id: `lesson-${topicId}`,
            topicId,
            title: topicId.replace(/[-_]/g, ' ').toUpperCase(),
            subtitle: 'Pedagogical synthesis in progress...',
            estimatedMinutes: 25,
            difficulty: 'Intermediate',
            masteryLevel: 0,
            whyYouAreLearningThis: 'Synthesizing core mechanics.',
            keyTakeaways: [],
            sections: [],
            antiPatterns: [],
            knowledgeCheck: [],
            status: 'pending',
          });
        }

        try {
          totalAiCalls++;
          const generated = await generateLessonTask({
            topic: topicId.replace(/[-_]/g, ' '),
            topicId,
          });

          await Lesson.updateOne(
            { topicId },
            {
              title: generated.title,
              subtitle: generated.subtitle,
              estimatedMinutes: generated.estimatedMinutes,
              difficulty: generated.difficulty,
              masteryLevel: generated.masteryLevel || 0,
              whyYouAreLearningThis: generated.whyYouAreLearningThis,
              keyTakeaways: generated.keyTakeaways || [],
              sections: generated.sections || [],
              antiPatterns: generated.antiPatterns || [],
              knowledgeCheck: generated.knowledgeCheck || [],
              status: 'ready',
            }
          );
          lessonsGenerated++;
        } catch (genErr) {
          console.warn(`[Daily Cron] Lesson generation failed for topic ${topicId}:`, genErr);
          await Lesson.updateOne({ topicId }, { status: 'failed' });
        }
      }
    }

    // 4. Step D: Top up Practice Question pools for (topicId, difficulty) up to 8 ready questions
    for (const topicId of prioritizedTopics) {
      if (totalAiCalls >= MAX_AI_CALLS) break;

      const readyCount = await PracticeQuestion.countDocuments({ topicId, status: 'ready' });
      const TARGET_QUESTION_THRESHOLD = 8;

      if (readyCount < TARGET_QUESTION_THRESHOLD) {
        const needed = TARGET_QUESTION_THRESHOLD - readyCount;

        for (let i = 0; i < needed; i++) {
          if (totalAiCalls >= MAX_AI_CALLS) break;

          const qType = QUESTION_TYPES[(readyCount + i) % QUESTION_TYPES.length];
          const questionId = `q_${topicId}_${readyCount + i + 1}_${Date.now()}`;

          // Create pending placeholder doc immediately
          const placeholder = await PracticeQuestion.create({
            id: questionId,
            topicId,
            type: qType,
            typeLabel: qType.toUpperCase(),
            title: 'Practicum Problem Preparing...',
            difficulty: 'Intermediate',
            estMinutes: 15,
            whyThisMatters: 'Applied problem synthesis',
            prompt: 'Question content is currently being generated by the background engine.',
            sequenceOrder: readyCount + i + 1,
            status: 'pending',
          });

          try {
            totalAiCalls++;
            const aiGenerated = await generateQuestionTask({
              topic: topicId.replace(/[-_]/g, ' '),
              topicId,
              difficulty: 'Intermediate',
              type: qType,
            });

            await PracticeQuestion.updateOne(
              { id: questionId },
              {
                ...aiGenerated,
                id: aiGenerated.id || questionId,
                topicId,
                sequenceOrder: readyCount + i + 1,
                status: 'ready',
              }
            );
            questionsGenerated++;
          } catch (genErr) {
            console.warn(`[Daily Cron] Question generation failed for topic ${topicId}:`, genErr);
            await PracticeQuestion.updateOne({ id: questionId }, { status: 'failed' });
          }
        }
      }
    }

    // 5. Step E: Refresh stale AiRecommendation docs older than 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const staleRecs = await AiRecommendation.find({
      createdAt: { $lt: threeDaysAgo },
    })
      .limit(3)
      .lean();

    for (const rec of staleRecs) {
      if (totalAiCalls >= MAX_AI_CALLS) break;
      try {
        totalAiCalls++;
        const newRecs = await recommendSkillsTask({
          userId: rec.userId,
          targetGoal: 'Full Stack Architect',
          weakConcepts: ['js-event-loop'],
          completedTopics: [],
        });
        if (newRecs && newRecs.length > 0) {
          await AiRecommendation.updateOne(
            { _id: rec._id },
            { ...newRecs[0], status: 'ready', updatedAt: new Date() }
          );
          recommendationsRefreshed++;
        }
      } catch (recErr) {
        console.warn(`[Daily Cron] Recommendation refresh failed for user ${rec.userId}:`, recErr);
      }
    }

    // 6. Step F: Dispatch Daily Question info emails to active users via BullMQ
    let emailsDispatched = 0;
    const { User } = await import('@/lib/db/models/User');
    const { enqueueDailyQuestionsEmail } = await import('@/lib/queue/bullmq');

    for (const profile of activeProfiles) {
      if (!profile.userId) continue;

      const userDoc = await User.findOne({
        $or: [{ _id: profile.userId }, { id: profile.userId }],
      }).lean();

      const userEmail = userDoc?.email;
      if (!userEmail) continue;

      const topicId = profile.currentTopicId || prioritizedTopics[0] || 'js-event-loop';
      const nodeDoc = await RoadmapNode.findOne({ id: topicId }).lean();
      const topicTitle = nodeDoc?.title || topicId.replace(/[-_]/g, ' ').toUpperCase();

      const assignedQuestions = await PracticeQuestion.find({ topicId, status: 'ready' })
        .limit(5)
        .lean();

      if (assignedQuestions.length > 0) {
        await enqueueDailyQuestionsEmail({
          userId: profile.userId,
          email: userEmail,
          userName: userDoc?.name || 'Learner',
          topicTitle,
          questions: assignedQuestions.map((q) => ({
            title: q.title,
            type: q.type,
            difficulty: q.difficulty,
            estMinutes: q.estMinutes || 10,
          })),
        }).catch((err) => console.warn('[Daily Cron] Email dispatch failed for user:', err));

        emailsDispatched++;
      }
    }

    // Clean up failed pending placeholders older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await PracticeQuestion.deleteMany({ status: 'pending', createdAt: { $lt: oneHourAgo } });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        activeUsersProcessed: activeProfiles.length,
        prioritizedTopics,
        totalAiCalls,
        maxAiCallsAllowed: MAX_AI_CALLS,
        lessonsGenerated,
        questionsGenerated,
        recommendationsRefreshed,
        emailsDispatched,
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
