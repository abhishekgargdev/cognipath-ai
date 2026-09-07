import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILessonAntiPattern {
  id?: string;
  title: string;
  mistakeCode: string;
  correctionCode: string;
  explanation: string;
  sequenceOrder?: number;
}

export const LessonAntiPatternSchema = new Schema<ILessonAntiPattern>(
  {
    id: { type: String },
    title: { type: String, required: true },
    mistakeCode: { type: String, required: true },
    correctionCode: { type: String, required: true },
    explanation: { type: String, required: true },
    sequenceOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface ILessonAntiPatternDoc extends Document, ILessonAntiPattern {}

const StandaloneLessonAntiPatternSchema = new Schema<ILessonAntiPatternDoc>({
  id: { type: String },
  title: { type: String, required: true },
  mistakeCode: { type: String, required: true },
  correctionCode: { type: String, required: true },
  explanation: { type: String, required: true },
  sequenceOrder: { type: Number, default: 0 },
});

export const LessonAntiPattern: Model<ILessonAntiPatternDoc> =
  mongoose.models.LessonAntiPattern ||
  mongoose.model<ILessonAntiPatternDoc>('LessonAntiPattern', StandaloneLessonAntiPatternSchema);
