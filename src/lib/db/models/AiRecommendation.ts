import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAiRecommendation extends Document {
  id: string;
  userId: string;
  title: string;
  category: string;
  whyRecommendation: string;
  expectedImpact: 'Critical' | 'High' | 'Medium' | 'Elective';
  estHours: number;
  actionTopicId: string;
  addedToRoadmap: boolean;
  status: 'pending' | 'accepted' | 'dismissed';
  prerequisites?: Array<{ name: string; satisfied: boolean }>;
  createdAt: Date;
}

const AiRecommendationSchema = new Schema<IAiRecommendation>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    whyRecommendation: { type: String, required: true },
    expectedImpact: {
      type: String,
      required: true,
      enum: ['Critical', 'High', 'Medium', 'Elective'],
      default: 'High',
    },
    estHours: { type: Number, required: true, default: 2 },
    actionTopicId: { type: String, required: true, index: true },
    addedToRoadmap: { type: Boolean, default: false },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'accepted', 'dismissed'],
      default: 'pending',
    },
    prerequisites: [
      {
        name: { type: String, required: true },
        satisfied: { type: Boolean, required: true },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'ai_recommendations' }
);

export const AiRecommendation: Model<IAiRecommendation> =
  mongoose.models.AiRecommendation ||
  mongoose.model<IAiRecommendation>('AiRecommendation', AiRecommendationSchema);
