import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { SkillTaxonomy } from '@/lib/db/models/SkillTaxonomy';

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
    id: 'skill-[#mongodb]',
    idAlias: 'skill-mongodb',
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

export async function GET() {
  try {
    await connectToDatabase();

    let skills = await SkillTaxonomy.find({}).sort({ category: 1, name: 1 }).lean();

    if (skills.length === 0) {
      for (const item of DEFAULT_SKILLS) {
        const itemToSave = { ...item, id: item.idAlias || item.id };
        delete itemToSave.idAlias;
        await SkillTaxonomy.findOneAndUpdate({ id: itemToSave.id }, itemToSave, { upsert: true });
      }
      skills = await SkillTaxonomy.find({}).sort({ category: 1, name: 1 }).lean();
    }

    return NextResponse.json({ skills });
  } catch (error: any) {
    console.error('[Skills GET API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch skills catalog' },
      { status: 500 }
    );
  }
}
