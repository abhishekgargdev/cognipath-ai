import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoadmapMilestone extends Document {
  id: string;
  title: string;
  description: string;
  sequenceOrder: number;
  targetGoal: string;
  nodeIds: string[];
}

const RoadmapMilestoneSchema = new Schema<IRoadmapMilestone>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    sequenceOrder: { type: Number, required: true, default: 0 },
    targetGoal: { type: String, required: true, default: 'Full Stack Architect', index: true },
    nodeIds: { type: [String], default: [] },
  },
  { collection: 'roadmap_milestones' }
);

export const RoadmapMilestone: Model<IRoadmapMilestone> =
  mongoose.models.RoadmapMilestone ||
  mongoose.model<IRoadmapMilestone>('RoadmapMilestone', RoadmapMilestoneSchema);
