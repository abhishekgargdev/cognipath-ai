import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPracticeTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  sequenceOrder?: number;
}

export const PracticeTestCaseSchema = new Schema<IPracticeTestCase>(
  {
    id: { type: String, required: true },
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    sequenceOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface IPracticeTestCaseDoc extends Document, IPracticeTestCase {}

const StandalonePracticeTestCaseSchema = new Schema<IPracticeTestCaseDoc>({
  id: { type: String, required: true },
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  sequenceOrder: { type: Number, default: 0 },
});

export const PracticeTestCase: Model<IPracticeTestCaseDoc> =
  mongoose.models.PracticeTestCase ||
  mongoose.model<IPracticeTestCaseDoc>('PracticeTestCase', StandalonePracticeTestCaseSchema);
