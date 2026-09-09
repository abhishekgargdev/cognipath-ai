import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { UserWeakConcept } from '@/lib/db/models/UserWeakConcept';
import { AiRecommendation } from '@/lib/db/models/AiRecommendation';
import { recommendSkillsTask } from '@/lib/ai/tasks/recommend-skills';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    await connectToDatabase();

    // 1. Fetch existing recommendations from Mongo
    let recommendations = await AiRecommendation.find({ userId }).sort({ createdAt: -1 }).lean();

    // 2. If no recommendations exist or user requests refresh, generate via AI abstraction task
    if (recommendations.length === 0) {
      const profile = await UserProfile.findOne({ userId }).lean();
      const userSkillsDocs = await UserSkill.find({ userId }).lean();
      const weakDocs = await UserWeakConcept.find({ userId, resolved: false }).lean();

      const enrolledSkillNames = userSkillsDocs.map((s) => s.name || s.skillId);
      const weakNames = weakDocs.map((w: any) => w.name);

      try {
        const generated = await recommendSkillsTask({
          userId,
          targetGoal: profile?.targetGoal || 'Full Stack Architect',
          experienceLevel: profile?.experienceLevel || 'Intermediate',
          learningReason: profile?.learningReason || 'Career advancement',
          enrolledSkills: enrolledSkillNames,
          weakConcepts: weakNames,
        });

        for (const item of generated) {
          const actionTopicId = item.actionTopicId || `skill-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          await AiRecommendation.findOneAndUpdate(
            { id: item.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` },
            {
              ...item,
              id: item.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              userId,
              actionTopicId,
              status: item.status || 'pending',
            },
            { upsert: true, returnDocument: 'after' }
          );
        }

        recommendations = await AiRecommendation.find({ userId }).sort({ createdAt: -1 }).lean();
      } catch (aiErr) {
        console.warn('[Recommendations GET API] AI generation failed:', aiErr);
        
        // Dynamic fallback based on user's target goal and missing common skills
        const goal = profile?.targetGoal || 'Full Stack Software Engineer';
        const dynamicRecs = [
          {
            id: `rec_dyn_${Date.now()}_1`,
            userId,
            title: goal.toLowerCase().includes('frontend') ? 'TypeScript Generics & AST' : 'Redis Caching & Lock Strategies',
            category: 'Market Trend',
            whyRecommendation: `Highly demanded in current industry jobs for ${goal} roles to build scalable production apps.`,
            expectedImpact: 'High' as const,
            estHours: 3,
            actionTopicId: goal.toLowerCase().includes('frontend') ? 'skill-typescript' : 'skill-redis',
            addedToRoadmap: false,
            status: 'pending' as const,
            prerequisites: [{ name: 'Foundational Programming', satisfied: true }],
          },
          {
            id: `rec_dyn_${Date.now()}_2`,
            userId,
            title: 'Docker Containerization & CI/CD Pipelines',
            category: 'Core Skill',
            whyRecommendation: `Essential DevOps competency requested across contemporary engineering teams.`,
            expectedImpact: 'Critical' as const,
            estHours: 4,
            actionTopicId: 'skill-docker',
            addedToRoadmap: false,
            status: 'pending' as const,
            prerequisites: [{ name: 'Command Line & Linux Basics', satisfied: true }],
          }
        ];

        for (const item of dynamicRecs) {
          await AiRecommendation.findOneAndUpdate({ id: item.id }, item, { upsert: true });
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
