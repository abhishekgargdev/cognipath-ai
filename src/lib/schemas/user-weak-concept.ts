import { z } from 'zod';

export const userWeakConceptSchema = z.object({
  userId: z.string().min(1),
  topicId: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  masteryPercent: z.number().min(0).max(100).default(0),
  failureCount: z.number().min(1).default(1),
  reason: z.string().min(1),
  recommendedAction: z.string().min(1),
  resolved: z.boolean().default(false),
});

export type UserWeakConceptInput = z.infer<typeof userWeakConceptSchema>;
