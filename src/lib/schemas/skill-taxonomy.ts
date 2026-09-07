import { z } from 'zod';

export const skillTaxonomySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  prerequisites: z.array(z.string()).default([]),
  relatedSkills: z.array(z.string()).default([]),
  estHours: z.number().min(1).default(10),
  careerRelevance: z.string(),
  description: z.string(),
  trending: z.boolean().default(false),
});

export const userSkillSchema = z.object({
  userId: z.string().min(1),
  skillId: z.string().min(1),
  level: z.enum(['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
});

export type SkillTaxonomyInput = z.infer<typeof skillTaxonomySchema>;
export type UserSkillInput = z.infer<typeof userSkillSchema>;
