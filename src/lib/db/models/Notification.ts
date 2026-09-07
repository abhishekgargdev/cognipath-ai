import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  id?: string;
  userId: string;
  type: 'practice' | 'roadmap' | 'weakness' | 'recommendation' | 'streak';
  title: string;
  message: string;
  read: boolean;
  actionView?: string;
  targetId?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    id: { type: String },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['practice', 'roadmap', 'weakness', 'recommendation', 'streak'],
      default: 'practice',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, required: true, default: false, index: true },
    actionView: { type: String },
    targetId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'notifications' }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
