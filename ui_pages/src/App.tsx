/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { SearchModal } from './components/common/SearchModal';
import { AuthModal } from './components/auth/AuthModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { RoadmapView } from './components/roadmap/RoadmapView';
import { LearnView } from './components/learn/LearnView';
import { DailyPracticeView } from './components/practice/DailyPracticeView';
import { ProgressView } from './components/progress/ProgressView';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { SkillsDiscoveryView } from './components/skills/SkillsDiscoveryView';
import { SettingsView } from './components/settings/SettingsView';
import { DashboardSkeleton, LessonSkeleton } from './components/common/ViewSkeleton';

import { 
  Sparkles, 
  X, 
  ArrowRight,
  LayoutDashboard,
  Map,
  CheckCircle2,
  BookOpen,
  Menu
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, isSearchOpen, setIsSearchOpen, startTopicLearning, isViewLoading } = useApp();
  const [showAdaptiveNotice, setShowAdaptiveNotice] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If on public landing page
  if (activeView === 'landing') {
    return (
      <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC] selection:bg-[#EAE7DF] selection:text-[#121212]">
        <LandingPage />
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <AuthModal />
      </div>
    );
  }

  // If on calibration onboarding flow
  if (activeView === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC] selection:bg-[#EAE7DF] selection:text-[#121212]">
        <OnboardingFlow />
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <AuthModal />
      </div>
    );
  }

  // Inside Main Workspace (Dashboard, Roadmap, Learn, Practice, etc.)
  const renderCurrentView = () => {
    if (isViewLoading) {
      if (activeView === 'learn') return <LessonSkeleton />;
      return <DashboardSkeleton />;
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'roadmap':
        return <RoadmapView />;
      case 'learn':
        return <LearnView />;
      case 'practice':
        return <DailyPracticeView />;
      case 'progress':
        return <ProgressView />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'skills':
        return <SkillsDiscoveryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC] flex flex-col font-sans transition-colors duration-150">
      {/* Editorial Folio Stamp Strip */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1 border-b border-[#DCD9D1] dark:border-[#2C2A26] bg-[#EAE7DF]/60 dark:bg-[#181714] text-[10px] font-mono tracking-[0.2em] text-[#5C5852] dark:text-[#9E9A91] uppercase">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-[#121212] dark:text-[#F4F2EC]">THE COGNIPATH GAZETTE</span>
          <span>•</span>
          <span>AN ADAPTIVE CURRICULUM DISPATCH</span>
        </div>
        <div className="flex items-center gap-4">
          <span>VOL. IV • ISSUE 28</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span>•</span>
          <span className="text-[#8B2635] dark:text-[#D47B88] font-bold">INTELLIGENCE EDITION</span>
        </div>
      </div>

      {/* Top Application Header */}
      <Topbar 
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      {/* Main Workspace Layout (Sidebar + Center Content) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Navigation Sidebar */}
        <Sidebar 
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Center Stage */}
        <main className="flex-1 min-w-0 pb-20 md:pb-16">
          {/* Adaptive Learning Path Changed Alert (Editorial Dispatch Format) */}
          {showAdaptiveNotice && activeView === 'dashboard' && (
            <div 
              id="adaptive-path-notice"
              className="mb-6 p-4 rounded-sm border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-xs flex items-start sm:items-center justify-between gap-3 shadow-xs border-l-3 border-l-[#8B2635] dark:border-l-[#D47B88] animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-1.5 bg-[#F4F1EA] dark:bg-[#22211C] border border-[#DCD9D1] dark:border-[#2C2A26] rounded-xs text-[#8B2635] dark:text-[#D47B88] shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="leading-relaxed">
                  <span className="font-mono text-[10px] tracking-[0.16em] uppercase font-bold text-[#8B2635] dark:text-[#D47B88] mr-2">
                    DISPATCH MEMORANDUM:
                  </span>
                  <span className="text-[#5C5852] dark:text-[#B5B1A7]">
                    Curriculum adapted dynamically based on yesterday's evaluation. Two targeted exercises added for microtask scheduling.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => startTopicLearning('async-event-loop')}
                  className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] hover:text-[#8B2635] dark:hover:text-[#D47B88] underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                >
                  <span>Review Concept</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setShowAdaptiveNotice(false)}
                  className="p-1 text-[#9E9A91] hover:text-[#121212] dark:hover:text-[#F4F2EC] cursor-pointer"
                  title="Dismiss notice"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Current Active View */}
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb-Friendly Native Architecture) */}
      <nav 
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F9F7F2]/95 dark:bg-[#121210]/95 backdrop-blur-md border-t border-[#DCD9D1] dark:border-[#2C2A26] px-3 py-2 flex items-center justify-around shadow-lg"
      >
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xs transition-colors min-h-[44px] cursor-pointer ${
            activeView === 'dashboard'
              ? 'text-[#8B2635] dark:text-[#E08A95] font-bold'
              : 'text-[#5C5852] dark:text-[#9E9A91]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] font-serif mt-0.5">Overview</span>
        </button>

        <button
          onClick={() => setActiveView('roadmap')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xs transition-colors min-h-[44px] cursor-pointer ${
            activeView === 'roadmap'
              ? 'text-[#8B2635] dark:text-[#E08A95] font-bold'
              : 'text-[#5C5852] dark:text-[#9E9A91]'
          }`}
        >
          <Map className="w-4 h-4" />
          <span className="text-[10px] font-serif mt-0.5">Roadmap</span>
        </button>

        <button
          onClick={() => setActiveView('practice')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xs transition-colors min-h-[44px] cursor-pointer ${
            activeView === 'practice'
              ? 'text-[#8B2635] dark:text-[#E08A95] font-bold'
              : 'text-[#5C5852] dark:text-[#9E9A91]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-[10px] font-serif mt-0.5">Practice</span>
        </button>

        <button
          onClick={() => setActiveView('learn')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xs transition-colors min-h-[44px] cursor-pointer ${
            activeView === 'learn'
              ? 'text-[#8B2635] dark:text-[#E08A95] font-bold'
              : 'text-[#5C5852] dark:text-[#9E9A91]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] font-serif mt-0.5">Learn</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xs text-[#5C5852] dark:text-[#9E9A91] transition-colors min-h-[44px] cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] font-serif mt-0.5">Menu</span>
        </button>
      </nav>

      {/* Global Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
