import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { UserProfile } from '@/lib/db/models/UserProfile';

const progressBodySchema = z.object({
  subtopicId: z.string().min(1),
  completed: z.boolean(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: nodeId } = await params;
    const body = await req.json();
    const data = progressBodySchema.parse(body);

    await connectToDatabase();

    // 1. Fetch Node & UserNodeProgress
    const node = await RoadmapNode.findOne({ id: nodeId });
    if (!node) {
      return NextResponse.json({ error: 'Roadmap node not found' }, { status: 404 });
    }

    let userProgress = await UserNodeProgress.findOne({
      userId: session.user.id,
      nodeId,
    });

    if (!userProgress) {
      return NextResponse.json(
        { error: 'User progress for node not found' },
        { status: 404 }
      );
    }

    // 2. Server-side Enforcement: Can't complete subtopics on a locked node
    if (userProgress.status === 'locked') {
      return NextResponse.json(
        {
          error:
            'Cannot complete subtopics or update progress on a locked roadmap node. Prerequisites must be completed first.',
        },
        { status: 400 }
      );
    }

    // 3. Update Subtopic Array on UserNodeProgress (Per-User)
    const currentCompleted = new Set(userProgress.completedSubtopics || []);
    if (data.completed) {
      currentCompleted.add(data.subtopicId);
    } else {
      currentCompleted.delete(data.subtopicId);
    }
    userProgress.completedSubtopics = Array.from(currentCompleted);

    // 4. Calculate Mastery Percentage & Node Status
    const totalSubtopics = node.subtopics.length;
    const completedCount = userProgress.completedSubtopics.length;
    const masteryPercent =
      totalSubtopics > 0 ? Math.round((completedCount / totalSubtopics) * 100) : 0;

    let newStatus: 'locked' | 'available' | 'in_progress' | 'completed' | 'review_needed' =
      userProgress.status;

    if (completedCount === totalSubtopics && totalSubtopics > 0) {
      newStatus = 'completed';
    } else if (completedCount > 0) {
      newStatus = 'in_progress';
    } else {
      newStatus = 'available';
    }

    userProgress.masteryPercent = masteryPercent;
    userProgress.status = newStatus;
    if (newStatus === 'completed' && !userProgress.completedAt) {
      userProgress.completedAt = new Date();
    }
    await userProgress.save();

    // 5. Sync UserProfile overallMastery
    const allUserProgress = await UserNodeProgress.find({ userId: session.user.id });
    if (allUserProgress.length > 0) {
      const overallMastery = Math.round(
        allUserProgress.reduce((acc, p) => acc + (p.masteryPercent || 0), 0) / allUserProgress.length
      );
      await UserProfile.updateOne(
        { userId: session.user.id },
        { overallMastery, lastActiveAt: new Date() }
      );
    }

    // 6. If Node Completed: Check and Unlock Downstream Dependent Nodes
    if (newStatus === 'completed') {
      const completedNodeIds = new Set(
        allUserProgress.filter((p) => p.status === 'completed').map((p) => p.nodeId)
      );
      completedNodeIds.add(nodeId);

      const lockedProgressRows = allUserProgress.filter((p) => p.status === 'locked');
      for (const progressRow of lockedProgressRows) {
        const lockedNode = await RoadmapNode.findOne({ id: progressRow.nodeId });
        if (lockedNode && lockedNode.prerequisites && lockedNode.prerequisites.length > 0) {
          const allPrereqsMet = lockedNode.prerequisites.every(
            (prereqIdOrTitle) =>
              completedNodeIds.has(prereqIdOrTitle) ||
              allUserProgress.some(
                (p) => p.status === 'completed' && p.nodeId === prereqIdOrTitle
              )
          );

          if (allPrereqsMet) {
            progressRow.status = 'available';
            await progressRow.save();
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      userProgress: {
        nodeId: userProgress.nodeId,
        status: userProgress.status,
        masteryPercent: userProgress.masteryPercent,
        completedSubtopics: userProgress.completedSubtopics,
      },
    });
  } catch (error: any) {
    console.error('[Roadmap Progress API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update node progress' },
      { status: 500 }
    );
  }
}
