import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserWeakConcept extends Document {
  userId: string;
  topicId: string;
  name: string;
  category: string;
  masteryPercent: number;
  failureCount: number;
  reason: string;
  recommendedAction: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserWeakConceptSchema = new Schema<IUserWeakConcept>(
  {
    userId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    masteryPercent: { type: Number, required: true, default: 0, min: 0, max: 100 },
    failureCount: { type: Number, required: true, default: 1 },
    reason: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    resolved: { type: Boolean, required: true, default: false, index: true },
  },
  { timestamps: true, collection: 'user_weak_concepts' }
);

export const UserWeakConcept: Model<IUserWeakConcept> =
  mongoose.models.UserWeakConcept ||
  mongoose.model<IUserWeakConcept>('UserWeakConcept', UserWeakConceptSchema);
