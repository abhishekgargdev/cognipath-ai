import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserSkill extends Document {
  userId: string;
  skillId: string;
  level: 'Complete Beginner' | 'Beginner' | 'Intermediate' | 'Advanced';
  updatedAt: Date;
}

const UserSkillSchema = new Schema<IUserSkill>(
  {
    userId: { type: String, required: true, index: true },
    skillId: { type: String, required: true, index: true },
    level: {
      type: String,
      required: true,
      enum: ['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
  },
  { timestamps: true, collection: 'user_skills' }
);

UserSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

export const UserSkill: Model<IUserSkill> =
  mongoose.models.UserSkill || mongoose.model<IUserSkill>('UserSkill', UserSkillSchema);
