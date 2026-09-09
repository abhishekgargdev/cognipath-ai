import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { LoadingSpinner } from '@/components/common';
import { BookOpen } from 'lucide-react';

export default async function LearnRootPage({
  searchParams,
}: {
  searchParams?: Promise<{ topic?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const resolvedParams = searchParams ? await searchParams : undefined;
  if (resolvedParams?.topic) {
    redirect(`/learn/${resolvedParams.topic}`);
  }

  const userId = session.user.id;
  await connectToDatabase();

  let targetTopicId: string | null = null;

  // 1. Try UserProfile.currentTopicId
  const profile = await UserProfile.findOne({ userId }).lean();
  if (profile?.currentTopicId) {
    targetTopicId = profile.currentTopicId;
  }

  // 2. Fallback to first available or in_progress node in UserNodeProgress
  if (!targetTopicId) {
    const activeProgress = await UserNodeProgress.findOne({
      userId,
      status: { $in: ['in_progress', 'available'] },
    })
      .sort({ unlockDay: 1 })
      .lean();
    if (activeProgress?.nodeId) {
      targetTopicId = activeProgress.nodeId;
    }
  }

  // 3. Fallback to any node in RoadmapNode with available/in_progress status
  if (!targetTopicId) {
    const node = await RoadmapNode.findOne({
      status: { $in: ['in_progress', 'available'] },
    })
      .sort({ sequenceOrder: 1 })
      .lean();
    if (node?.id) {
      targetTopicId = node.id;
    }
  }

  // 4. Fallback to absolute first RoadmapNode regardless of status
  if (!targetTopicId) {
    const anyNode = await RoadmapNode.findOne({}).sort({ sequenceOrder: 1 }).lean();
    if (anyNode?.id) {
      targetTopicId = anyNode.id;
    }
  }

  if (targetTopicId) {
    redirect(`/learn/${targetTopicId}`);
  }

  // If no topic exists anywhere yet, render the calm "preparing your content" empty state
  return (
    <div id="learn-view" className="max-w-4xl mx-auto p-8 text-center space-y-6 animate-in fade-in duration-200">
      <div className="p-8 sm:p-12 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4 border-t-3 border-t-[#8B2635] dark:border-t-[#E08A95]">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" variant="primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
          Your learning content is being prepared
        </h2>
        <p className="text-sm font-serif italic text-[#5C5852] dark:text-[#9E9A91] max-w-lg mx-auto leading-relaxed">
          The curriculum engine is setting up your roadmap modules. If you recently completed onboarding, check back shortly or visit your topological roadmap.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/roadmap"
            className="inline-flex items-center justify-center font-serif font-bold rounded-xs transition-all cursor-pointer select-none bg-[#F4F1EA] text-[#121212] hover:bg-[#EAE7DF] dark:bg-[#201F1B] dark:text-[#F4F2EC] dark:hover:bg-[#2C2A26] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs px-4 py-2 gap-2"
          >
            <BookOpen className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
            Return to Topological Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
}

