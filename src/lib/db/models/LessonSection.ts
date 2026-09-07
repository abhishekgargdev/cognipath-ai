import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILessonSection {
  id: string;
  title: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
    caption?: string;
  };
  highlightNote?: string;
  calloutType?: 'info' | 'warning' | 'tip';
  sequenceOrder: number;
}

export const LessonSectionSchema = new Schema<ILessonSection>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    codeSnippet: {
      language: { type: String },
      code: { type: String },
      caption: { type: String },
    },
    highlightNote: { type: String },
    calloutType: { type: String, enum: ['info', 'warning', 'tip'] },
    sequenceOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface ILessonSectionDoc extends Document, ILessonSection {}

const StandaloneLessonSectionSchema = new Schema<ILessonSectionDoc>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  codeSnippet: {
    language: { type: String },
    code: { type: String },
    caption: { type: String },
  },
  highlightNote: { type: String },
  calloutType: { type: String, enum: ['info', 'warning', 'tip'] },
  sequenceOrder: { type: Number, default: 0 },
});

export const LessonSection: Model<ILessonSectionDoc> =
  mongoose.models.LessonSection ||
  mongoose.model<ILessonSectionDoc>('LessonSection', StandaloneLessonSectionSchema);
