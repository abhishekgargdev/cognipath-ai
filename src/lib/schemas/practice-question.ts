import { z } from 'zod';

export const practiceTestCaseSchema = z.object({
  id: z.string().min(1),
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(false),
  sequenceOrder: z.number().default(0),
});

export const practiceSolutionApproachSchema = z.object({
  id: z.string().min(1),
  rank: z.number().min(1).default(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  paradigm: z.string().min(1),
  timeComplexity: z.string().min(1),
  spaceComplexity: z.string().min(1),
  code: z.string().min(1),
  language: z.string().default('javascript'),
  explanation: z.string().min(1),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  whenToUse: z.string().min(1),
});

export const conceptExplanationSchema = z.object({
  id: z.string().optional(),
  topic: z.string().min(1),
  theoreticalFoundation: z.string().min(1),
  underlyingMechanics: z.string().min(1),
  stepByStepTrace: z.array(z.string()).default([]),
  architecturalTakeaways: z.string().min(1),
  commonPitfalls: z.array(z.string()).default([]),
});

export const practiceQuestionOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  code: z.string().optional(),
});

export const practiceQuestionSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  type: z.enum(['concept', 'mcq', 'output_prediction', 'coding', 'debugging', 'scenario']).default('coding'),
  typeLabel: z.string().min(1),
  title: z.string().min(1),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).default('Intermediate'),
  estMinutes: z.number().min(1).default(15),
  whyThisMatters: z.string().min(1),
  prompt: z.string().min(1),
  codeSnippet: z.string().optional(),
  options: z.array(practiceQuestionOptionSchema).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  starterCode: z.string().optional(),
  language: z.string().default('javascript'),
  sequenceOrder: z.number().default(0),
  testCases: z.array(practiceTestCaseSchema).default([]),
  solutionApproaches: z.array(practiceSolutionApproachSchema).default([]),
  conceptExplanation: conceptExplanationSchema.optional(),
});

export type PracticeTestCaseInput = z.infer<typeof practiceTestCaseSchema>;
export type PracticeSolutionApproachInput = z.infer<typeof practiceSolutionApproachSchema>;
export type ConceptExplanationInput = z.infer<typeof conceptExplanationSchema>;
export type PracticeQuestionInput = z.infer<typeof practiceQuestionSchema>;
