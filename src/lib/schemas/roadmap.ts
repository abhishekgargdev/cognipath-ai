import { z } from 'zod';

export const roadmapSubtopicSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  sequenceOrder: z.number().default(0),
  completed: z.boolean().default(false),
});

export const roadmapNodeSchema = z.object({
  id: z.string().min(1),
  milestoneId: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  categoryLabel: z.string().min(1),
  status: z.enum(['locked', 'available', 'in_progress', 'completed', 'review_needed']).default('locked'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Beginner'),
  estMinutes: z.number().min(1).default(45),
  masteryPercent: z.number().min(0).max(100).default(0),
  prerequisites: z.array(z.string()).default([]),
  whyItMatters: z.string(),
  description: z.string(),
  sequenceOrder: z.number().default(0),
  subtopics: z.array(roadmapSubtopicSchema).default([]),
});

export const roadmapMilestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  sequenceOrder: z.number().default(0),
  targetGoal: z.string().default('Full Stack Architect'),
  nodeIds: z.array(z.string()).default([]),
});

export const userNodeProgressSchema = z.object({
  userId: z.string().min(1),
  nodeId: z.string().min(1),
  status: z.enum(['locked', 'available', 'in_progress', 'completed', 'review_needed']).default('locked'),
  masteryPercent: z.number().min(0).max(100).default(0),
  startedAt: z.date().nullable().optional(),
  completedAt: z.date().nullable().optional(),
  reviewFlaggedAt: z.date().nullable().optional(),
});

export type RoadmapNodeInput = z.infer<typeof roadmapNodeSchema>;
export type RoadmapMilestoneInput = z.infer<typeof roadmapMilestoneSchema>;
export type UserNodeProgressInput = z.infer<typeof userNodeProgressSchema>;
