import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { PracticeQuestion } from '@/lib/db/models/PracticeQuestion';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';

    await connectToDatabase();

    // 1. Fetch user profile
    const profile = await UserProfile.findOne({ userId });
    const currentTopicId = profile?.currentTopicId || 'js-event-loop';

    // 2. Select today's 5 questions strictly from 'ready' PracticeQuestion docs
    const questions = await PracticeQuestion.find({
      topicId: currentTopicId,
      $or: [{ status: 'ready' }, { status: { $exists: false } }],
    })
      .sort({ sequenceOrder: 1, createdAt: 1 })
      .limit(5)
      .lean();

    const isPoolComplete = questions.length >= 5;
    const pendingCount = Math.max(0, 5 - questions.length);

    return NextResponse.json({
      status: isPoolComplete ? 'ready' : 'partial',
      pendingCount,
      questions,
      completedQuestionsToday: profile?.completedQuestionsToday || 0,
      totalQuestionsTargetToday: profile?.totalQuestionsTargetToday || 5,
      streakDays: profile?.streakDays || 1,
      currentTopicId,
    });
  } catch (error: any) {
    console.error('[Daily Practice GET API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch daily practice questions' },
      { status: 500 }
    );
  }
}
