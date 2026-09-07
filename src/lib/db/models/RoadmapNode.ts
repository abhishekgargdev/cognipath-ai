import mongoose, { Schema, Document, Model } from 'mongoose';
import { RoadmapSubtopicSchema, IRoadmapSubtopic } from './RoadmapSubtopic';

export interface IRoadmapNode extends Document {
  id: string;
  milestoneId: string;
  title: string;
  category: string;
  categoryLabel: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'review_needed';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estMinutes: number;
  masteryPercent: number;
  prerequisites: string[];
  whyItMatters: string;
  description: string;
  sequenceOrder: number;
  subtopics: IRoadmapSubtopic[];
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapNodeSchema = new Schema<IRoadmapNode>(
  {
    id: { type: String, required: true, unique: true, index: true },
    milestoneId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    categoryLabel: { type: String, required: true },
    status: {
      type: String,
      enum: ['locked', 'available', 'in_progress', 'completed', 'review_needed'],
      default: 'locked',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    estMinutes: { type: Number, required: true, default: 45 },
    masteryPercent: { type: Number, required: true, default: 0, min: 0, max: 100 },
    prerequisites: { type: [String], default: [] },
    whyItMatters: { type: String, required: true },
    description: { type: String, required: true },
    sequenceOrder: { type: Number, required: true, default: 0 },
    subtopics: { type: [RoadmapSubtopicSchema], default: [] },
  },
  { timestamps: true }
);

RoadmapNodeSchema.index({ title: 'text', description: 'text', whyItMatters: 'text' });

export const RoadmapNode: Model<IRoadmapNode> =
  mongoose.models.RoadmapNode || mongoose.model<IRoadmapNode>('RoadmapNode', RoadmapNodeSchema);
