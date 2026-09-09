import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { PracticeSubmission } from '@/lib/db/models/PracticeSubmission';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    await connectToDatabase();

    // 1. Fetch user profile
    const profile = await UserProfile.findOne({ userId }).lean();
    const targetGoal = profile?.targetGoal || 'Full Stack Developer';
    const streakDays = profile?.streakDays ?? 0;
    const xp = profile?.xp ?? 0;

    // 2. Fetch User Progress Rows & Nodes
    const allNodes = await RoadmapNode.find().sort({ sequenceOrder: 1 }).lean();
    const userProgressDocs = await UserNodeProgress.find({ userId }).lean();
    const progressMap = new Map(userProgressDocs.map((p) => [p.nodeId, p]));

    // 3. Aggregate Overall Mastery
    const totalNodesCount = allNodes.length;
    const aggregateMastery =
      totalNodesCount > 0
        ? Math.round(
            allNodes.reduce(
              (acc, n) => acc + (progressMap.get(n.id)?.masteryPercent ?? 0),
              0
            ) / totalNodesCount
          )
        : 0;

    // 4. Aggregate PracticeSubmission stats (Harness Accuracy)
    const submissionStats = await PracticeSubmission.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          passedSubmissions: { $sum: { $cond: ['$isPassed', 1, 0] } },
          avgScore: { $avg: '$score' },
        },
      },
    ]);

    const totalSubs = submissionStats[0]?.totalSubmissions || 0;
    const passedSubs = submissionStats[0]?.passedSubmissions || 0;
    const harnessAccuracy = totalSubs > 0 ? Math.round((passedSubs / totalSubs) * 100) : 0;

    // 5. Aggregate 30-Day Activity Heatmap
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyActivityAgg = await PracticeSubmission.aggregate([
      {
        $match: {
          userId,
          submittedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$submittedAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const activityMap = new Map<string, number>();
    dailyActivityAgg.forEach((item) => {
      activityMap.set(item._id, item.count);
    });

    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityMap.get(dateStr) || 0;
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : 3;
      days.push({ day: 30 - i, date: dateStr, count, level });
    }

    // 6. Aggregate Domain Distribution Index (Skills Breakdown)
    const categoryMap = new Map<
      string,
      { total: number; completed: number; totalMastery: number }
    >();

    for (const node of allNodes) {
      const catLabel = node.categoryLabel || node.category || 'General Track';
      const prog = progressMap.get(node.id);
      const mastery = prog?.masteryPercent ?? 0;
      const isCompleted = prog?.status === 'completed';

      const catData = categoryMap.get(catLabel) || {
        total: 0,
        completed: 0,
        totalMastery: 0,
      };
      catData.total += 1;
      if (isCompleted) catData.completed += 1;
      catData.totalMastery += mastery;
      categoryMap.set(catLabel, catData);
    }

    const skillsBreakdown = Array.from(categoryMap.entries()).map(([name, cat]) => {
      const avgPercent = cat.total > 0 ? Math.round(cat.totalMastery / cat.total) : 0;
      return {
        name,
        percent: avgPercent,
        mastered: `${cat.completed}/${cat.total} nodes`,
      };
    });

    // 7. Aggregate Deep Concept Dissection (Concept Drilldown)
    const conceptDrilldown = allNodes.slice(0, 8).map((node) => {
      const prog = progressMap.get(node.id);
      const percent = prog?.masteryPercent ?? 0;
      const status =
        prog?.status === 'completed'
          ? 'Mastered'
          : prog?.status === 'in_progress'
          ? 'Solid'
          : prog?.status === 'review_needed'
          ? 'Weak'
          : prog?.status === 'available'
          ? 'Available'
          : 'Locked';

      const isWeak =
        prog?.status === 'review_needed' || (percent > 0 && percent < 50);

      return {
        name: node.title,
        percent,
        status,
        isWeak,
      };
    });

    return NextResponse.json({
      aggregateMastery,
      harnessAccuracy,
      unbrokenCadence: streakDays,
      accreditedXp: xp,
      targetGoal,
      activityHeatmap: days,
      skillsBreakdown,
      conceptDrilldown,
    });
  } catch (error: any) {
    console.error('[Analytics Overview API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch analytics overview' },
      { status: 500 }
    );
  }
}
