import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';

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

    // 3. Update Subtopic State on RoadmapNode
    const subtopicIndex = node.subtopics.findIndex((st) => st.id === data.subtopicId);
    if (subtopicIndex >= 0) {
      node.subtopics[subtopicIndex].completed = data.completed;
      node.markModified('subtopics');
      await node.save();
    }

    // 4. Calculate Mastery Percentage & Node Status
    const totalSubtopics = node.subtopics.length;
    const completedSubtopics = node.subtopics.filter((st) => st.completed).length;
    const masteryPercent =
      totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

    let newStatus: 'locked' | 'available' | 'in_progress' | 'completed' | 'review_needed' =
      userProgress.status;

    if (completedSubtopics === totalSubtopics && totalSubtopics > 0) {
      newStatus = 'completed';
    } else if (completedSubtopics > 0) {
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

    // 5. If Node Completed: Check and Unlock Downstream Dependent Nodes
    if (newStatus === 'completed') {
      const allUserProgress = await UserNodeProgress.find({ userId: session.user.id });
      const completedNodeIds = new Set(
        allUserProgress.filter((p) => p.status === 'completed').map((p) => p.nodeId)
      );
      completedNodeIds.add(nodeId);

      // Find locked nodes
      const lockedProgressRows = allUserProgress.filter((p) => p.status === 'locked');
      for (const progressRow of lockedProgressRows) {
        const lockedNode = await RoadmapNode.findOne({ id: progressRow.nodeId });
        if (lockedNode && lockedNode.prerequisites && lockedNode.prerequisites.length > 0) {
          // Check if all prerequisites are completed
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
      node,
      userProgress: {
        nodeId: userProgress.nodeId,
        status: userProgress.status,
        masteryPercent: userProgress.masteryPercent,
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
