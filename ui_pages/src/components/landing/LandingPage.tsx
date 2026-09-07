import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BrainCircuit, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Target, 
  Compass, 
  BookOpen, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  Code2, 
  ShieldCheck,
  ChevronRight,
  Terminal,
  Clock,
  Award
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, setShowAuthModal, setAuthModalMode } = useApp();

  const handleStartOnboarding = () => {
    setActiveView('onboarding');
  };

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const handleGoToApp = () => {
    setActiveView('dashboard');
  };

  return (
    <div 
      id="landing-page"
      className="min-h-screen bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC] selection:bg-[#EAE7DF] selection:text-[#121212]"
    >
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F9F7F2]/90 dark:bg-[#121210]/90 backdrop-blur-xs px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs border border-[#121212] dark:border-[#F4F2EC] bg-[#121212] dark:bg-[#F4F2EC] flex items-center justify-center text-white dark:text-[#121212] shadow-xs">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="font-serif font-black text-lg tracking-tight text-[#121212] dark:text-[#F4F2EC]">
              CogniPath <span className="text-[#8B2635] dark:text-[#E08A95] font-serif italic">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="landing-sign-in-btn"
              onClick={handleOpenLogin}
              className="px-4 py-2 text-xs font-serif font-bold text-[#5C5852] dark:text-[#A6A299] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              id="landing-start-cta-nav"
              onClick={handleStartOnboarding}
              className="px-4 py-2 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-white dark:text-[#121212] font-serif font-bold text-xs transition-all shadow-xs border border-[#121212] dark:border-[#F4F2EC] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Build Syllabus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden border-b border-[#DCD9D1] dark:border-[#2C2A26]">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] text-[10px] font-mono uppercase font-bold tracking-[0.2em] mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editorial Intelligence & Adaptive Curricula</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-[#121212] dark:text-[#F4F2EC] leading-[1.08] max-w-4xl mx-auto">
            Learn what matters.{' '}
            <span className="italic font-serif text-[#8B2635] dark:text-[#E08A95]">
              Remediate foundational deficits.
            </span>{' '}
            Attain engineering mastery.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg font-serif italic text-[#5C5852] dark:text-[#A6A299] max-w-2xl mx-auto leading-relaxed">
            A continuous pedagogical system synthesizing your custom syllabus, explaining concepts before evaluation, adapting daily question sets, and orchestrating your next optimal acquisition.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              id="landing-hero-primary-cta"
              onClick={handleStartOnboarding}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-white dark:text-[#121212] font-serif font-bold text-sm transition-all shadow-xs border border-[#121212] dark:border-[#F4F2EC] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Build My Learning Syllabus</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="landing-hero-demo-cta"
              onClick={handleGoToApp}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xs border border-[#121212] dark:border-[#F4F2EC] bg-[#F4F1EA] dark:bg-[#1A1916] hover:bg-[#EAE7DF] dark:hover:bg-[#24221E] text-[#121212] dark:text-[#F4F2EC] font-serif font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Inspect Live Workspace</span>
              <ChevronRight className="w-4 h-4 text-[#9E9A91]" />
            </button>
          </div>

          {/* Key Philosophy Guarantee */}
          <p className="text-xs font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] mt-4">
            Concepts First • 5 Daily Inquiries • Continuous Heuristic Feedback
          </p>
        </div>

        {/* Visual Pipeline Flow Chart (Core Concept Visualization) */}
        <div className="max-w-5xl mx-auto mt-16 p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] relative shadow-xs">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2635] dark:text-[#E08A95] font-bold text-center mb-6">
            The Continuous Curricular Cycle
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            {[
              { step: '01', title: 'Target Goal', subtitle: 'Career Archetype', icon: Target },
              { step: '02', title: 'Skill DAG', subtitle: 'Prerequisite Graph', icon: Layers },
              { step: '03', title: 'Syllabus', subtitle: 'Paced Sequence', icon: Compass },
              { step: '04', title: 'Didactic Core', subtitle: 'In-Depth Exposition', icon: BookOpen },
              { step: '05', title: '5 Daily Inquiries', subtitle: 'Calibrated Practice', icon: Code2 },
              { step: '06', title: 'Adaptation', subtitle: 'Next Acquisition', icon: RefreshCw }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.step}
                  className="p-3.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] relative flex flex-col items-center justify-center hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-colors"
                >
                  <span className="text-[10px] font-mono text-[#8B2635] dark:text-[#E08A95] font-bold">{item.step}</span>
                  <div className="w-8 h-8 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#201F1B] flex items-center justify-center my-2 text-[#121212] dark:text-[#F4F2EC]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">{item.title}</h4>
                  <p className="text-[10px] font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-0.5">{item.subtitle}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[#DCD9D1] dark:border-[#2C2A26] flex flex-col sm:flex-row items-center justify-between text-xs font-serif text-[#5C5852] dark:text-[#9E9A91] gap-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B2635] dark:bg-[#E08A95] animate-ping" />
              Real-time pedagogical loop: The engine recalibrates with every response recorded.
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#9E9A91]">
              Print-Grade Quality • Concrete Discipline
            </span>
          </div>
        </div>
      </section>

      {/* Why This Is Different Section */}
      <section className="px-6 py-20 border-b border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-mono text-[10px] uppercase font-bold tracking-[0.2em] text-[#8B2635] dark:text-[#E08A95]">
              Pedagogical Principles
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1">
              Why CogniPath is fundamentally distinct
            </h2>
            <p className="text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-2">
              Traditional drill tools issue rote questions without foundational architecture. We construct deep structural models first.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Personalized Curricular DAG',
                desc: 'Constructed backwards from your target industrial role, verified competencies, and time endowment.',
                tag: 'Tailored Syllabus'
              },
              {
                title: 'Exposition Before Examination',
                desc: 'Never evaluated on untaught mechanisms. High-density didactic treatises with mental blueprints and edge cases.',
                tag: 'Comprehension'
              },
              {
                title: 'Calibrated 5-Question Daily Cadence',
                desc: 'Not monotonous 50-item drudgery. Five deliberate, multi-paradigm inquiries calibrated at your threshold of mastery.',
                tag: 'Consistency'
              },
              {
                title: 'Heuristic Evaluation & Feedback',
                desc: 'Beyond binary validation: algorithmic insights on algorithmic complexity, canonical idioms, and alternative paradigms.',
                tag: 'Insight'
              },
              {
                title: 'Deficit Diagnosis & Remediation',
                desc: 'Identifies conceptual fissures (e.g. microtask mechanics or memory barriers) and immediately prescribes targeted treatises.',
                tag: 'Remediation'
              },
              {
                title: 'Continuous Curricular Synthesis',
                desc: 'The engine actively determines "What ought you to study next?" grounded in empirical performance telemetry.',
                tag: 'Heuristics'
              }
            ].map((card) => (
              <div
                key={card.title}
                className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs border border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] font-bold">
                    {card.tag}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mt-3">{card.title}</h3>
                  <p className="text-xs font-serif text-[#5C5852] dark:text-[#A6A299] mt-2 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Realistic Learner Journey */}
      <section className="px-6 py-20 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] font-bold uppercase tracking-[0.2em]">
              Empirical Trajectory
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1">
              A Scholar's Progression: From Fragmentation to Production Leadership
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                stage: 'Day 01',
                badge: 'Diagnostic Calibration',
                title: 'Syllabus Synthesized: Full Stack Systems Engineer',
                desc: 'Enrolled in JavaScript, React, Node.js, and SQL. Initial diagnostic confirmed procedural fluency but identified asynchronous execution vulnerabilities.'
              },
              {
                stage: 'Day 12',
                badge: 'Conceptual Attainment',
                title: 'Mastery of Lexical Scoping & State Encapsulation',
                desc: 'Completed interactive closure treatise, solved 5 daily inquiries with 92% accuracy, accredited for Custom React Hooks.'
              },
              {
                stage: 'Day 24',
                badge: 'Algorithmic Intervention',
                title: 'Deficit Identified: Event Loop Microtask Scheduling',
                desc: 'Evaluation detected 58% precision in asynchronous queues. The synthesizer automatically scheduled two debugging laboratories prior to Node.js streams.'
              },
              {
                stage: 'Day 45',
                badge: 'Industrial Proficiency',
                title: 'High-Throughput Distributed Architecture Unlocked',
                desc: 'With 84% backend mastery verified, the system unlocked distributed caching and fault-tolerant microservice patterns.'
              }
            ].map((step) => (
              <div
                key={step.stage}
                className="p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="px-2.5 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] font-mono text-xs font-bold text-[#8B2635] dark:text-[#E08A95] shrink-0">
                    {step.stage}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">{step.title}</h4>
                      <span className="text-[9px] font-mono uppercase tracking-wider border border-[#1F3A2B]/30 bg-[#1F3A2B]/10 text-[#1F3A2B] dark:text-[#4E876A] px-2 py-0.5 rounded-xs">
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-6 py-20 bg-[#F4F1EA] dark:bg-[#151412] text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
            Commence your structured curriculum today
          </h2>
          <p className="text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-3 max-w-lg mx-auto">
            Designate your engineering ambition. CogniPath AI constructs the roadmap, delivers the scholarship, and calibrates your daily evolution.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="landing-final-cta"
              onClick={handleStartOnboarding}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-white dark:text-[#121212] font-serif font-bold text-sm transition-all shadow-xs border border-[#121212] dark:border-[#F4F2EC] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Build My Learning Syllabus</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToApp}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xs border border-[#121212] dark:border-[#F4F2EC] bg-[#FFFFFF] dark:bg-[#181714] hover:bg-[#EAE7DF] dark:hover:bg-[#201F1B] text-[#121212] dark:text-[#F4F2EC] font-serif font-bold text-xs cursor-pointer"
            >
              Inspect Student Workspace
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
