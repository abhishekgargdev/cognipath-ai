import { z } from 'zod';

export const aiRecommendationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  whyRecommendation: z.string().min(1),
  expectedImpact: z.enum(['Critical', 'High', 'Medium', 'Elective']).default('High'),
  estHours: z.number().min(0.5).default(2),
  actionTopicId: z.string().min(1),
  addedToRoadmap: z.boolean().default(false),
  status: z.enum(['pending', 'accepted', 'dismissed']).default('pending'),
  prerequisites: z.array(
    z.object({
      name: z.string(),
      satisfied: z.boolean(),
    })
  ).optional(),
});

export type AiRecommendationInput = z.infer<typeof aiRecommendationSchema>;
