import { z } from 'zod';

export const lessonSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  codeSnippet: z.object({
    language: z.string(),
    code: z.string(),
    caption: z.string().optional(),
  }).optional(),
  highlightNote: z.string().optional(),
  calloutType: z.enum(['info', 'warning', 'tip']).optional(),
  sequenceOrder: z.number().default(0),
});

export const lessonAntiPatternSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  mistakeCode: z.string().min(1),
  correctionCode: z.string().min(1),
  explanation: z.string().min(1),
  sequenceOrder: z.number().optional().default(0),
});

export const lessonKnowledgeCheckSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().min(0),
  explanation: z.string().min(1),
  sequenceOrder: z.number().optional().default(0),
});

export const lessonSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  estimatedMinutes: z.number().min(1).default(30),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  masteryLevel: z.number().default(0),
  whyYouAreLearningThis: z.string().min(1),
  keyTakeaways: z.array(z.string()).default([]),
  sections: z.array(lessonSectionSchema).default([]),
  antiPatterns: z.array(lessonAntiPatternSchema).default([]),
  knowledgeCheck: z.array(lessonKnowledgeCheckSchema).optional().default([]),
});

export type LessonSectionInput = z.infer<typeof lessonSectionSchema>;
export type LessonAntiPatternInput = z.infer<typeof lessonAntiPatternSchema>;
export type LessonKnowledgeCheckInput = z.infer<typeof lessonKnowledgeCheckSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
