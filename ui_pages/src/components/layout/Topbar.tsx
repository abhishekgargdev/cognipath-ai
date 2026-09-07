import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Bell, 
  Flame, 
  Sun, 
  Moon, 
  Sparkles, 
  Check, 
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  onToggleMobileSidebar, 
  isMobileSidebarOpen 
}) => {
  const { 
    user, 
    theme, 
    toggleTheme, 
    notifications, 
    markNotificationRead, 
    setActiveView,
    setIsSearchOpen,
    adaptiveNotificationBanner,
    dismissAdaptiveBanner
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 border-b border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F9F7F2]/95 dark:bg-[#121210]/95 backdrop-blur-sm">
      {/* Dynamic Adaptive Learning Alert Bar (Editorial Dispatch Style) */}
      {adaptiveNotificationBanner && (
        <div 
          id="adaptive-path-banner"
          className="bg-[#EAE7DF] dark:bg-[#1A1916] border-b border-[#DCD9D1] dark:border-[#2C2A26] px-4 py-2 text-xs text-[#121212] dark:text-[#F4F2EC] flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2.5 max-w-4xl truncate">
            <span className="inline-flex items-center gap-1 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/10 dark:bg-[#8B2635]/20 px-2 py-0.5 font-mono font-bold text-[10px] tracking-wider text-[#8B2635] dark:text-[#E08A95] uppercase">
              <Sparkles className="w-3 h-3 text-[#8B2635] dark:text-[#E08A95]" />
              ADAPTIVE DISPATCH
            </span>
            <span className="truncate font-medium text-[#5C5852] dark:text-[#B5B1A7]">{adaptiveNotificationBanner}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="view-adaptive-changes-btn"
              onClick={() => {
                setActiveView('roadmap');
                dismissAdaptiveBanner();
              }}
              className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] hover:text-[#8B2635] dark:hover:text-[#E08A95] underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              Inspect Syllabus <ArrowRight className="w-3 h-3" />
            </button>
            <button
              id="dismiss-adaptive-banner-btn"
              onClick={dismissAdaptiveBanner}
              className="text-[#9E9A91] hover:text-[#121212] dark:hover:text-[#F4F2EC] p-0.5 cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Topbar Row */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-15">
        {/* Left: Mobile menu button & breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] text-[#121212] dark:text-[#F4F2EC] hover:bg-[#EAE7DF] dark:hover:bg-[#1F1E1A]"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-1.5 sm:hidden cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <span className="font-serif font-black tracking-wider text-sm uppercase text-[#121212] dark:text-[#F4F2EC]">CogniPath</span>
            <span className="text-[9px] font-mono tracking-widest uppercase border border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] px-1 py-0.2 rounded-xs font-bold">AI</span>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 text-xs">
            <span className="font-serif font-bold text-sm tracking-tight text-[#121212] dark:text-[#F4F2EC]">{user.targetGoal}</span>
            <span className="text-[#9E9A91]">•</span>
            <span className="font-mono text-[11px] font-semibold text-[#8B2635] dark:text-[#E08A95]">{user.overallMastery}% Mastery</span>
            <span className="text-[#9E9A91]">•</span>
            <span className="border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91] px-2 py-0.5 rounded-xs font-mono text-[10px] tracking-wider uppercase font-semibold">
              {user.experienceLevel}
            </span>
          </div>
        </div>

        {/* Center: Search Trigger */}
        <button
          id="search-trigger-btn"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91] hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-colors text-xs w-48 sm:w-64 md:w-80 cursor-pointer shadow-xs"
        >
          <Search className="w-3.5 h-3.5 shrink-0 text-[#8B2635] dark:text-[#E08A95]" />
          <span className="truncate text-left flex-1 font-serif italic text-xs">Search compendium, syllabi, topics...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#22211C] text-[#5C5852] dark:text-[#9E9A91]">
            ⌘K
          </kbd>
        </button>

        {/* Right: Gamification, Theme, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Badge (Wax Seal / Journal Consistency Stamp) */}
          <div 
            id="streak-indicator"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#1B1A16] text-[#121212] dark:text-[#F4F2EC] text-xs font-mono font-bold tracking-wider uppercase"
            title="Daily Learning Streak: 18 consecutive days"
          >
            <Flame className="w-3.5 h-3.5 fill-[#8B2635] text-[#8B2635] dark:fill-[#E08A95] dark:text-[#E08A95]" />
            <span>{user.streakDays}D STREAK</span>
          </div>

          {/* XP Pill */}
          <div 
            id="xp-indicator"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#1B1A16] text-[#121212] dark:text-[#F4F2EC] text-xs font-mono font-bold tracking-wider"
            title="Total Academic Experience Points"
          >
            <span className="text-[10px] uppercase font-bold text-[#8B2635] dark:text-[#E08A95]">XP</span>
            <span>{user.xp.toLocaleString()}</span>
          </div>

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] text-[#121212] dark:text-[#F4F2EC] hover:bg-[#EAE7DF] dark:hover:bg-[#1F1E1A] transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Paper/Light' : 'Ink/Dark'} mode`}
            aria-label="Toggle Color Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-[#121212]" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] text-[#121212] dark:text-[#F4F2EC] hover:bg-[#EAE7DF] dark:hover:bg-[#1F1E1A] transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#8B2635] dark:bg-[#E08A95] ring-2 ring-[#F9F7F2] dark:ring-[#121210]" />
              )}
            </button>

            {showNotifications && (
              <div 
                id="notifications-dropdown-menu"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[#121212] dark:text-[#F4F2EC]">Curriculum Dispatches</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] font-bold">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => notifications.forEach(n => markNotificationRead(n.id))}
                    className="text-[11px] font-serif italic text-[#5C5852] hover:text-[#121212] dark:hover:text-[#F4F2EC] cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="divide-y divide-[#DCD9D1]/60 dark:divide-[#2C2A26] max-h-80 overflow-y-auto mt-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.actionView) setActiveView(notif.actionView);
                        setShowNotifications(false);
                      }}
                      className={`py-3 px-2 rounded-xs text-left transition-colors cursor-pointer ${
                        notif.read 
                          ? 'hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] opacity-75' 
                          : 'bg-[#F4F1EA]/60 dark:bg-[#201F1B]/60 hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] font-medium border-l-2 border-l-[#8B2635] dark:border-l-[#E08A95]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">{notif.title}</p>
                        <span className="text-[10px] font-mono text-[#9E9A91] shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#5C5852] dark:text-[#B5B1A7] mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Scholar Dossier Trigger */}
          <button
            id="user-profile-avatar-btn"
            onClick={() => setActiveView('settings')}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] hover:border-[#121212] dark:hover:border-[#F4F2EC] bg-[#FFFFFF] dark:bg-[#181714] transition-colors cursor-pointer shadow-xs"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-6 h-6 rounded-xs object-cover border border-[#DCD9D1] dark:border-[#2C2A26]"
            />
            <span className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] hidden md:inline">
              {user.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
