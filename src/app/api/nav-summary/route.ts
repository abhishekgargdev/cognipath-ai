import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { AiRecommendation } from '@/lib/db/models/AiRecommendation';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    await connectToDatabase();

    const profile = await UserProfile.findOne({ userId }).lean();
    let currentTopicId = profile?.currentTopicId;
    if (!currentTopicId) {
      const firstNode = await UserNodeProgress.findOne({ userId }).sort({ unlockDay: 1 }).lean();
      if (firstNode?.nodeId) {
        currentTopicId = firstNode.nodeId;
      }
    }

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
      currentTopicId: currentTopicId || '',
    });
  } catch (error: any) {
    console.error('[Nav Summary API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch nav summary' },
      { status: 500 }
    );
  }
}
