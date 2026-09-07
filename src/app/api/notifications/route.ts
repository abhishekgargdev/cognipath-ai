import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Notification } from '@/lib/db/models/Notification';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';

    await connectToDatabase();

    let notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();

    if (notifications.length === 0) {
      const defaultNotifs = [
        {
          id: `notif_1_${Date.now()}`,
          userId,
          type: 'practice' as const,
          title: 'Daily Practicum Ready',
          message: '5 new sandboxed practice questions are ready for today.',
          read: false,
          actionView: 'practice',
          createdAt: new Date(),
        },
        {
          id: `notif_2_${Date.now()}`,
          userId,
          type: 'weakness' as const,
          title: 'Weak Concept Identified',
          message: 'Async Microtask Queue Priority needs review (58% mastery).',
          read: false,
          actionView: 'progress',
          createdAt: new Date(Date.now() - 3600000),
        },
      ];

      for (const item of defaultNotifs) {
        await Notification.create(item);
      }
      notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();
    }

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('[Notifications GET API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
