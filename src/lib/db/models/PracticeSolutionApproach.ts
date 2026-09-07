import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPracticeSolutionApproach {
  id: string;
  rank: number;
  title: string;
  subtitle: string;
  paradigm: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: string;
  language?: string;
  explanation: string;
  pros: string[];
  cons: string[];
  whenToUse: string;
}

export const PracticeSolutionApproachSchema = new Schema<IPracticeSolutionApproach>(
  {
    id: { type: String, required: true },
    rank: { type: Number, required: true, default: 1 },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    paradigm: { type: String, required: true },
    timeComplexity: { type: String, required: true },
    spaceComplexity: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, default: 'javascript' },
    explanation: { type: String, required: true },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    whenToUse: { type: String, required: true },
  },
  { _id: false }
);

export interface IPracticeSolutionApproachDoc extends Document, IPracticeSolutionApproach {}

const StandalonePracticeSolutionApproachSchema = new Schema<IPracticeSolutionApproachDoc>({
  id: { type: String, required: true },
  rank: { type: Number, required: true, default: 1 },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  paradigm: { type: String, required: true },
  timeComplexity: { type: String, required: true },
  spaceComplexity: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  explanation: { type: String, required: true },
  pros: { type: [String], default: [] },
  cons: { type: [String], default: [] },
  whenToUse: { type: String, required: true },
});

export const PracticeSolutionApproach: Model<IPracticeSolutionApproachDoc> =
  mongoose.models.PracticeSolutionApproach ||
  mongoose.model<IPracticeSolutionApproachDoc>('PracticeSolutionApproach', StandalonePracticeSolutionApproachSchema);
