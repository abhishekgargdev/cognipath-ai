import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyStreakLog extends Document {
  userId: string;
  activityDate: Date;
  questionsCompleted: number;
  minutesSpent: number;
  xpEarned: number;
}

const DailyStreakLogSchema = new Schema<IDailyStreakLog>(
  {
    userId: { type: String, required: true, index: true },
    activityDate: { type: Date, required: true, index: true },
    questionsCompleted: { type: Number, required: true, default: 0, min: 0 },
    minutesSpent: { type: Number, required: true, default: 0, min: 0 },
    xpEarned: { type: Number, required: true, default: 0, min: 0 },
  },
  { collection: 'daily_streak_logs' }
);

DailyStreakLogSchema.index({ userId: 1, activityDate: -1 }, { unique: true });

export const DailyStreakLog: Model<IDailyStreakLog> =
  mongoose.models.DailyStreakLog ||
  mongoose.model<IDailyStreakLog>('DailyStreakLog', DailyStreakLogSchema);
