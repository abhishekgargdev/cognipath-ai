import React from 'react';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check stub (Auth.js comes in Module 2)
  // For now: stub check as "always pass"
  const session = { user: { name: 'Scholar Candidate' } };

  if (!session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
