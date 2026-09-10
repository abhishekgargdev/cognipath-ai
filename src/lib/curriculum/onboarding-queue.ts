import { getRedisInstance } from '@/lib/ai/cache';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { processUserSkillsAndBuildRoadmap, UserSkillInputItem } from '@/lib/curriculum/roadmap-builder';

export interface OnboardingJobData {
  userId: string;
  userEmail?: string;
  userName?: string;
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
 * Execute the onboarding generation job asynchronously chunk-by-chunk with email alerts and content generation.
 */
export async function executeOnboardingJobAsync(userId: string, data: OnboardingJobData): Promise<void> {
  // Delegate to BullMQ worker workflow which executes start email -> roadmap creation -> complete email -> content gen -> content complete email -> Redis cleanup
  const { executeRoadmapWorkflowDirectly } = await import('@/lib/queue/workers');
  await executeRoadmapWorkflowDirectly({
    userId,
    email: data.userEmail || '',
    userName: data.userName || 'Learner',
    targetGoal: data.targetGoal,
    customGoal: data.customGoal,
    experienceLevel: data.experienceLevel,
    skills: data.selectedSkills,
    dailyCommitmentMinutes: data.dailyCommitmentMinutes,
  });
}

