import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { Notification } from '@/lib/db/models/Notification';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id || 'demo-user-id';
    const { id } = await params;

    await connectToDatabase();

    const notif = await Notification.findOneAndUpdate(
      { $or: [{ id }, { _id: id }], userId },
      { $set: { read: true } },
      { returnDocument: 'after' }
    ).lean();

    if (!notif) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification: notif });
  } catch (error: any) {
    console.error('[Notification Read PATCH API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
