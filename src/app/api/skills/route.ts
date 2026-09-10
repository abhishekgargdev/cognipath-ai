import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { SkillTaxonomy } from '@/lib/db/models/SkillTaxonomy';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { processUserSkillsAndBuildRoadmap } from '@/lib/curriculum/roadmap-builder';

const DEFAULT_SKILLS = [
  {
    id: 'skill-js',
    name: 'JavaScript (ES2024+)',
    category: 'Programming',
    difficulty: 'Intermediate',
    prerequisites: ['HTML5 & DOM Basics'],
    relatedSkills: ['TypeScript', 'Node.js', 'React'],
    estHours: 40,
    careerRelevance: 'Ubiquitous foundation for modern full-stack web and serverless software development.',
    description: 'Master lexical environments, closures, prototypal inheritance, event-loop priority, and asynchronous patterns.',
    trending: true,
  },
  {
    id: 'skill-ts',
    name: 'TypeScript Architectures',
    category: 'Programming',
    difficulty: 'Intermediate',
    prerequisites: ['JavaScript (ES2024+)'],
    relatedSkills: ['React', 'Next.js', 'Node.js'],
    estHours: 30,
    careerRelevance: 'Industry standard for enterprise web applications, offering strict type safety and static analysis.',
    description: 'Advanced generics, conditional types, mapped types, template literal types, and AST transformations.',
    trending: true,
  },
  {
    id: 'skill-react',
    name: 'React & Server Components',
    category: 'Frontend',
    difficulty: 'Intermediate',
    prerequisites: ['JavaScript (ES2024+)', 'HTML5 & DOM Basics'],
    relatedSkills: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    estHours: 45,
    careerRelevance: 'Dominant UI library for responsive web applications and design system engineering.',
    description: 'Hooks lifecycle, concurrent rendering, server components, state management, and reconciliation performance.',
    trending: true,
  },
  {
    id: 'skill-nextjs',
    name: 'Next.js App Router Architecture',
    category: 'Frontend',
    difficulty: 'Advanced',
    prerequisites: ['React & Server Components', 'TypeScript Architectures'],
    relatedSkills: ['React', 'TypeScript', 'Tailwind CSS'],
    estHours: 35,
    careerRelevance: 'Leading full-stack framework powering high-performance production applications.',
    description: 'Server Actions, streaming SSR, parallel routes, intercepting routes, caching layers, and middleware.',
    trending: true,
  },
  {
    id: 'skill-dsa',
    name: 'Data Structures & Algorithms',
    category: 'Engineering',
    difficulty: 'Advanced',
    prerequisites: ['JavaScript (ES2024+)'],
    relatedSkills: ['Python', 'System Design'],
    estHours: 60,
    careerRelevance: 'Core evaluation benchmark for senior technical interviews and algorithmic problem solving.',
    description: 'Arrays, trees, graphs, dynamic programming, sliding window, and Big-O asymptotic analysis.',
    trending: true,
  },
  {
    id: 'skill-mongodb',
    name: 'MongoDB & Atlas Document Databases',
    category: 'Databases',
    difficulty: 'Intermediate',
    prerequisites: ['Node.js & Express'],
    relatedSkills: ['Node.js', 'PostgreSQL', 'Redis'],
    estHours: 25,
    careerRelevance: 'Leading NoSQL database for rapid schema iteration and flexible aggregation pipelines.',
    description: 'Document modelling, compound indexes, aggregation pipelines, transaction locks, and Atlas search.',
    trending: false,
  },
];

const postSkillsSchema = z.object({
  selectedSkills: z.array(
    z.object({
      skillId: z.string().optional(),
      name: z.string(),
      level: z.string().optional(),
    })
  ),
});

export async function GET() {
  try {
    const session = await auth();
    await connectToDatabase();

    let skills = await SkillTaxonomy.find({}).sort({ category: 1, name: 1 }).lean();

    if (skills.length === 0) {
      for (const item of DEFAULT_SKILLS) {
        await SkillTaxonomy.findOneAndUpdate({ id: item.id }, item, { upsert: true });
      }
      skills = await SkillTaxonomy.find({}).sort({ category: 1, name: 1 }).lean();
    }

    let userSkills: Array<{ skillId: string; name: string; level?: string }> = [];

    if (session?.user?.id) {
      const userSkillsDocs = await UserSkill.find({ userId: session.user.id }).lean();
      const taxonomyMap = new Map(skills.map((s) => [s.id, s.name]));

      userSkills = userSkillsDocs.map((s) => ({
        skillId: s.skillId,
        name: s.name || taxonomyMap.get(s.skillId) || s.skillId,
        level: s.level || 'Beginner',
      }));
    }

    return NextResponse.json({ skills, userSkills });
  } catch (error: any) {
    console.error('[Skills GET API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch skills catalog' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { selectedSkills } = postSkillsSchema.parse(body);

    await connectToDatabase();

    const profile = await UserProfile.findOne({ userId }).lean();
    const targetGoal = profile?.targetGoal || 'Full Stack Architect';
    const experienceLevel = profile?.experienceLevel || 'Intermediate';
    const dailyCommitmentMinutes = profile?.dailyCommitmentMinutes || 30;

    const userEmail = session?.user?.email || '';
    const userName = session?.user?.name || 'Learner';

    // Mark status processing while background workflow runs
    await UserProfile.updateOne({ userId }, { onboardingStatus: 'processing' });

    // Trigger async BullMQ roadmap workflow (Start Email -> Build Roadmap -> Roadmap Complete Email -> Content Gen -> Content Complete Email -> Clear Redis Job)
    const { enqueueRoadmapWorkflow } = await import('@/lib/queue/bullmq');
    enqueueRoadmapWorkflow({
      userId,
      email: userEmail,
      userName,
      targetGoal,
      experienceLevel,
      skills: selectedSkills,
      dailyCommitmentMinutes,
    }).catch((err) => {
      console.error('[Skills POST] Async background execution failed:', err);
    });

    // Also run immediate build for synchronous return compatibility
    const result = await processUserSkillsAndBuildRoadmap({
      userId,
      skills: selectedSkills,
      targetGoal,
      experienceLevel,
      dailyCommitmentMinutes,
    });

    return NextResponse.json({
      success: true,
      enrolledCount: result.enrolledCount,
      nodeIds: result.nodeIds,
      status: 'processing',
    });
  } catch (error: any) {
    console.error('[Skills POST API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync user skills' },
      { status: 500 }
    );
  }
}
