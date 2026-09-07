import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const user = {
    name: session.user.name || 'Scholar Candidate',
    avatarUrl: session.user.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    targetGoal: 'Full Stack Architect',
    overallMastery: 42,
    completedQuestionsToday: 2,
    totalQuestionsTargetToday: 5,
    experienceLevel: 'Intermediate',
    streakDays: 18,
    xp: 2450,
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC]">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
