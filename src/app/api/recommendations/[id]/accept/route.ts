import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { AiRecommendation } from '@/lib/db/models/AiRecommendation';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';
    const { id } = await params;

    await connectToDatabase();

    // 1. Find recommendation document
    const rec = await AiRecommendation.findOne({
      $or: [{ id }, { _id: id }],
    });

    if (!rec) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    // 2. Mark recommendation as accepted and added to roadmap
    rec.status = 'accepted';
    rec.addedToRoadmap = true;
    await rec.save();

    // 3. Insert / update RoadmapNode in Mongo
    await RoadmapNode.findOneAndUpdate(
      { id: rec.actionTopicId },
      {
        id: rec.actionTopicId,
        milestoneId: 'milestone-adaptive',
        title: rec.title,
        description: rec.whyRecommendation,
        category: rec.category || 'Adaptive Acquisition',
        estMinutes: Math.round((rec.estHours || 2) * 60),
        subtopicsCount: 3,
        practiceQuestionsCount: 5,
        sequenceOrder: 99,
        prerequisites: (rec.prerequisites || []).map((p: any) => p.name),
      },
      { upsert: true, new: true }
    );

    // 4. Insert / update UserNodeProgress in Mongo
    await UserNodeProgress.findOneAndUpdate(
      { userId, nodeId: rec.actionTopicId },
      {
        userId,
        nodeId: rec.actionTopicId,
        status: 'available',
        masteryPercent: 0,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      recommendation: rec,
    });
  } catch (error: any) {
    console.error('[Accept Recommendation API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to accept recommendation' },
      { status: 500 }
    );
  }
}
