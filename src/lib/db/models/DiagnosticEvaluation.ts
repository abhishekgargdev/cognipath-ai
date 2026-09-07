import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDiagnosticEvaluation {
  whatYouDidWell: string[];
  whatCouldBeImproved: string[];
  conceptsDemonstrated: Array<{ name: string; status: string }>;
  alternativeApproach?: string;
  aiRecommendation: string;
  failingTestDetails?: Array<{ input: string; expected: string; actual: string }>;
}

export const DiagnosticEvaluationSchema = new Schema<IDiagnosticEvaluation>(
  {
    whatYouDidWell: { type: [String], default: [] },
    whatCouldBeImproved: { type: [String], default: [] },
    conceptsDemonstrated: [
      {
        name: { type: String, required: true },
        status: { type: String, required: true },
      },
    ],
    alternativeApproach: { type: String },
    aiRecommendation: { type: String, required: true },
    failingTestDetails: [
      {
        input: { type: String },
        expected: { type: String },
        actual: { type: String },
      },
    ],
  },
  { _id: false }
);

export interface IDiagnosticEvaluationDoc extends Document, IDiagnosticEvaluation {}

const StandaloneDiagnosticEvaluationSchema = new Schema<IDiagnosticEvaluationDoc>({
  whatYouDidWell: { type: [String], default: [] },
  whatCouldBeImproved: { type: [String], default: [] },
  conceptsDemonstrated: [
    {
      name: { type: String, required: true },
      status: { type: String, required: true },
    },
  ],
  alternativeApproach: { type: String },
  aiRecommendation: { type: String, required: true },
  failingTestDetails: [
    {
      input: { type: String },
      expected: { type: String },
      actual: { type: String },
    },
  ],
});

export const DiagnosticEvaluation: Model<IDiagnosticEvaluationDoc> =
  mongoose.models.DiagnosticEvaluation ||
  mongoose.model<IDiagnosticEvaluationDoc>('DiagnosticEvaluation', StandaloneDiagnosticEvaluationSchema);
