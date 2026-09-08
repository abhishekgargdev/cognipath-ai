import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { AiRecommendation } from '@/lib/db/models/AiRecommendation';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';

    await connectToDatabase();

    const profile = await UserProfile.findOne({ userId }).lean();
    const newRecommendationsCount = await AiRecommendation.countDocuments({
      userId,
      status: 'pending',
    });

    return NextResponse.json({
      completedQuestionsToday: profile?.completedQuestionsToday || 0,
      totalQuestionsTargetToday: profile?.totalQuestionsTargetToday || 5,
      newRecommendationsCount: newRecommendationsCount || 0,
      streakDays: profile?.streakDays || 0,
      xp: profile?.xp || 0,
      overallMastery: profile?.overallMastery || 0,
      currentTopicId: profile?.currentTopicId || 'js-event-loop',
    });
  } catch (error: any) {
    console.error('[Nav Summary API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch nav summary' },
      { status: 500 }
    );
  }
}
