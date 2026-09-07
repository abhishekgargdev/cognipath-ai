'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/common';

export interface OverviewData {
  aggregateMastery: number;
  harnessAccuracy: number;
  unbrokenCadence: number;
  accreditedXp: number;
  targetGoal: string;
  activityHeatmap: Array<{ day: number; date: string; level: number; count: number }>;
  skillsBreakdown: Array<{ name: string; percent: number; mastered: string }>;
  conceptDrilldown: Array<{ name: string; percent: number; status: string; isWeak?: boolean }>;
}

export interface WeakConceptItem {
  id: string;
  name: string;
  topicId: string;
  category: string;
  masteryPercent: number;
  failureCount: number;
  reason: string;
  recommendedAction: string;
}

export function ProgressClient() {
  const router = useRouter();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [weakConcepts, setWeakConcepts] = useState<WeakConceptItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setIsLoading(true);
        const [overviewRes, weakRes] = await Promise.all([
          fetch('/api/analytics/overview'),
          fetch('/api/analytics/weak-concepts'),
        ]);

        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          setOverview(overviewData);
        }

        if (weakRes.ok) {
          const weakData = await weakRes.json();
          setWeakConcepts(weakData.weakConcepts || []);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center space-y-4">
        <LoadingSpinner size="lg" variant="primary" />
        <p className="text-sm font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
          Aggregating empirical telemetry and mastery index from database...
        </p>
      </div>
    );
  }

  const data = overview || {
    aggregateMastery: 68,
    harnessAccuracy: 86,
    unbrokenCadence: 1,
    accreditedXp: 150,
    targetGoal: 'Full Stack Architect',
    activityHeatmap: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      date: `Day ${i + 1}`,
      level: i < 5 ? 1 : i === 8 ? 0 : i < 18 ? 2 : 3,
      count: i * 2,
    })),
    skillsBreakdown: [
      { name: 'JavaScript', percent: 88, mastered: '8/9 concepts' },
      { name: 'React & Next.js', percent: 72, mastered: '6/8 concepts' },
      { name: 'Data Structures & Algorithms', percent: 69, mastered: '11/16 concepts' },
      { name: 'Node.js & Express', percent: 61, mastered: '4/7 concepts' },
      { name: 'MongoDB & Databases', percent: 54, mastered: '3/6 concepts' },
    ],
    conceptDrilldown: [
      { name: 'Variables & Scope', percent: 96, status: 'Mastered', isWeak: false },
      { name: 'Functions & First-Class Citizency', percent: 91, status: 'Mastered', isWeak: false },
      { name: 'Closures & Lexical Environments', percent: 78, status: 'Solid', isWeak: false },
      { name: 'Promises & Chained Error Bubbling', percent: 63, status: 'Weak', isWeak: true },
      { name: 'Async/Await & Microtask Priority', percent: 58, status: 'Weak', isWeak: true },
    ],
  };

  return (
    <div id="progress-view" className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
          Empirical Diagnostics & Telemetry
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight mt-1">
          Mastery Index & Competency Trajectory
        </h1>
        <p className="text-xs sm:text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1">
          Formal evaluation of technical readiness toward the target specialization: {data.targetGoal}.
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs border-t-2 border-t-[#121212] dark:border-t-[#F4F2EC]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] font-bold">Aggregate Mastery</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">{data.aggregateMastery}%</span>
            <span className="text-xs font-mono font-bold text-[#1F3A2B] dark:text-[#4E876A]">+6%</span>
          </div>
          <div className="w-full bg-[#EAE7DF] dark:bg-[#252420] rounded-xs h-1 mt-2">
            <div className="bg-[#121212] dark:bg-[#F4F2EC] h-full rounded-xs" style={{ width: `${data.aggregateMastery}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs border-t-2 border-t-[#8B2635] dark:border-t-[#E08A95]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] font-bold">Harness Accuracy</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">{data.harnessAccuracy}%</span>
            <span className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">all-time</span>
          </div>
          <p className="text-[11px] font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-2">High test assertion pass rate</p>
        </div>

        <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs border-t-2 border-t-[#DCD9D1] dark:border-t-[#2C2A26]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] font-bold">Unbroken Cadence</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-black text-[#8B2635] dark:text-[#E08A95]">{data.unbrokenCadence}</span>
            <span className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">days</span>
          </div>
          <p className="text-[11px] font-serif italic text-[#8B2635] dark:text-[#E08A95] mt-2">Upper 5th percentile regularity</p>
        </div>

        <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs border-t-2 border-t-[#1F3A2B] dark:border-t-[#4E876A]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] font-bold">Accredited Experience</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
              {data.accreditedXp.toLocaleString()}
            </span>
            <span className="text-xs font-mono text-[#5C5852] dark:text-[#9E9A91]">XP</span>
          </div>
          <p className="text-[11px] font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-2">Senior Fellow Tier</p>
        </div>
      </div>

      {/* 30-Day Activity Heatmap */}
      <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
            <h3 className="text-base font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
              Activity Chronicle (30-Day Practicum Record)
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5C5852] dark:text-[#9E9A91]">
            <span>Low</span>
            <div className="w-3 h-3 rounded-xs bg-[#F4F1EA] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26]" />
            <div className="w-3 h-3 rounded-xs bg-[#DCD9D1] dark:bg-[#38352F]" />
            <div className="w-3 h-3 rounded-xs bg-[#8B2635]/40" />
            <div className="w-3 h-3 rounded-xs bg-[#8B2635]" />
            <span>High</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-2 pt-2">
          {data.activityHeatmap.map((d) => {
            const colors = [
              'bg-[#F4F1EA] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#9E9A91]',
              'bg-[#DCD9D1] dark:bg-[#38352F] text-[#121212] dark:text-[#F4F2EC]',
              'bg-[#8B2635]/40 text-white font-bold',
              'bg-[#8B2635] text-white font-bold',
            ];
            return (
              <div
                key={d.day}
                className={`h-8 rounded-xs ${colors[d.level]} flex items-center justify-center text-[10px] font-mono transition-transform hover:scale-105 cursor-pointer`}
                title={`${d.date}: ${d.count || d.level * 3} challenges completed`}
              >
                {d.day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Breakdown: Skills Mastery & Deep Concept Drilldown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Overall Skills Breakdown */}
        <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4">
          <h3 className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider">
            Domain Distribution Index
          </h3>

          <div className="space-y-4 pt-1">
            {data.skillsBreakdown.map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">{s.name}</span>
                  <span className="font-mono font-bold text-[#121212] dark:text-[#F4F2EC]">{s.percent}%</span>
                </div>
                <div className="w-full bg-[#EAE7DF] dark:bg-[#252420] rounded-xs h-1.5 overflow-hidden">
                  <div
                    className="bg-[#121212] dark:bg-[#F4F2EC] h-full rounded-xs transition-all"
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
                  <span>{s.mastered}</span>
                  <span className="not-italic font-mono text-[10px] uppercase font-bold text-[#8B2635] dark:text-[#E08A95]">
                    {s.percent > 75 ? 'Proficient' : 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Deep Concept Tree with Weak flags */}
        <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider">
              JavaScript Core Dissection
            </h3>
            <span className="text-xs text-[#5C5852] dark:text-[#9E9A91] font-mono">Foundations Track</span>
          </div>

          <div className="divide-y divide-[#DCD9D1] dark:divide-[#2C2A26]">
            {data.conceptDrilldown.map((c) => (
              <div key={c.name} className="py-3 flex items-center justify-between text-xs font-serif">
                <div className="flex items-center gap-2">
                  <span className="text-[#121212] dark:text-[#EAE7DF]">{c.name}</span>
                  {c.isWeak && (
                    <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-mono font-bold uppercase tracking-wider border border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95]">
                      Review
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#121212] dark:text-[#F4F2EC]">{c.percent}%</span>
                  <span className="text-[11px] font-mono text-[#5C5852] dark:text-[#9E9A91]">{c.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => router.push('/learn/js-event-loop')}
              className="w-full py-2.5 rounded-xs bg-[#F4F1EA] dark:bg-[#1E1D19] hover:bg-[#EAE7DF] dark:hover:bg-[#282622] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#8B2635] dark:text-[#E08A95] font-serif font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>Address Weak Concepts in Asynchronous Runtime</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED WEAK AREAS REMEDIATION SECTION */}
      <div className="p-6 rounded-xs border border-[#8B2635]/40 bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4 border-l-4 border-l-[#8B2635] dark:border-l-[#E08A95]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#8B2635] dark:text-[#E08A95]" />
            <div>
              <h3 className="text-base font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
                Curricular Remediation Recommendations
              </h3>
              <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
                Identified deterministically from code execution diagnostics and asymptotic complexity analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {weakConcepts.map((weak) => (
            <div
              key={weak.id}
              className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">{weak.name}</h4>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95]">
                  {weak.masteryPercent}% Mastery
                </span>
              </div>

              <p className="text-xs font-serif text-[#5C5852] dark:text-[#A6A299] leading-relaxed">
                {weak.reason}
              </p>

              <div className="p-2.5 rounded-xs bg-[#FFFFFF] dark:bg-[#1E1D19] border border-[#DCD9D1] dark:border-[#2C2A26] text-[11px] font-serif text-[#5C5852] dark:text-[#B5B1A7]">
                <strong className="font-bold text-[#121212] dark:text-[#F4F2EC] not-italic">Prescribed Remediation:</strong> {weak.recommendedAction}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => router.push(`/learn/${weak.topicId || 'js-event-loop'}`)}
                  className="px-3 py-1.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#201F1B] text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] hover:bg-[#EAE7DF] cursor-pointer"
                >
                  Consult Syllabus
                </button>
                <button
                  onClick={() => router.push(`/practice?topicId=${weak.topicId || 'js-event-loop'}`)}
                  className="px-3.5 py-1.5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-white dark:text-[#121212] text-xs font-serif font-bold cursor-pointer border border-[#121212] dark:border-[#F4F2EC]"
                >
                  Launch Practicum
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
