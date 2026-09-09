import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import {
  saveOnboardingJob,
  executeOnboardingJobAsync,
  OnboardingJobData,
} from '@/lib/curriculum/onboarding-queue';

const onboardingBodySchema = z.object({
  targetGoal: z.string().min(1),
  customGoal: z.string().optional().nullable(),
  experienceLevel: z.enum(['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced']),
  selectedSkills: z
    .array(
      z.object({
        skillId: z.string().optional(),
        name: z.string(),
        level: z.string().optional(),
      })
    )
    .default([]),
  learningReason: z.string().optional().nullable(),
  dailyCommitmentMinutes: z.number().min(5).max(240).default(30),
  learningPreferences: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const data = onboardingBodySchema.parse(body);

    await connectToDatabase();

    const finalGoal = data.customGoal ? data.customGoal : data.targetGoal;

    // 1. Immediately mark UserProfile status as 'processing'
    await UserProfile.findOneAndUpdate(
      { userId },
      {
        userId,
        targetGoal: finalGoal,
        customGoal: data.customGoal || null,
        experienceLevel: data.experienceLevel,
        dailyCommitmentMinutes: data.dailyCommitmentMinutes,
        learningReason: data.learningReason || null,
        learningPreferences: data.learningPreferences,
        lastActiveAt: new Date(),
        onboardingStatus: 'processing',
        onboardingCompletedAt: null,
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 2. Build Job Data payload for Redis queue
    const jobData: OnboardingJobData = {
      userId,
      targetGoal: finalGoal,
      customGoal: data.customGoal,
      experienceLevel: data.experienceLevel,
      selectedSkills: data.selectedSkills,
      learningReason: data.learningReason,
      dailyCommitmentMinutes: data.dailyCommitmentMinutes,
      learningPreferences: data.learningPreferences,
      createdAt: new Date().toISOString(),
      processedCount: 0,
      totalCount: data.selectedSkills.length || 1,
    };

    // Save job to Upstash Redis
    await saveOnboardingJob(userId, jobData);

    // 3. Trigger async generation background task WITHOUT blocking HTTP response
    executeOnboardingJobAsync(userId, jobData).catch((err) => {
      console.error('[Onboarding Complete] Async background execution failed:', err);
    });

    // 4. Return instant HTTP response (< 100ms) to eliminate 504 timeout completely
    return NextResponse.json({
      success: true,
      status: 'processing',
      userId,
      goal: finalGoal,
      skillsCount: data.selectedSkills.length,
    });
  } catch (error: any) {
    console.error('[Onboarding Complete API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
