import React from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard, Button, Badge } from '../common';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  BookOpen, 
  AlertCircle, 
  Flame, 
  Clock, 
  Layers, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Compass
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    user, 
    setActiveView, 
    startTopicLearning, 
    startDailyPractice,
    weakConcepts,
    roadmapMilestones,
    aiRecommendations
  } = useApp();

  // Find active node in progress
  const allNodes = roadmapMilestones.flatMap(ms => ms.nodes);
  const currentNode = allNodes.find(n => n.id === user.currentTopicId) || allNodes[2];

  // Calculate percentage of today's questions
  const dailyPercent = Math.round((user.completedQuestionsToday / user.totalQuestionsTargetToday) * 100);

  return (
    <div id="dashboard-view" className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Personalized Greeting Header with Editorial Front-Page Structure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8B2635] dark:text-[#E08A95] font-bold">
              TODAY'S CURRICULUM DISPATCH
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight mt-0.5">
            Good morning, {user.name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1">
            Continuing intellectual progress toward <span className="font-bold not-italic text-[#121212] dark:text-[#F4F2EC] underline decoration-[#8B2635] underline-offset-4">{user.targetGoal}</span>.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2.5">
          <Button
            id="dashboard-continue-learning-btn"
            variant="primary"
            leftIcon={<BookOpen className="w-4 h-4" />}
            onClick={() => startTopicLearning(currentNode.id)}
          >
            Continue Lesson
          </Button>
          <Button
            id="dashboard-practice-btn"
            variant="academic"
            leftIcon={<CheckCircle2 className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />}
            onClick={() => startDailyPractice()}
          >
            Daily Practice
          </Button>
        </div>
      </div>

      {/* Top 3 Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Today's Practice Progress */}
        <MetricCard
          id="dashboard-metric-practice"
          title="Daily Exercises"
          value={`${dailyPercent}%`}
          subValue="completed"
          tag={`${user.completedQuestionsToday} / ${user.totalQuestionsTargetToday}`}
          progressPercent={dailyPercent}
          progressBarColor="primary"
          footerText={`${Math.max(0, user.totalQuestionsTargetToday - user.completedQuestionsToday)} questions remaining (~10 mins)`}
          onClick={() => startDailyPractice()}
        />

        {/* Metric 2: Overall Target Mastery */}
        <MetricCard
          id="dashboard-metric-mastery"
          title="Curriculum Index"
          value={`${user.overallMastery}%`}
          subValue="+4% this week"
          tag="12 / 28 Modules"
          progressPercent={user.overallMastery}
          progressBarColor="dark"
          footerText="Foundations & Frontend on track"
          onClick={() => setActiveView('progress')}
        />

        {/* Metric 3: Active Learning Streak */}
        <MetricCard
          id="dashboard-metric-streak"
          title="Academic Streak"
          value={user.streakDays}
          subValue="consecutive days"
          tagIcon={<Flame className="w-4 h-4 text-[#8B2635] fill-[#8B2635] dark:text-[#E08A95] dark:fill-[#E08A95]" />}
          customIndicator={
            <div className="flex gap-1.5 mt-3">
              {[1, 2, 3, 4, 5, 6, 7].map((day, idx) => (
                <div 
                  key={day}
                  className={`flex-1 h-1.5 rounded-none ${
                    idx < 5 
                      ? 'bg-[#8B2635] dark:bg-[#E08A95]' 
                      : idx === 5 
                      ? 'bg-[#8B2635]/50 dark:bg-[#E08A95]/50' 
                      : 'bg-[#EAE7DF] dark:bg-[#252420]'
                  }`}
                  title={`Day ${day}`}
                />
              ))}
            </div>
          }
          footerText="Milestone at 21 days (+100 XP)"
          footerHighlight={true}
          onClick={() => setActiveView('progress')}
        />
      </div>

      {/* Main Grid: Continue Learning + Daily Focus Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Feature Lead Topic & Focus Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Topic Card (Editorial Feature Article Format) */}
          <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] relative overflow-hidden shadow-xs border-t-3 border-t-[#8B2635] dark:border-t-[#E08A95]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-[#8B2635] dark:text-[#E08A95] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#8B2635] dark:bg-[#E08A95]" />
                CURRENTLY STUDYING
              </span>
              <span className="font-mono text-[10px] tracking-wider uppercase border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] px-2 py-0.5 rounded-xs text-[#121212] dark:text-[#F4F2EC] font-bold">
                {currentNode.masteryPercent}% MASTERED
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight">
              {currentNode.title}
            </h2>
            <p className="text-xs font-serif text-[#5C5852] dark:text-[#A6A299] mt-1.5 leading-relaxed max-w-xl">
              {currentNode.description}
            </p>

            {/* Why it matters callout (Editorial Pull-Quote Style) */}
            <div className="mt-4 p-4 rounded-xs border-l-2 border-l-[#8B2635] dark:border-l-[#E08A95] bg-[#F4F1EA] dark:bg-[#1F1E1A] text-xs text-[#121212] dark:text-[#F4F2EC]">
              <span className="font-serif font-bold uppercase tracking-wider text-[10px] text-[#8B2635] dark:text-[#E08A95] block mb-1">
                Pedagogical Rationale:
              </span>
              <p className="font-serif italic text-xs leading-relaxed text-[#5C5852] dark:text-[#B5B1A7]">
                "{currentNode.whyItMatters}"
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#DCD9D1] dark:border-[#2C2A26]">
              <div className="flex items-center gap-3 text-xs font-mono text-[#5C5852] dark:text-[#9E9A91]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ~{currentNode.estMinutes} mins
                </span>
                <span>•</span>
                <span>Difficulty: {currentNode.difficulty}</span>
              </div>

              <button
                id="dashboard-resume-lesson-cta"
                onClick={() => startTopicLearning(currentNode.id)}
                className="px-4 py-2 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2C2A26] dark:hover:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#121212] font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all border border-[#121212] dark:border-[#F4F2EC]"
              >
                <span>Continue Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Today's Focus Card */}
          <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#DCD9D1]/60 dark:border-[#2C2A26]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xs bg-[#F4F1EA] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#8B2635] dark:text-[#E08A95] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
                    Today's Practice Focus
                  </h3>
                  <p className="text-[10px] font-mono text-[#5C5852] dark:text-[#9E9A91] uppercase tracking-wider">5 Questions • ~25 minutes total</p>
                </div>
              </div>

              <button
                onClick={() => startDailyPractice()}
                className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] hover:text-[#8B2635] dark:hover:text-[#E08A95] underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                Start Practice <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xs bg-[#F4F1EA]/70 dark:bg-[#1C1B18] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#8B2635] dark:text-[#E08A95] block mb-1">
                Adaptive Diagnostics:
              </span>
              <p className="font-serif italic text-xs text-[#5C5852] dark:text-[#B5B1A7] leading-relaxed">
                "Your recent answers demonstrate that lexical closures are well grasped (78%), but asynchronous microtask sequencing (58%) requires targeted exercise before entering Node.js streams."
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
              <div 
                onClick={() => startDailyPractice()}
                className="p-2.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#201F1B] text-xs hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#1F3A2B] dark:text-[#4E876A] uppercase font-mono font-bold tracking-wider">Q1 Concept</span>
                    <CheckCircle2 className="w-3 h-3 text-[#1F3A2B] dark:text-[#4E876A]" />
                  </div>
                  <p className="font-serif font-bold text-xs text-[#121212] dark:text-[#F4F2EC] mt-1 line-clamp-1">Lexical Scope</p>
                </div>
                <span className="text-[9px] font-mono text-[#5C5852] dark:text-[#9E9A91] mt-2 block">Done</span>
              </div>

              <div 
                onClick={() => startDailyPractice()}
                className="p-2.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#201F1B] text-xs hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#1F3A2B] dark:text-[#4E876A] uppercase font-mono font-bold tracking-wider">Q2 Output</span>
                    <CheckCircle2 className="w-3 h-3 text-[#1F3A2B] dark:text-[#4E876A]" />
                  </div>
                  <p className="font-serif font-bold text-xs text-[#121212] dark:text-[#F4F2EC] mt-1 line-clamp-1">Event Loop</p>
                </div>
                <span className="text-[9px] font-mono text-[#5C5852] dark:text-[#9E9A91] mt-2 block">Done</span>
              </div>

              <div 
                onClick={() => startDailyPractice()}
                className="p-2.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#201F1B] text-xs hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#1F3A2B] dark:text-[#4E876A] uppercase font-mono font-bold tracking-wider">Q3 MCQ</span>
                    <CheckCircle2 className="w-3 h-3 text-[#1F3A2B] dark:text-[#4E876A]" />
                  </div>
                  <p className="font-serif font-bold text-xs text-[#121212] dark:text-[#F4F2EC] mt-1 line-clamp-1">Currying Func</p>
                </div>
                <span className="text-[9px] font-mono text-[#5C5852] dark:text-[#9E9A91] mt-2 block">Done</span>
              </div>

              <div 
                onClick={() => startDailyPractice()}
                className="p-2.5 rounded-xs border-2 border-[#8B2635] dark:border-[#E08A95] bg-[#FFFFFF] dark:bg-[#201F1B] text-xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#8B2635] dark:text-[#E08A95] uppercase font-mono font-bold tracking-wider">Q4 Coding</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B2635] dark:bg-[#E08A95] animate-pulse" />
                  </div>
                  <p className="font-serif font-bold text-xs text-[#121212] dark:text-[#F4F2EC] mt-1 line-clamp-1">createOnce</p>
                </div>
                <span className="text-[9px] font-mono text-[#8B2635] dark:text-[#E08A95] font-bold mt-2 block">In Progress</span>
              </div>

              <div 
                onClick={() => startDailyPractice()}
                className="p-2.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA]/50 dark:bg-[#181714] text-xs hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-[#5C5852] dark:text-[#9E9A91] uppercase font-mono tracking-wider">Q5 Output</span>
                    <Clock className="w-3 h-3 text-[#9E9A91]" />
                  </div>
                  <p className="font-serif font-bold text-xs text-[#121212] dark:text-[#F4F2EC] mt-1 line-clamp-1">Shadowing</p>
                </div>
                <span className="text-[9px] font-mono text-[#5C5852] dark:text-[#9E9A91] mt-2 block">Queued</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Insights, Weak Areas, & Roadmap Snap */}
        <div className="space-y-6">
          {/* AI Mentor Insight Card (Editorial Columnist Note) */}
          <div className="p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#1A1916] shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-[#8B2635] dark:text-[#E08A95] text-[10px] font-mono font-bold uppercase tracking-[0.2em] pb-2 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Advisor Assessment</span>
            </div>
            <p className="text-xs font-serif text-[#121212] dark:text-[#F4F2EC] leading-relaxed">
              "Your weekly conceptual foundation has advanced notably (+8%). The highest leverage investment for your trajectory is solidifying microtask vs macrotask execution order."
            </p>
            <div className="mt-4 pt-3 border-t border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-between text-xs">
              <span className="text-[#5C5852] dark:text-[#9E9A91] font-mono text-[10px] uppercase tracking-wider">Suggested action:</span>
              <button 
                onClick={() => startTopicLearning('async-event-loop')}
                className="text-xs font-serif font-bold text-[#8B2635] dark:text-[#E08A95] hover:underline cursor-pointer"
              >
                Review Event Loop →
              </button>
            </div>
          </div>

          {/* Weak Areas Card */}
          <div className="p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#DCD9D1]/60 dark:border-[#2C2A26]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
                <h3 className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider">
                  Requisite Revisions
                </h3>
              </div>
              <span className="text-[10px] text-[#5C5852] dark:text-[#9E9A91] font-mono uppercase">2 flagged</span>
            </div>

            <div className="space-y-2.5">
              {weakConcepts.slice(0, 2).map((weak) => (
                <div 
                  key={weak.id}
                  className="p-3 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA]/60 dark:bg-[#1E1D19]/60 hover:bg-[#F4F1EA] dark:hover:bg-[#1E1D19] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">{weak.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#141412] text-[#8B2635] dark:text-[#E08A95] font-bold">
                      {weak.masteryPercent}%
                    </span>
                  </div>
                  <p className="text-[11px] font-serif text-[#5C5852] dark:text-[#B5B1A7] mt-1 line-clamp-2 leading-relaxed">
                    {weak.reason}
                  </p>
                  <div className="mt-2 flex items-center justify-end">
                    <button
                      onClick={() => startTopicLearning(weak.topicId)}
                      className="text-[11px] font-serif font-bold text-[#121212] dark:text-[#F4F2EC] hover:text-[#8B2635] dark:hover:text-[#E08A95] underline flex items-center gap-1 cursor-pointer"
                    >
                      Review Concept <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Roadmap Navigation Card */}
          <div 
            onClick={() => setActiveView('roadmap')}
            className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xs bg-[#F4F1EA] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-center text-[#121212] dark:text-[#F4F2EC]">
                <Compass className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
              </div>
              <div>
                <p className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">Comprehensive Syllabus</p>
                <p className="text-[10px] font-mono text-[#5C5852] dark:text-[#9E9A91] uppercase tracking-wider">5 Tracks • 28 Modules</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5C5852] dark:text-[#9E9A91]" />
          </div>
        </div>
      </div>
    </div>
  );
};
