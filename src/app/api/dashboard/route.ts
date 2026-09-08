import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { Lesson } from '@/lib/db/models/Lesson';
import { PracticeQuestion } from '@/lib/db/models/PracticeQuestion';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';

    await connectToDatabase();

    // 1. Fetch user profile
    let profile = await UserProfile.findOne({ userId }).lean();
    if (!profile) {
      profile = await UserProfile.create({
        userId,
        targetGoal: 'Full Stack Architect',
        experienceLevel: 'Intermediate',
        dailyCommitmentMinutes: 30,
        streakDays: 0,
        xp: 0,
        overallMastery: 0,
        completedQuestionsToday: 0,
        totalQuestionsTargetToday: 5,
        currentTopicId: '',
        onboardingCompletedAt: null,
      });
    }

    // 2. Fetch current active topic/node
    const currentTopicId = profile.currentTopicId || 'js-event-loop';
    const currentTopic = await RoadmapNode.findOne({ id: currentTopicId }).lean();

    // 3. Fetch node progress
    const progress = await UserNodeProgress.findOne({ userId, nodeId: currentTopicId }).lean();

    // 4. Check readiness of Lesson and Practice Questions
    const lessonDoc = await Lesson.findOne({ topicId: currentTopicId }).lean();
    const readyQuestionsCount = await PracticeQuestion.countDocuments({
      topicId: currentTopicId,
      $or: [{ status: 'ready' }, { status: { $exists: false } }],
    });

    const lessonStatus = lessonDoc ? lessonDoc.status || 'ready' : 'pending';
    const hasReadyQuestions = readyQuestionsCount > 0;

    return NextResponse.json({
      profile: {
        targetGoal: profile.targetGoal,
        experienceLevel: profile.experienceLevel,
        streakDays: profile.streakDays || 0,
        xp: profile.xp || 0,
        overallMastery: profile.overallMastery || 0,
        completedQuestionsToday: profile.completedQuestionsToday || 0,
        totalQuestionsTargetToday: profile.totalQuestionsTargetToday || 5,
        currentTopicId,
        onboardingCompletedAt: profile.onboardingCompletedAt || null,
      },
      contentStatus: {
        lessonStatus,
        hasReadyQuestions,
        readyQuestionsCount,
        isPreparing: lessonStatus === 'pending' || !hasReadyQuestions,
      },
      currentTopic: currentTopic
        ? {
            id: currentTopic.id,
            title: currentTopic.title,
            description: currentTopic.description,
            whyItMatters: currentTopic.whyItMatters,
            estMinutes: currentTopic.estMinutes,
            masteryPercent: progress?.masteryPercent || 0,
            status: progress?.status || 'available',
          }
        : null,
    });
  } catch (error: any) {
    console.error('[Dashboard GET API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch dashboard telemetry' },
      { status: 500 }
    );
  }
}
