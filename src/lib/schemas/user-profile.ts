import { z } from 'zod';

export const userProfileSchema = z.object({
  userId: z.string().min(1),
  targetGoal: z.string().default('Full Stack Architect'),
  customGoal: z.string().nullable().optional(),
  experienceLevel: z.enum(['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  dailyCommitmentMinutes: z.number().min(5).max(240).default(30),
  learningReason: z.string().nullable().optional(),
  learningPreferences: z.array(z.string()).default(['code-first', 'theoretical-monographs']),
  streakDays: z.number().min(0).default(0),
  xp: z.number().min(0).default(0),
  overallMastery: z.number().min(0).max(100).default(0),
  completedQuestionsToday: z.number().min(0).default(0),
  totalQuestionsTargetToday: z.number().min(1).default(5),
  currentTopicId: z.string().default(''),
  theme: z.enum(['light', 'dark', 'system']).default('light'),
  onboardingStatus: z.enum(['pending', 'processing', 'completed']).default('pending'),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
