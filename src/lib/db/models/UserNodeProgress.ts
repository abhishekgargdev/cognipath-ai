import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserNodeProgress extends Document {
  userId: string;
  nodeId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'review_needed';
  masteryPercent: number;
  unlockDay?: number;
  availableFrom?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  reviewFlaggedAt?: Date | null;
  updatedAt: Date;
}

const UserNodeProgressSchema = new Schema<IUserNodeProgress>(
  {
    userId: { type: String, required: true, index: true },
    nodeId: { type: String, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['locked', 'available', 'in_progress', 'completed', 'review_needed'],
      default: 'locked',
    },
    masteryPercent: { type: Number, required: true, default: 0, min: 0, max: 100 },
    unlockDay: { type: Number, default: 0 },
    availableFrom: { type: Date, default: null, index: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    reviewFlaggedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'user_node_progress' }
);

UserNodeProgressSchema.index({ userId: 1, nodeId: 1 }, { unique: true });

export const UserNodeProgress: Model<IUserNodeProgress> =
  mongoose.models.UserNodeProgress ||
  mongoose.model<IUserNodeProgress>('UserNodeProgress', UserNodeProgressSchema);
