import mongoose, { Schema, Document, Model } from 'mongoose';
import { LessonSectionSchema, ILessonSection } from './LessonSection';
import { LessonAntiPatternSchema, ILessonAntiPattern } from './LessonAntiPattern';
import { LessonKnowledgeCheckSchema, ILessonKnowledgeCheck } from './LessonKnowledgeCheck';

export interface ILesson extends Document {
  id: string;
  topicId: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  masteryLevel: number;
  whyYouAreLearningThis: string;
  keyTakeaways: string[];
  sections: ILessonSection[];
  antiPatterns: ILessonAntiPattern[];
  knowledgeCheck?: ILessonKnowledgeCheck[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    id: { type: String, required: true, unique: true, index: true },
    topicId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    estimatedMinutes: { type: Number, required: true, default: 30 },
    difficulty: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    masteryLevel: { type: Number, required: true, default: 0 },
    whyYouAreLearningThis: { type: String, required: true },
    keyTakeaways: { type: [String], default: [] },
    sections: { type: [LessonSectionSchema], default: [] },
    antiPatterns: { type: [LessonAntiPatternSchema], default: [] },
    knowledgeCheck: { type: [LessonKnowledgeCheckSchema], default: [] },
  },
  { timestamps: true, collection: 'lessons' }
);

export const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
