'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useUIStore } from '@/providers/ui-store';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Map,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Layers,
  Sparkles,
  Settings,
  ExternalLink,
  ChevronRight,
  BrainCircuit,
  X,
  LogOut,
} from 'lucide-react';

export interface SidebarUser {
  name: string;
  avatarUrl: string;
  targetGoal: string;
  overallMastery: number;
  completedQuestionsToday: number;
  totalQuestionsTargetToday: number;
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  user?: SidebarUser;
  newRecommendationsCount?: number;
}

const defaultUser: SidebarUser = {
  name: 'Scholar Candidate',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  targetGoal: 'Full Stack Architect',
  overallMastery: 42,
  completedQuestionsToday: 2,
  totalQuestionsTargetToday: 5,
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  user = defaultUser,
  newRecommendationsCount: initialRecsCount = 3,
}) => {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  const [summaryData, setSummaryData] = useState<{
    completedQuestionsToday: number;
    totalQuestionsTargetToday: number;
    newRecommendationsCount: number;
  } | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/nav-summary');
        if (res.ok) {
          const json = await res.json();
          setSummaryData(json);
        }
      } catch (err) {
        console.error('Failed to fetch nav summary:', err);
      }
    }
    fetchSummary();
  }, []);

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : isSidebarOpen;
  const handleClose = propsOnClose || (() => setSidebarOpen(false));

  const completedQuestionsToday = summaryData?.completedQuestionsToday ?? user.completedQuestionsToday ?? 0;
  const totalQuestionsTargetToday = summaryData?.totalQuestionsTargetToday ?? user.totalQuestionsTargetToday ?? 5;
  const newRecsCount = summaryData?.newRecommendationsCount ?? initialRecsCount ?? 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'roadmap', label: 'My Roadmap', icon: Map, href: '/roadmap' },
    { id: 'learn', label: 'Learn', icon: BookOpen, href: '/learn' },
    {
      id: 'practice',
      label: 'Daily Practice',
      icon: CheckCircle2,
      href: '/practice',
      badge: `${completedQuestionsToday}/${totalQuestionsTargetToday}`,
    },
    { id: 'progress', label: 'Progress', icon: BarChart3, href: '/progress' },
    { id: 'skills', label: 'Skills', icon: Layers, href: '/skills' },
    {
      id: 'recommendations',
      label: 'AI Recommendations',
      icon: Sparkles,
      href: '/recommendations',
      badge: `${newRecsCount} new`,
    },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen shrink-0 flex flex-col justify-between border-r border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC] transition-all duration-200 ease-in-out ${
          isOpen
            ? 'w-64 translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-16'
        }`}
      >
        {/* Top: Brand Header */}
        <div className="p-4 border-b border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-between bg-[#F4F1EA]/50 dark:bg-[#181714] min-h-[61px]">
          <Link
            href="/dashboard"
            onClick={handleClose}
            className="flex items-center gap-3 select-none group flex-1 overflow-hidden"
          >
            <div className="w-8 h-8 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#201F1B] flex items-center justify-center text-[#8B2635] dark:text-[#E08A95] shadow-xs group-hover:border-[#8B2635] transition-colors shrink-0">
              <BrainCircuit className="w-4 h-4" />
            </div>
            {isOpen && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-black tracking-[0.16em] text-base uppercase text-[#121212] dark:text-[#F4F2EC]">
                    CogniPath
                  </span>
                  <span className="text-[9px] font-mono tracking-widest uppercase border border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] px-1 py-0.2 rounded-xs font-bold">
                    AI
                  </span>
                </div>
                <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-[#5C5852] dark:text-[#9E9A91] -mt-0.5 truncate">
                  Adaptive Curriculum
                </p>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={handleClose}
            className="md:hidden p-1.5 rounded-xs text-[#5C5852] hover:text-[#121212] dark:text-[#9E9A91] dark:hover:text-[#F4F2EC] hover:bg-[#EAE7DF] dark:hover:bg-[#201F1B] transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {isOpen && (
            <div className="px-2 pb-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5C5852] dark:text-[#9E9A91] border-b border-[#DCD9D1]/50 dark:border-[#2C2A26]/50 mb-2">
              Table of Contents
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                href={item.href}
                onClick={handleClose}
                title={!isOpen ? item.label : undefined}
                className={`w-full flex items-center ${
                  isOpen ? 'justify-between px-3' : 'justify-center px-2'
                } py-2 rounded-xs text-xs font-serif transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#EAE7DF] dark:bg-[#1E1D19] text-[#121212] dark:text-[#F4F2EC] font-bold border-l-3 border-l-[#8B2635] dark:border-l-[#E08A95] shadow-xs'
                    : 'text-[#5C5852] dark:text-[#A6A299] hover:bg-[#F4F1EA] dark:hover:bg-[#1A1916] hover:text-[#121212] dark:hover:text-[#F4F2EC] font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active
                        ? 'text-[#8B2635] dark:text-[#E08A95]'
                        : 'text-[#9E9A91]'
                    }`}
                  />
                  {isOpen && (
                    <span className="truncate tracking-wide">{item.label}</span>
                  )}
                </div>

                {isOpen && item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] font-bold tracking-wider ${
                      active
                        ? 'bg-[#FFFFFF] dark:bg-[#252420] text-[#121212] dark:text-[#F4F2EC]'
                        : 'bg-[#F4F1EA] dark:bg-[#1A1916] text-[#5C5852] dark:text-[#9E9A91]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Quick References */}
          {isOpen && (
            <div className="pt-4 mt-4 border-t border-[#DCD9D1] dark:border-[#2C2A26]">
              <div className="px-2 pb-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5C5852] dark:text-[#9E9A91]">
                Compendium Reference
              </div>
              <Link
                id="sidebar-landing-preview-btn"
                href="/"
                onClick={handleClose}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs font-serif font-medium text-[#5C5852] hover:bg-[#EAE7DF] dark:hover:bg-[#1E1D19] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-[#9E9A91]" />
                  Public Frontispiece
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#9E9A91]" />
              </Link>

              <Link
                id="sidebar-restart-onboarding-btn"
                href="/onboarding?mode=edit"
                onClick={handleClose}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs font-serif font-medium text-[#5C5852] hover:bg-[#EAE7DF] dark:hover:bg-[#1E1D19] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />
                  Calibration Interview
                </span>
                <span className="text-[9px] font-mono uppercase bg-[#EAE7DF] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] px-1 py-0.2 rounded-xs text-[#5C5852] dark:text-[#9E9A91]">
                  Edit
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom: Scholar Dossier & Sign Out Dropdown */}
        <div className="p-3 border-t border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA]/60 dark:bg-[#161513]">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full cursor-pointer text-left outline-none">
              <div
                className={`flex items-center ${
                  isOpen ? 'gap-3 p-2' : 'justify-center p-1'
                } rounded-xs border border-transparent hover:border-[#DCD9D1] dark:hover:border-[#2C2A26] hover:bg-[#FFFFFF] dark:hover:bg-[#1C1B18] transition-colors select-none`}
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-xs object-cover border border-[#DCD9D1] dark:border-[#2C2A26] shrink-0"
                />
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#5C5852] dark:text-[#9E9A91] truncate uppercase tracking-wider">
                      {user.targetGoal}
                    </p>
                    <div className="w-full bg-[#DCD9D1] dark:bg-[#2C2A26] rounded-none h-1 mt-1.5 overflow-hidden">
                      <div
                        className="bg-[#8B2635] dark:bg-[#E08A95] h-full transition-all"
                        style={{ width: `${user.overallMastery}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="font-serif">
                <div className="font-bold text-xs">{user.name}</div>
                <div className="text-[10px] font-mono text-[#5C5852] dark:text-[#9E9A91] uppercase">
                  {user.targetGoal}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-0">
                <Link href="/settings" className="flex items-center gap-2 w-full px-2 py-1.5 text-xs">
                  <Settings className="w-4 h-4" /> Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-0">
                <Link href="/roadmap" className="flex items-center gap-2 w-full px-2 py-1.5 text-xs">
                  <Map className="w-4 h-4" /> My Roadmap
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 cursor-pointer text-xs font-bold"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
};
