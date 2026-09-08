import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { User } from '@/lib/db/models/User';

const updateMeSchema = z.object({
  name: z.string().optional(),
  targetGoal: z.string().optional(),
  dailyCommitmentMinutes: z.number().min(5).max(240).optional(),
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

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';

    const body = await req.json();
    const data = updateMeSchema.parse(body);

    await connectToDatabase();

    // 1. Update User document if name provided
    if (data.name) {
      await User.updateOne({ id: userId }, { name: data.name });
    }

    // 2. Update UserProfile document
    const updatePayload: Record<string, any> = {
      lastActiveAt: new Date(),
    };

    if (data.targetGoal !== undefined) updatePayload.targetGoal = data.targetGoal;
    if (data.dailyCommitmentMinutes !== undefined) updatePayload.dailyCommitmentMinutes = data.dailyCommitmentMinutes;
    if (data.theme !== undefined) updatePayload.theme = data.theme;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: updatePayload },
      { upsert: true, returnDocument: 'after' }
    ).lean();

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
