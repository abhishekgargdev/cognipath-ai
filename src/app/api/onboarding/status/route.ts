import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { getOnboardingJob, executeOnboardingJobAsync } from '@/lib/curriculum/onboarding-queue';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    await connectToDatabase();

    const profile = await UserProfile.findOne({ userId }).lean();
    if (!profile) {
      return NextResponse.json({
        onboardingStatus: 'pending',
        isCompleted: false,
        progressPercent: 0,
      });
    }

    const isCompleted = profile.onboardingStatus === 'completed' || Boolean(profile.onboardingCompletedAt);
    if (isCompleted) {
      return NextResponse.json({
        onboardingStatus: 'completed',
        isCompleted: true,
        progressPercent: 100,
      });
    }

    // Fetch job data from Redis & Mongo node progress count
    const job = await getOnboardingJob(userId);
    const userSkillsCount = await UserSkill.countDocuments({ userId });
    const userNodeProgressCount = await UserNodeProgress.countDocuments({ userId });

    const totalTargetCount = Math.max(1, job?.totalCount || userSkillsCount || 1);
    const completedNodesCount = userNodeProgressCount;

    let progressPercent = Math.min(95, Math.round((completedNodesCount / totalTargetCount) * 100));
    if (completedNodesCount >= totalTargetCount && totalTargetCount > 0) {
      progressPercent = 100;
      await UserProfile.updateOne(
        { userId },
        {
          onboardingStatus: 'completed',
          onboardingCompletedAt: new Date(),
        }
      );

      return NextResponse.json({
        onboardingStatus: 'completed',
        isCompleted: true,
        progressPercent: 100,
      });
    }

    // If job exists but worker hasn't finished, ensure async job trigger
    if (job && profile.onboardingStatus === 'processing' && completedNodesCount === 0) {
      executeOnboardingJobAsync(userId, job).catch((err) =>
        console.error('[Status API] Catchup trigger error:', err)
      );
    }

    return NextResponse.json({
      onboardingStatus: profile.onboardingStatus || 'processing',
      isCompleted: false,
      progressPercent: Math.max(15, progressPercent),
      processedCount: completedNodesCount,
      totalCount: totalTargetCount,
      currentSkillName: job?.currentSkillName || 'Skill Nodes',
    });
  } catch (error: any) {
    console.error('[Onboarding Status API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}
