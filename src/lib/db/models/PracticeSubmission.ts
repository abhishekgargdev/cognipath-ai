import mongoose, { Schema, Document, Model } from 'mongoose';
import { DiagnosticEvaluationSchema, IDiagnosticEvaluation } from './DiagnosticEvaluation';

export interface IPracticeSubmission extends Document {
  userId: string;
  questionId: string;
  language: string;
  submittedCode?: string;
  selectedAnswer?: string;
  isPassed: boolean;
  score: number;
  runtimeMs: number;
  memoryMb: number;
  timeComplexity?: string;
  spaceComplexity?: string;
  passedTests: number;
  totalTests: number;
  summary?: string;
  diagnosticEvaluation?: IDiagnosticEvaluation;
  submittedAt: Date;
}

const PracticeSubmissionSchema = new Schema<IPracticeSubmission>(
  {
    userId: { type: String, required: true, index: true },
    questionId: { type: String, required: true, index: true },
    language: { type: String, required: true, default: 'javascript' },
    submittedCode: { type: String },
    selectedAnswer: { type: String },
    isPassed: { type: Boolean, required: true, default: false },
    score: { type: Number, required: true, default: 0, min: 0, max: 100 },
    runtimeMs: { type: Number, required: true, default: 0 },
    memoryMb: { type: Number, required: true, default: 0 },
    timeComplexity: { type: String },
    spaceComplexity: { type: String },
    passedTests: { type: Number, required: true, default: 0 },
    totalTests: { type: Number, required: true, default: 0 },
    summary: { type: String },
    diagnosticEvaluation: { type: DiagnosticEvaluationSchema, default: undefined },
    submittedAt: { type: Date, default: Date.now },
  },
  { collection: 'practice_submissions' }
);

PracticeSubmissionSchema.index({ userId: 1, questionId: 1, submittedAt: -1 });

export const PracticeSubmission: Model<IPracticeSubmission> =
  mongoose.models.PracticeSubmission ||
  mongoose.model<IPracticeSubmission>('PracticeSubmission', PracticeSubmissionSchema);
