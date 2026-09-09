import { getRedisInstance } from '@/lib/ai/cache';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { processUserSkillsAndBuildRoadmap, UserSkillInputItem } from '@/lib/curriculum/roadmap-builder';

export interface OnboardingJobData {
  userId: string;
  targetGoal: string;
  customGoal?: string | null;
  experienceLevel: 'Complete Beginner' | 'Beginner' | 'Intermediate' | 'Advanced';
  selectedSkills: UserSkillInputItem[];
  learningReason?: string | null;
  dailyCommitmentMinutes: number;
  learningPreferences: string[];
  createdAt: string;
  processedCount: number;
  totalCount: number;
  currentSkillName?: string;
}

export async function saveOnboardingJob(userId: string, data: OnboardingJobData): Promise<void> {
  const redis = getRedisInstance();
  if (redis) {
    try {
      await redis.set(`onboarding_job:${userId}`, JSON.stringify(data), { ex: 3600 });
    } catch (err) {
      console.warn('[OnboardingQueue] Redis set error:', err);
    }
  }
}

export async function getOnboardingJob(userId: string): Promise<OnboardingJobData | null> {
  const redis = getRedisInstance();
  if (redis) {
    try {
      const raw = await redis.get<string | OnboardingJobData>(`onboarding_job:${userId}`);
      if (raw) {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      }
    } catch (err) {
      console.warn('[OnboardingQueue] Redis get error:', err);
    }
  }
  return null;
}

export async function updateOnboardingJobProgress(
  userId: string,
  processedCount: number,
  currentSkillName?: string
): Promise<void> {
  const job = await getOnboardingJob(userId);
  if (job) {
    job.processedCount = processedCount;
    if (currentSkillName) job.currentSkillName = currentSkillName;
    await saveOnboardingJob(userId, job);
  }
}

export async function clearOnboardingJob(userId: string): Promise<void> {
  const redis = getRedisInstance();
  if (redis) {
    try {
      await redis.del(`onboarding_job:${userId}`);
    } catch (err) {
      console.warn('[OnboardingQueue] Redis del error:', err);
    }
  }
}

/**
 * Execute the onboarding generation job asynchronously chunk-by-chunk.
 */
export async function executeOnboardingJobAsync(userId: string, data: OnboardingJobData): Promise<void> {
  try {
    await connectToDatabase();

    const finalGoal = data.customGoal ? data.customGoal : data.targetGoal;

    // 1. Process skills and build roadmap dynamically
    await processUserSkillsAndBuildRoadmap({
      userId,
      skills: data.selectedSkills,
      targetGoal: finalGoal,
      experienceLevel: data.experienceLevel,
      dailyCommitmentMinutes: data.dailyCommitmentMinutes,
    });

    // 2. Mark UserProfile as completed
    await UserProfile.updateOne(
      { userId },
      {
        onboardingStatus: 'completed',
        onboardingCompletedAt: new Date(),
      }
    );

    // 3. Clear Redis Job
    await clearOnboardingJob(userId);
    console.log(`[OnboardingQueue] Successfully completed async onboarding generation for user ${userId}`);
  } catch (err) {
    console.error(`[OnboardingQueue] Error executing onboarding job for user ${userId}:`, err);
    // Even if AI task fails partially, mark completed so user is unblocked
    await UserProfile.updateOne(
      { userId },
      {
        onboardingStatus: 'completed',
        onboardingCompletedAt: new Date(),
      }
    ).catch(() => {});
  }
}
