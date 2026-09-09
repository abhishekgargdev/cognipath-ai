import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserWeakConcept } from '@/lib/db/models/UserWeakConcept';
import { PracticeSubmission } from '@/lib/db/models/PracticeSubmission';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    await connectToDatabase();

    // 1. Mongo Aggregation Pipeline on UserWeakConcept
    let weakConcepts = await UserWeakConcept.aggregate([
      {
        $match: {
          userId,
          resolved: false,
        },
      },
      {
        $sort: {
          failureCount: -1,
          masteryPercent: 1,
        },
      },
      {
        $limit: 6,
      },
      {
        $project: {
          id: { $toString: '$_id' },
          name: 1,
          topicId: 1,
          category: 1,
          masteryPercent: 1,
          failureCount: 1,
          reason: 1,
          recommendedAction: 1,
        },
      },
    ]);

    // 2. Fallback: If no UserWeakConcept documents exist, query failed PracticeSubmissions
    if (weakConcepts.length === 0) {
      const failedSubmissions = await PracticeSubmission.aggregate([
        {
          $match: {
            userId,
            isPassed: false,
          },
        },
        {
          $group: {
            _id: '$questionId',
            failureCount: { $sum: 1 },
            avgScore: { $avg: '$score' },
            latestSubmission: { $last: '$$ROOT' },
          },
        },
        { $limit: 4 },
      ]);

      if (failedSubmissions.length > 0) {
        weakConcepts = failedSubmissions.map((sub: any, idx: number) => ({
          id: `weak_${sub._id}_${idx}`,
          name: `Practice Topic: ${sub._id}`,
          topicId: sub.latestSubmission?.topicId || 'js-event-loop',
          category: 'Practicum Evaluation',
          masteryPercent: Math.round(sub.avgScore || 45),
          failureCount: sub.failureCount,
          reason: `Detected ${sub.failureCount} failed test harness assertions. Edge cases or syntax errors present.`,
          recommendedAction: 'Review topic monograph and attempt practicum exercises.',
        }));
      }
    }

    return NextResponse.json({ weakConcepts });
  } catch (error: any) {
    console.error('[Analytics Weak Concepts API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch weak concepts analytics' },
      { status: 500 }
    );
  }
}
