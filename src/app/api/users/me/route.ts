import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { User } from '@/lib/db/models/User';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { SkillTaxonomy } from '@/lib/db/models/SkillTaxonomy';

const updateMeSchema = z.object({
  name: z.string().optional(),
  targetGoal: z.string().optional(),
  customGoal: z.string().optional().nullable(),
  experienceLevel: z.enum(['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced']).optional(),
  dailyCommitmentMinutes: z.number().min(5).max(240).optional(),
  learningReason: z.string().optional().nullable(),
  learningPreferences: z.array(z.string()).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  selectedSkills: z
    .array(
      z.object({
        skillId: z.string(),
        name: z.string(),
        level: z.string().optional().default('Beginner'),
      })
    )
    .optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    await connectToDatabase();

    // 1. Fetch User document
    let userDoc = await User.findOne({ id: userId }).lean();
    if (!userDoc && session.user.email) {
      userDoc = await User.findOne({ email: session.user.email }).lean();
    }

    // 2. Fetch UserProfile document
    let profileDoc = await UserProfile.findOne({ userId }).lean();
    if (!profileDoc) {
      profileDoc = await UserProfile.create({
        userId,
        targetGoal: 'Full Stack Architect',
        experienceLevel: 'Intermediate',
        dailyCommitmentMinutes: 30,
        theme: 'light',
        lastActiveAt: new Date(),
      });
    }

    // 3. Fetch User Skills
    const userSkillsDocs = await UserSkill.find({ userId }).lean();
    const taxonomyIds = userSkillsDocs.map((s) => s.skillId);
    const taxonomies = await SkillTaxonomy.find({ id: { $in: taxonomyIds } }).lean();
    const taxonomyMap = new Map(taxonomies.map((t) => [t.id, t.name]));

    const skills = userSkillsDocs.map((s) => ({
      skillId: s.skillId,
      name: s.name || taxonomyMap.get(s.skillId) || s.skillId,
      level: s.level || 'Beginner',
    }));

    return NextResponse.json({
      user: {
        name: userDoc?.name || session.user.name || 'Scholar',
        email: userDoc?.email || session.user.email || '',
        image: userDoc?.image || session.user.image || null,
      },
      profile: profileDoc,
      skills,
    });
  } catch (error: any) {
    console.error('[Users Me GET API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch user telemetry' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const data = updateMeSchema.parse(body);

    await connectToDatabase();

    // 1. Update User document if name provided
    if (data.name) {
      await User.updateOne(
        { $or: [{ id: userId }, { email: session.user.email }] },
        { name: data.name }
      );
    }

    // 2. Update UserProfile document
    const updatePayload: Record<string, any> = {
      lastActiveAt: new Date(),
    };

    if (data.targetGoal !== undefined) updatePayload.targetGoal = data.targetGoal;
    if (data.customGoal !== undefined) updatePayload.customGoal = data.customGoal;
    if (data.experienceLevel !== undefined) updatePayload.experienceLevel = data.experienceLevel;
    if (data.dailyCommitmentMinutes !== undefined) updatePayload.dailyCommitmentMinutes = data.dailyCommitmentMinutes;
    if (data.learningReason !== undefined) updatePayload.learningReason = data.learningReason;
    if (data.learningPreferences !== undefined) updatePayload.learningPreferences = data.learningPreferences;
    if (data.theme !== undefined) updatePayload.theme = data.theme;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updatePayload },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    // 3. Update UserSkill documents if selectedSkills provided
    if (data.selectedSkills && Array.isArray(data.selectedSkills)) {
      // Clear existing and replace with new selected skills
      await UserSkill.deleteMany({ userId });
      for (const skill of data.selectedSkills) {
        const validLevel = ['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced'].includes(skill.level)
          ? (skill.level as any)
          : 'Beginner';

        await UserSkill.create({
          userId,
          skillId: skill.skillId,
          name: skill.name,
          level: validLevel,
        });
      }
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('[Users Me PATCH API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
