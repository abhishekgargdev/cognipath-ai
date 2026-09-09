import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { AiRecommendation } from '@/lib/db/models/AiRecommendation';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { processUserSkillsAndBuildRoadmap } from '@/lib/curriculum/roadmap-builder';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await params;

    await connectToDatabase();

    // 1. Find recommendation document
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id) && id.length === 24;
    const rec = await AiRecommendation.findOne(
      isValidObjectId ? { $or: [{ id }, { _id: id }] } : { id }
    );

    if (!rec) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    // 2. Mark recommendation as accepted and added to roadmap
    rec.status = 'accepted';
    rec.addedToRoadmap = true;
    await rec.save();

    // 3. Fetch existing user skills and add recommended skill
    const profile = await UserProfile.findOne({ userId }).lean();
    const existingSkillsDocs = await UserSkill.find({ userId }).lean();

    const existingSkills = existingSkillsDocs.map((s) => ({
      skillId: s.skillId,
      name: s.name || s.skillId,
      level: s.level || 'Beginner',
    }));

    // Add recommended skill if not present
    const exists = existingSkills.some(
      (s) => s.skillId === rec.actionTopicId || s.name.toLowerCase() === rec.title.toLowerCase()
    );

    if (!exists) {
      existingSkills.push({
        skillId: rec.actionTopicId,
        name: rec.title,
        level: 'Intermediate',
      });
    }

    // 4. Build dynamic laddered roadmap for updated skills roster
    await processUserSkillsAndBuildRoadmap({
      userId,
      skills: existingSkills,
      targetGoal: profile?.targetGoal || 'Full Stack Architect',
      experienceLevel: profile?.experienceLevel || 'Intermediate',
      dailyCommitmentMinutes: profile?.dailyCommitmentMinutes || 30,
    });

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
