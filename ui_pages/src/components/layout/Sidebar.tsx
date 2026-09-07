import React from 'react';
import { useApp } from '../../context/AppContext';
import { ViewMode } from '../../types';
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
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { 
    activeView, 
    setActiveView, 
    user, 
    aiRecommendations 
  } = useApp();

  const navItems: {
    id: ViewMode;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roadmap', label: 'My Roadmap', icon: Map },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { 
      id: 'practice', 
      label: 'Daily Practice', 
      icon: CheckCircle2,
      badge: `${user.completedQuestionsToday}/${user.totalQuestionsTargetToday}`,
      badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
    },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'skills', label: 'Skills', icon: Layers },
    { 
      id: 'recommendations', 
      label: 'AI Recommendations', 
      icon: Sparkles,
      badge: `${aiRecommendations.filter(r => !r.addedToRoadmap).length} new`,
      badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-300'
    },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (viewId: ViewMode) => {
    setActiveView(viewId);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-64 shrink-0 flex flex-col justify-between border-r border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC] transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top: Masthead & Brand */}
        <div className="p-4 border-b border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-between bg-[#F4F1EA]/50 dark:bg-[#181714]">
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group flex-1"
          >
            <div className="w-8 h-8 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#201F1B] flex items-center justify-center text-[#8B2635] dark:text-[#E08A95] shadow-xs group-hover:border-[#8B2635] transition-colors shrink-0">
              <BrainCircuit className="w-4 h-4" />
            </div>
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
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-xs text-[#5C5852] hover:text-[#121212] dark:text-[#9E9A91] dark:hover:text-[#F4F2EC] hover:bg-[#EAE7DF] dark:hover:bg-[#201F1B] transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-2 pb-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5C5852] dark:text-[#9E9A91] border-b border-[#DCD9D1]/50 dark:border-[#2C2A26]/50 mb-2">
            Table of Contents
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs font-serif transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EAE7DF] dark:bg-[#1E1D19] text-[#121212] dark:text-[#F4F2EC] font-bold border-l-3 border-l-[#8B2635] dark:border-l-[#E08A95] shadow-xs'
                    : 'text-[#5C5852] dark:text-[#A6A299] hover:bg-[#F4F1EA] dark:hover:bg-[#1A1916] hover:text-[#121212] dark:hover:text-[#F4F2EC] font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8B2635] dark:text-[#E08A95]' : 'text-[#9E9A91]'}`} />
                  <span className="truncate tracking-wide">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] font-bold tracking-wider ${
                      isActive 
                        ? 'bg-[#FFFFFF] dark:bg-[#252420] text-[#121212] dark:text-[#F4F2EC]'
                        : 'bg-[#F4F1EA] dark:bg-[#1A1916] text-[#5C5852] dark:text-[#9E9A91]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Landing Page Preview Link */}
          <div className="pt-4 mt-4 border-t border-[#DCD9D1] dark:border-[#2C2A26]">
            <div className="px-2 pb-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5C5852] dark:text-[#9E9A91]">
              Compendium Reference
            </div>
            <button
              id="sidebar-landing-preview-btn"
              onClick={() => handleNavClick('landing')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs font-serif font-medium text-[#5C5852] hover:bg-[#EAE7DF] dark:hover:bg-[#1E1D19] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-[#9E9A91]" />
                Public Frontispiece
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#9E9A91]" />
            </button>

            <button
              id="sidebar-restart-onboarding-btn"
              onClick={() => handleNavClick('onboarding')}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xs text-xs font-serif font-medium text-[#5C5852] hover:bg-[#EAE7DF] dark:hover:bg-[#1E1D19] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />
                Calibration Interview
              </span>
              <span className="text-[9px] font-mono uppercase bg-[#EAE7DF] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] px-1 py-0.2 rounded-xs text-[#5C5852] dark:text-[#9E9A91]">Demo</span>
            </button>
          </div>
        </div>

        {/* Bottom: Scholar Dossier Card */}
        <div className="p-3 border-t border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA]/60 dark:bg-[#161513]">
          <div 
            onClick={() => handleNavClick('settings')}
            className="flex items-center gap-3 p-2 rounded-xs border border-transparent hover:border-[#DCD9D1] dark:hover:border-[#2C2A26] hover:bg-[#FFFFFF] dark:hover:bg-[#1C1B18] transition-colors cursor-pointer"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-9 h-9 rounded-xs object-cover border border-[#DCD9D1] dark:border-[#2C2A26]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] truncate">
                {user.name}
              </p>
              <p className="text-[10px] font-mono text-[#5C5852] dark:text-[#9E9A91] truncate uppercase tracking-wider">
                {user.targetGoal}
              </p>
              {/* Mini mastery progress */}
              <div className="w-full bg-[#DCD9D1] dark:bg-[#2C2A26] rounded-none h-1 mt-1.5 overflow-hidden">
                <div 
                  className="bg-[#8B2635] dark:bg-[#E08A95] h-full transition-all"
                  style={{ width: `${user.overallMastery}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
