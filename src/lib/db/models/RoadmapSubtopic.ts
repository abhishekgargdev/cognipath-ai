import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoadmapSubtopic {
  id: string;
  title: string;
  sequenceOrder: number;
  completed?: boolean;
}

export const RoadmapSubtopicSchema = new Schema<IRoadmapSubtopic>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    sequenceOrder: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

export interface IRoadmapSubtopicDoc extends Document, IRoadmapSubtopic {}

const StandaloneRoadmapSubtopicSchema = new Schema<IRoadmapSubtopicDoc>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  sequenceOrder: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
});

export const RoadmapSubtopic: Model<IRoadmapSubtopicDoc> =
  mongoose.models.RoadmapSubtopic ||
  mongoose.model<IRoadmapSubtopicDoc>('RoadmapSubtopic', StandaloneRoadmapSubtopicSchema);
