import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { RoadmapMilestone } from '@/lib/db/models/RoadmapMilestone';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { generateRoadmapTask } from '@/lib/ai/tasks/generate-roadmap';

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
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 2. Generate Roadmap via AI Abstraction Layer
    const roadmapData = await generateRoadmapTask({
      targetGoal: finalGoal,
      skillLevel: data.experienceLevel,
      existingSkills: data.selectedSkills.map((s) => s.name),
    });

    // 3. Upsert RoadmapMilestones & RoadmapNodes in Mongo
    for (const milestone of roadmapData.milestones) {
      await RoadmapMilestone.findOneAndUpdate(
        { id: milestone.id },
        { ...milestone, targetGoal: finalGoal },
        { upsert: true }
      );
    }

    for (const node of roadmapData.nodes) {
      await RoadmapNode.findOneAndUpdate(
        { id: node.id },
        node,
        { upsert: true }
      );
    }

    // 4. Initialize UserNodeProgress documents
    for (let i = 0; i < roadmapData.nodes.length; i++) {
      const node = roadmapData.nodes[i];
      const initialStatus =
        i === 0 || !node.prerequisites || node.prerequisites.length === 0
          ? 'available'
          : 'locked';

      await UserNodeProgress.findOneAndUpdate(
        { userId: session.user.id, nodeId: node.id },
        {
          userId: session.user.id,
          nodeId: node.id,
          status: initialStatus,
          masteryPercent: 0,
        },
        { upsert: true }
      );
    }

    // Set current topic ID on profile to first available node
    if (roadmapData.nodes.length > 0) {
      await UserProfile.updateOne(
        { userId: session.user.id },
        { currentTopicId: roadmapData.nodes[0].id }
      );
    }

    return NextResponse.json({
      success: true,
      goal: finalGoal,
      milestonesCount: roadmapData.milestones.length,
      nodesCount: roadmapData.nodes.length,
    });
  } catch (error: any) {
    console.error('[Onboarding Complete API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
