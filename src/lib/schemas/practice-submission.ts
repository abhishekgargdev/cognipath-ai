import { z } from 'zod';

export const diagnosticEvaluationSchema = z.object({
  whatYouDidWell: z.array(z.string()).default([]),
  whatCouldBeImproved: z.array(z.string()).default([]),
  conceptsDemonstrated: z.array(
    z.object({
      name: z.string(),
      status: z.string(),
    })
  ).default([]),
  alternativeApproach: z.string().optional(),
  aiRecommendation: z.string(),
  failingTestDetails: z.array(
    z.object({
      input: z.string(),
      expected: z.string(),
      actual: z.string(),
    })
  ).optional(),
});

export const practiceSubmissionSchema = z.object({
  userId: z.string().min(1),
  questionId: z.string().min(1),
  language: z.string().default('javascript'),
  submittedCode: z.string().optional(),
  selectedAnswer: z.string().optional(),
  isPassed: z.boolean().default(false),
  score: z.number().min(0).max(100).default(0),
  runtimeMs: z.number().default(0),
  memoryMb: z.number().default(0),
  timeComplexity: z.string().optional(),
  spaceComplexity: z.string().optional(),
  passedTests: z.number().default(0),
  totalTests: z.number().default(0),
  summary: z.string().optional(),
  diagnosticEvaluation: diagnosticEvaluationSchema.optional(),
});

export type DiagnosticEvaluationInput = z.infer<typeof diagnosticEvaluationSchema>;
export type PracticeSubmissionInput = z.infer<typeof practiceSubmissionSchema>;
