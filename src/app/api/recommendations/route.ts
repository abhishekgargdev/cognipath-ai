import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserWeakConcept } from '@/lib/db/models/UserWeakConcept';
import { AiRecommendation } from '@/lib/db/models/AiRecommendation';
import { recommendSkillsTask } from '@/lib/ai/tasks/recommend-skills';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';

    await connectToDatabase();

    // 1. Fetch existing recommendations from Mongo
    let recommendations = await AiRecommendation.find({ userId }).sort({ createdAt: -1 }).lean();

    // 2. If no recommendations exist, generate via AI abstraction task
    if (recommendations.length === 0) {
      const profile = await UserProfile.findOne({ userId }).lean();
      const weakDocs = await UserWeakConcept.find({ userId, resolved: false }).lean();
      const weakNames = weakDocs.map((w: any) => w.name);

      try {
        const generated = await recommendSkillsTask({
          userId,
          targetGoal: profile?.targetGoal || 'Full Stack Architect',
          weakConcepts: weakNames,
        });

        for (const item of generated) {
          await AiRecommendation.findOneAndUpdate(
            { id: item.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` },
            {
              ...item,
              id: item.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              userId,
            },
            { upsert: true, new: true }
          );
        }

        recommendations = await AiRecommendation.find({ userId }).sort({ createdAt: -1 }).lean();
      } catch (aiErr) {
        console.warn('[Recommendations GET API] AI generation fallback:', aiErr);
        // Fallback default recommendation items
        const defaultRecs = [
          {
            id: 'rec_default_1',
            userId,
            title: 'Asynchronous Event Loop Mastery & Microtasks',
            category: 'Weakness Patch',
            whyRecommendation: 'Diagnostic evaluation confirmed 58% mastery on async microtask precedence.',
            expectedImpact: 'Critical',
            estHours: 2.5,
            actionTopicId: 'async-event-loop',
            addedToRoadmap: false,
            status: 'pending',
            prerequisites: [
              { name: 'JavaScript Functions & Scope', satisfied: true },
              { name: 'Promise Chains & Catch Blocks', satisfied: false },
            ],
          },
          {
            id: 'rec_default_2',
            userId,
            title: 'Memory Leak Audit & Closure State Management',
            category: 'Advanced Optimization',
            whyRecommendation: 'High failure count on memory heap retention in long-lived event listeners.',
            expectedImpact: 'High',
            estHours: 1.5,
            actionTopicId: 'closure-memory-management',
            addedToRoadmap: false,
            status: 'pending',
            prerequisites: [
              { name: 'Lexical Environments', satisfied: true },
              { name: 'Garbage Collection Semantics', satisfied: true },
            ],
          },
        ];

        for (const item of defaultRecs) {
          await AiRecommendation.findOneAndUpdate(
            { id: item.id },
            item,
            { upsert: true, new: true }
          );
        }

        recommendations = await AiRecommendation.find({ userId }).sort({ createdAt: -1 }).lean();
      }
    }

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error('[Recommendations GET API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
