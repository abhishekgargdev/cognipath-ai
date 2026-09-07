'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  Code2,
  BrainCircuit,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Zap,
} from 'lucide-react';
import { AuthModal } from '@/components/auth/AuthModal';

export function LandingClient() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] dark:bg-[#121110] text-[#121212] dark:text-[#F4F2EC] font-serif transition-colors duration-200 selection:bg-[#8B2635]/20 selection:text-[#8B2635]">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#F9F8F6]/90 dark:bg-[#121110]/90 backdrop-blur-md border-b border-[#DCD9D1] dark:border-[#2C2A26] px-6 py-4 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/10 flex items-center justify-center text-[#8B2635] dark:text-[#E08A95] shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-black tracking-tight text-base text-[#121212] dark:text-[#F4F2EC]">
                CogniPath AI
              </span>
              <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-[#8B2635] dark:text-[#E08A95] border border-[#8B2635]/30 px-1.5 py-0.5 rounded-xs bg-[#8B2635]/5">
                v1.0 Canon
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => openAuth('login')}
              className="text-xs font-serif font-bold text-[#5C5852] dark:text-[#9E9A91] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="px-4 py-2 rounded-xs bg-[#8B2635] hover:bg-[#721F2B] text-white font-serif font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer border border-[#8B2635]"
            >
              <span>Begin Curriculum</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sandboxed Code Sandbox & Adaptive Curricular Synthesis</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] leading-[1.15] tracking-tight mb-6">
            Master Software Engineering through{' '}
            <span className="italic text-[#8B2635] dark:text-[#E08A95]">
              AI-Synthesized Syllabi
            </span>{' '}
            and Real-Time Diagnostics.
          </h1>

          <p className="text-base sm:text-lg font-serif italic text-[#5C5852] dark:text-[#9E9A91] max-w-2xl mx-auto leading-relaxed mb-10">
            Select your discipline, read curated conceptual monographs, solve 5 daily sandboxed
            algorithmic challenges, and receive instant diagnostic evaluation on complexity and design.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuth('signup')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-white dark:text-[#121212] font-serif font-bold text-sm transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer border border-[#121212] dark:border-[#F4F2EC]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] font-serif text-sm font-bold transition-all text-center"
            >
              View Onboarding Flow
            </Link>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="px-6 py-20 bg-[#F4F1EA] dark:bg-[#151412] border-y border-[#DCD9D1] dark:border-[#2C2A26]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-[#8B2635] dark:text-[#E08A95]">
              Pedagogical Pillars
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mt-2">
              Engineered for Deep Systemic Comprehension
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs">
              <div className="w-10 h-10 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/10 flex items-center justify-center text-[#8B2635] dark:text-[#E08A95] mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-2">
                Dynamic Roadmap Generation
              </h3>
              <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] leading-relaxed">
                Custom learning paths dynamically built around your career goals and current mastery level.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs">
              <div className="w-10 h-10 rounded-xs border border-[#1F3A2B]/30 bg-[#1F3A2B]/10 flex items-center justify-center text-[#1F3A2B] dark:text-[#4E876A] mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-2">
                Sandboxed Code Execution
              </h3>
              <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] leading-relaxed">
                Execute code against real test suites in a Judge0-compatible multi-language sandbox with instant evaluation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs">
              <div className="w-10 h-10 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/10 flex items-center justify-center text-[#8B2635] dark:text-[#E08A95] mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-2">
                AI Diagnostic Feedback
              </h3>
              <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] leading-relaxed">
                Receive breakdown analysis of time/space complexity, alternative solution paradigms, and targeted weakness remediations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-[#F9F8F6] dark:bg-[#121110] border-t border-[#DCD9D1] dark:border-[#2C2A26]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-serif text-[#5C5852] dark:text-[#9E9A91]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">CogniPath AI</span>
            <span>— Adaptive Learning Infrastructure</span>
          </div>
          <p>© 2026 CogniPath AI. Built with Next.js App Router & Mongoose.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
