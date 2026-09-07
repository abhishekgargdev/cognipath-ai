import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoadmapPrerequisite extends Document {
  nodeId: string;
  prerequisiteNodeId: string;
}

const RoadmapPrerequisiteSchema = new Schema<IRoadmapPrerequisite>(
  {
    nodeId: { type: String, required: true, index: true },
    prerequisiteNodeId: { type: String, required: true, index: true },
  },
  { collection: 'roadmap_prerequisites' }
);

RoadmapPrerequisiteSchema.index({ nodeId: 1, prerequisiteNodeId: 1 }, { unique: true });

export const RoadmapPrerequisite: Model<IRoadmapPrerequisite> =
  mongoose.models.RoadmapPrerequisite ||
  mongoose.model<IRoadmapPrerequisite>('RoadmapPrerequisite', RoadmapPrerequisiteSchema);
