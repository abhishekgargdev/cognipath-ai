import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email?: string;
  image?: string;
  emailVerified?: Date | null;
  passwordHash?: string;
  role: 'student' | 'mentor' | 'admin';
  status: 'active' | 'suspended' | 'pending_verification';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    image: { type: String },
    emailVerified: { type: Date, default: null },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
    status: { type: String, enum: ['active', 'suspended', 'pending_verification'], default: 'active' },
  },
  { timestamps: true, collection: 'users' }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
