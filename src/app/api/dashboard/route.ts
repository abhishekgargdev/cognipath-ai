import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';

    await connectToDatabase();

    // 1. Fetch user profile or default
    let profile = await UserProfile.findOne({ userId }).lean();
    if (!profile) {
      profile = await UserProfile.create({
        userId,
        targetGoal: 'Full Stack Architect',
        experienceLevel: 'Intermediate',
        dailyCommitmentMinutes: 30,
        streakDays: 3,
        xp: 250,
        overallMastery: 42,
        completedQuestionsToday: 2,
        totalQuestionsTargetToday: 5,
        currentTopicId: 'js-event-loop',
      });
    }

    // 2. Fetch current active topic/node
    const currentTopicId = profile.currentTopicId || 'js-event-loop';
    let currentTopic = await RoadmapNode.findOne({ id: currentTopicId }).lean();
    if (!currentTopic) {
      currentTopic = await RoadmapNode.findOne({ id: 'js-event-loop' }).lean();
    }

    // 3. Fetch node progress
    const progress = await UserNodeProgress.findOne({ userId, nodeId: currentTopicId }).lean();

    return NextResponse.json({
      profile: {
        targetGoal: profile.targetGoal,
        experienceLevel: profile.experienceLevel,
        streakDays: profile.streakDays,
        xp: profile.xp,
        overallMastery: profile.overallMastery,
        completedQuestionsToday: profile.completedQuestionsToday,
        totalQuestionsTargetToday: profile.totalQuestionsTargetToday,
        currentTopicId,
      },
      currentTopic: currentTopic
        ? {
            id: currentTopic.id,
            title: currentTopic.title,
            description: currentTopic.description,
            whyItMatters: currentTopic.whyItMatters,
            estMinutes: currentTopic.estMinutes,
            masteryPercent: progress?.masteryPercent || currentTopic.masteryPercent || 0,
            status: progress?.status || currentTopic.status || 'in_progress',
          }
        : {
            id: 'js-event-loop',
            title: 'JavaScript Event Loop & Microtask Execution',
            description: 'Deep dive into task queues, MutationObserver callbacks, and event loop tick sequencing.',
            whyItMatters: 'Critical for non-blocking asynchronous I/O performance in browser and Node.js runtimes.',
            estMinutes: 25,
            masteryPercent: 42,
            status: 'in_progress',
          },
    });
  } catch (error: any) {
    console.error('[Dashboard GET API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch dashboard telemetry' },
      { status: 500 }
    );
  }
}
