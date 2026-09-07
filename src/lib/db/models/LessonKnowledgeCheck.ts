import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILessonKnowledgeCheck {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sequenceOrder?: number;
}

export const LessonKnowledgeCheckSchema = new Schema<ILessonKnowledgeCheck>(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    sequenceOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

export interface ILessonKnowledgeCheckDoc extends Document, ILessonKnowledgeCheck {}

const StandaloneLessonKnowledgeCheckSchema = new Schema<ILessonKnowledgeCheckDoc>({
  id: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
  sequenceOrder: { type: Number, default: 0 },
});

export const LessonKnowledgeCheck: Model<ILessonKnowledgeCheckDoc> =
  mongoose.models.LessonKnowledgeCheck ||
  mongoose.model<ILessonKnowledgeCheckDoc>('LessonKnowledgeCheck', StandaloneLessonKnowledgeCheckSchema);
