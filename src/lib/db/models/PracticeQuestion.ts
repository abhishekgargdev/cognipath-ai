import mongoose, { Schema, Document, Model } from 'mongoose';
import { PracticeTestCaseSchema, IPracticeTestCase } from './PracticeTestCase';
import { PracticeSolutionApproachSchema, IPracticeSolutionApproach } from './PracticeSolutionApproach';
import { ConceptExplanationSchema, IConceptExplanation } from './ConceptExplanation';

export interface IPracticeQuestionOption {
  id: string;
  label: string;
  code?: string;
}

export interface IPracticeQuestion extends Document {
  id: string;
  topicId: string;
  type: 'concept' | 'mcq' | 'output_prediction' | 'coding' | 'debugging' | 'scenario';
  typeLabel: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'pending' | 'ready' | 'failed';
  estMinutes: number;
  whyThisMatters: string;
  prompt: string;
  codeSnippet?: string;
  options?: IPracticeQuestionOption[];
  correctAnswer?: string;
  explanation?: string;
  starterCode?: string;
  language?: string;
  sequenceOrder: number;
  testCases?: IPracticeTestCase[];
  solutionApproaches?: IPracticeSolutionApproach[];
  conceptExplanation?: IConceptExplanation;
  createdAt: Date;
  updatedAt: Date;
}

const PracticeQuestionOptionSchema = new Schema<IPracticeQuestionOption>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    code: { type: String },
  },
  { _id: false }
);

const PracticeQuestionSchema = new Schema<IPracticeQuestion>(
  {
    id: { type: String, required: true, unique: true, index: true },
    topicId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['concept', 'mcq', 'output_prediction', 'coding', 'debugging', 'scenario'],
      default: 'coding',
    },
    typeLabel: { type: String, required: true },
    title: { type: String, required: true },
    difficulty: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'ready', 'failed'],
      default: 'pending',
      index: true,
    },
    estMinutes: { type: Number, required: true, default: 15 },
    whyThisMatters: { type: String, required: true },
    prompt: { type: String, required: true },
    codeSnippet: { type: String },
    options: { type: [PracticeQuestionOptionSchema], default: undefined },
    correctAnswer: { type: String },
    explanation: { type: String },
    starterCode: { type: String },
    language: { type: String, default: 'javascript' },
    sequenceOrder: { type: Number, default: 0 },
    testCases: { type: [PracticeTestCaseSchema], default: [] },
    solutionApproaches: { type: [PracticeSolutionApproachSchema], default: [] },
    conceptExplanation: { type: ConceptExplanationSchema, default: undefined },
  },
  { timestamps: true, collection: 'practice_questions' }
);

export const PracticeQuestion: Model<IPracticeQuestion> =
  mongoose.models.PracticeQuestion ||
  mongoose.model<IPracticeQuestion>('PracticeQuestion', PracticeQuestionSchema);
