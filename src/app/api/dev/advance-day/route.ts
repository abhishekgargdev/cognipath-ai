import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Forbidden in production environment' }, { status: 403 });
  }

  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';

    const body = await req.json().catch(() => ({}));
    const daysToAdvance = typeof body.days === 'number' && body.days > 0 ? body.days : 1;

    await connectToDatabase();

    // 1. Shift user's node availableFrom dates backward by daysToAdvance days
    const userProgressList = await UserNodeProgress.find({ userId });
    const shiftMs = daysToAdvance * 24 * 60 * 60 * 1000;

    for (const progress of userProgressList) {
      if (progress.availableFrom) {
        progress.availableFrom = new Date(progress.availableFrom.getTime() - shiftMs);
        await progress.save();
      }
    }

    // 2. Evaluate drip unlock criteria for user's locked nodes
    const updatedProgressList = await UserNodeProgress.find({ userId });
    const completedOrMasteredNodeIds = new Set(
      updatedProgressList
        .filter((p) => p.status === 'completed' || p.masteryPercent >= 60)
        .map((p) => p.nodeId)
    );

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    let nodesUnlockedCount = 0;

    for (const progress of updatedProgressList) {
      if (progress.status === 'locked') {
        const nodeDoc = await RoadmapNode.findOne({ id: progress.nodeId }).lean();
        const prereqs = nodeDoc?.prerequisites || [];
        const prereqsMet = prereqs.every((prereqId) => completedOrMasteredNodeIds.has(prereqId));
        const availableFromMet = !progress.availableFrom || progress.availableFrom <= tomorrow;

        if (prereqsMet && availableFromMet) {
          progress.status = 'available';
          await progress.save();
          nodesUnlockedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      daysAdvanced: daysToAdvance,
      nodesUnlockedCount,
      updatedProgress: await UserNodeProgress.find({ userId }).lean(),
    });
  } catch (error: any) {
    console.error('[Dev Advance Day API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to advance day' },
      { status: 500 }
    );
  }
}
