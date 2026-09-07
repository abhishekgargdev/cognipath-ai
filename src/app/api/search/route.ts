import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongoose';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { Lesson } from '@/lib/db/models/Lesson';
import { PracticeQuestion } from '@/lib/db/models/PracticeQuestion';
import { SkillTaxonomy } from '@/lib/db/models/SkillTaxonomy';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    await connectToDatabase();

    if (!query) {
      const [nodes, skills] = await Promise.all([
        RoadmapNode.find({}).sort({ sequenceOrder: 1 }).limit(4).lean(),
        SkillTaxonomy.find({}).sort({ category: 1 }).limit(3).lean(),
      ]);

      return NextResponse.json({
        topics: nodes,
        skills,
      });
    }

    const regex = new RegExp(query, 'i');

    const [nodes, lessons, questions, skills] = await Promise.all([
      RoadmapNode.find({
        $or: [{ title: regex }, { description: regex }, { categoryLabel: regex }, { category: regex }],
      })
        .limit(5)
        .lean(),
      Lesson.find({
        $or: [{ title: regex }, { subtitle: regex }, { whyYouAreLearningThis: regex }],
      })
        .limit(5)
        .lean(),
      PracticeQuestion.find({
        $or: [{ title: regex }, { prompt: regex }, { whyThisMatters: regex }],
      })
        .limit(5)
        .lean(),
      SkillTaxonomy.find({
        $or: [{ name: regex }, { description: regex }, { category: regex }, { careerRelevance: regex }],
      })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      topics: nodes,
      lessons,
      questions,
      skills,
    });
  } catch (error: any) {
    console.error('[Search API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute global search' },
      { status: 500 }
    );
  }
}
