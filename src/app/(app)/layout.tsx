import React from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { AiRecommendation } from '@/lib/db/models/AiRecommendation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
  }

  await connectToDatabase();
  const profile = await UserProfile.findOne({ userId: session.user.id }).lean();
  const newRecommendationsCount = await AiRecommendation.countDocuments({
    userId: session.user.id,
    status: 'pending',
  });

  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const fullUrl = headerList.get('x-url') || '';
  const isEditMode = fullUrl.includes('mode=edit');

  const isCompleted = Boolean(profile?.onboardingCompletedAt);

  // 1. New / Incomplete user on any route except /onboarding -> redirect to /onboarding
  if (!isCompleted && !pathname.startsWith('/onboarding')) {
    redirect('/onboarding');
  }

  // 2. Completed user on /onboarding without ?mode=edit -> redirect to /dashboard
  if (isCompleted && pathname.startsWith('/onboarding') && !isEditMode) {
    redirect('/dashboard');
  }

  const user = {
    name: session.user.name || 'Scholar Candidate',
    avatarUrl: session.user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    targetGoal: profile?.targetGoal || 'Full Stack Architect',
    overallMastery: profile?.overallMastery || 0,
    completedQuestionsToday: profile?.completedQuestionsToday || 0,
    totalQuestionsTargetToday: profile?.totalQuestionsTargetToday || 5,
    experienceLevel: profile?.experienceLevel || 'Intermediate',
    streakDays: profile?.streakDays || 0,
    xp: profile?.xp || 0,
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC]">
      <Sidebar user={user} newRecommendationsCount={newRecommendationsCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
