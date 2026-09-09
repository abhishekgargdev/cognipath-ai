import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { processUserSkillsAndBuildRoadmap } from '@/lib/curriculum/roadmap-builder';

const onboardingBodySchema = z.object({
  targetGoal: z.string().min(1),
  customGoal: z.string().optional().nullable(),
  experienceLevel: z.enum(['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced']),
  selectedSkills: z
    .array(
      z.object({
        skillId: z.string(),
        name: z.string(),
        level: z.string(),
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

    const body = await req.json();
    const data = onboardingBodySchema.parse(body);

    await connectToDatabase();

    const finalGoal = data.customGoal ? data.customGoal : data.targetGoal;

    // 1. Upsert UserProfile document
    await UserProfile.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        targetGoal: finalGoal,
        customGoal: data.customGoal || null,
        experienceLevel: data.experienceLevel,
        dailyCommitmentMinutes: data.dailyCommitmentMinutes,
        learningReason: data.learningReason || null,
        learningPreferences: data.learningPreferences,
        lastActiveAt: new Date(),
        onboardingCompletedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 2. Build personalized skill-laddered roadmap dynamically
    const result = await processUserSkillsAndBuildRoadmap({
      userId: session.user.id,
      skills: data.selectedSkills,
      targetGoal: finalGoal,
      experienceLevel: data.experienceLevel,
      dailyCommitmentMinutes: data.dailyCommitmentMinutes,
    });

    return NextResponse.json({
      success: true,
      goal: finalGoal,
      enrolledSkillsCount: result.enrolledCount,
      nodesCount: result.nodeIds.length,
    });
  } catch (error: any) {
    console.error('[Onboarding Complete API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
