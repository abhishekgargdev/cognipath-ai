import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string;
  targetGoal: string;
  customGoal?: string | null;
  experienceLevel: 'Complete Beginner' | 'Beginner' | 'Intermediate' | 'Advanced';
  dailyCommitmentMinutes: number;
  learningReason?: string | null;
  learningPreferences: string[];
  streakDays: number;
  xp: number;
  overallMastery: number;
  completedQuestionsToday: number;
  totalQuestionsTargetToday: number;
  currentTopicId: string;
  theme: 'light' | 'dark' | 'system';
  onboardingCompletedAt?: Date | null;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema: Schema<IUserProfile> = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    targetGoal: { type: String, required: true, default: 'Full Stack Architect' },
    customGoal: { type: String, default: null },
    experienceLevel: {
      type: String,
      required: true,
      enum: ['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    dailyCommitmentMinutes: { type: Number, required: true, default: 30, min: 5, max: 240 },
    learningReason: { type: String, default: null },
    learningPreferences: {
      type: [String],
      default: ['code-first', 'theoretical-monographs'],
    },
    streakDays: { type: Number, required: true, default: 0, min: 0 },
    xp: { type: Number, required: true, default: 0, min: 0 },
    overallMastery: { type: Number, required: true, default: 0, min: 0, max: 100 },
    completedQuestionsToday: { type: Number, required: true, default: 0, min: 0 },
    totalQuestionsTargetToday: { type: Number, required: true, default: 5, min: 1 },
    currentTopicId: { type: String, default: 'js-event-loop' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    onboardingCompletedAt: { type: Date, default: null, index: true },
    lastActiveAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const UserProfile: Model<IUserProfile> =
  mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
