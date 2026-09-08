import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';

export default async function LearnRootPage() {
  const session = await auth();
  const userId = session?.user?.id;

  let topicId = 'js-event-loop';
  if (userId) {
    await connectToDatabase();
    const profile = await UserProfile.findOne({ userId }).lean();
    if (profile?.currentTopicId) {
      topicId = profile.currentTopicId;
    }
  }

  redirect(`/learn/${topicId}`);
}
