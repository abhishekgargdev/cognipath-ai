import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  ViewMode,
  RoadmapMilestone,
  WeakConcept,
  AIRecommendation,
  NotificationItem
} from '../types';
import {
  initialUser,
  initialRoadmapMilestones,
  mockWeakConcepts,
  mockAIRecommendations,
  mockNotifications
} from '../data/mockData';

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  selectedTopicId: string;
  setSelectedTopicId: (topicId: string) => void;
  roadmapMilestones: RoadmapMilestone[];
  setRoadmapMilestones: React.Dispatch<React.SetStateAction<RoadmapMilestone[]>>;
  weakConcepts: WeakConcept[];
  setWeakConcepts: React.Dispatch<React.SetStateAction<WeakConcept[]>>;
  aiRecommendations: AIRecommendation[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  completeDailyQuestion: (score: number) => void;
  addRecommendationToRoadmap: (recId: string) => void;
  startTopicLearning: (topicId: string) => void;
  startDailyPractice: (topicId?: string) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  finishOnboarding: (data: Partial<UserProfile>) => void;
  adaptiveNotificationBanner: string | null;
  dismissAdaptiveBanner: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isViewLoading: boolean;
  setIsViewLoading: (loading: boolean) => void;
  navigateWithLoading: (view: ViewMode, topicId?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('js-closures');
  const [roadmapMilestones, setRoadmapMilestones] = useState<RoadmapMilestone[]>(initialRoadmapMilestones);
  const [weakConcepts, setWeakConcepts] = useState<WeakConcept[]>(mockWeakConcepts);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>(mockAIRecommendations);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [adaptiveNotificationBanner, setAdaptiveNotificationBanner] = useState<string | null>(
    'Adaptive Path Update: 2 additional reinforcement questions scheduled for Async JavaScript & Event Loop.'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isViewLoading, setIsViewLoading] = useState<boolean>(false);

  // Sync theme with HTML root class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissAdaptiveBanner = () => {
    setAdaptiveNotificationBanner(null);
  };

  const completeDailyQuestion = (score: number) => {
    setUser(prev => {
      const nextCompleted = Math.min(prev.completedQuestionsToday + 1, prev.totalQuestionsTargetToday);
      const earnedXp = Math.round(score * 0.5) + 15;
      return {
        ...prev,
        completedQuestionsToday: nextCompleted,
        xp: prev.xp + earnedXp,
        overallMastery: Math.min(100, prev.overallMastery + 1)
      };
    });
  };

  const addRecommendationToRoadmap = (recId: string) => {
    setAiRecommendations(prev =>
      prev.map(r => (r.id === recId ? { ...r, addedToRoadmap: true } : r))
    );

    // If it's system design, unlock the node in roadmap
    const rec = aiRecommendations.find(r => r.id === recId);
    if (rec && rec.actionTopicId) {
      setRoadmapMilestones(prev =>
        prev.map(ms => ({
          ...ms,
          nodes: ms.nodes.map(node =>
            node.id === rec.actionTopicId
              ? { ...node, status: 'available' }
              : node
          )
        }))
      );
    }

    setAdaptiveNotificationBanner(
      `"${rec?.title || 'Topic'}" has been dynamically integrated into your active learning sequence!`
    );
  };

  const navigateWithLoading = (view: ViewMode, topicId?: string) => {
    setIsViewLoading(true);
    if (topicId) {
      setSelectedTopicId(topicId);
    }
    setActiveView(view);
    setTimeout(() => {
      setIsViewLoading(false);
    }, 280);
  };

  const startTopicLearning = (topicId: string) => {
    navigateWithLoading('learn', topicId);
  };

  const startDailyPractice = (topicId?: string) => {
    navigateWithLoading('practice', topicId);
  };

  const finishOnboarding = (data: Partial<UserProfile>) => {
    setUser(prev => ({
      ...prev,
      ...data
    }));
    navigateWithLoading('roadmap');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeView,
        setActiveView,
        selectedTopicId,
        setSelectedTopicId,
        roadmapMilestones,
        setRoadmapMilestones,
        weakConcepts,
        setWeakConcepts,
        aiRecommendations,
        notifications,
        markNotificationRead,
        theme,
        toggleTheme,
        completeDailyQuestion,
        addRecommendationToRoadmap,
        startTopicLearning,
        startDailyPractice,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
        finishOnboarding,
        adaptiveNotificationBanner,
        dismissAdaptiveBanner,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        isViewLoading,
        setIsViewLoading,
        navigateWithLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
