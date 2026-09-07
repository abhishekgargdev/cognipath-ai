import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  type: z.enum(['practice', 'roadmap', 'weakness', 'recommendation', 'streak']).default('practice'),
  title: z.string().min(1),
  message: z.string().min(1),
  read: z.boolean().default(false),
  actionView: z.string().optional(),
  targetId: z.string().optional(),
});

export const dailyStreakLogSchema = z.object({
  userId: z.string().min(1),
  activityDate: z.date(),
  questionsCompleted: z.number().min(0).default(0),
  minutesSpent: z.number().min(0).default(0),
  xpEarned: z.number().min(0).default(0),
});

export type NotificationInput = z.infer<typeof notificationSchema>;
export type DailyStreakLogInput = z.infer<typeof dailyStreakLogSchema>;
