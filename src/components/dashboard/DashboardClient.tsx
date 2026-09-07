'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Button, 
  Badge, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  MetricCard, 
  LoadingSpinner, 
  SkeletonMetricCard 
} from '@/components/common';
import { BookOpen, CheckCircle2, Flame, Sparkles, ArrowRight } from 'lucide-react';

export function DashboardClient() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-8 w-64 bg-[#EAE7DF] dark:bg-[#252420] rounded-xs" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonMetricCard />
          <SkeletonMetricCard />
          <SkeletonMetricCard />
        </div>
      </div>
    );
  }

  const { profile, currentTopic } = data;
  const completedToday = profile?.completedQuestionsToday || 0;
  const targetToday = profile?.totalQuestionsTargetToday || 5;
  const remainingPercent = Math.max(0, Math.round(((targetToday - completedToday) / targetToday) * 100));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-black tracking-tight text-[#121212] dark:text-[#F4F2EC]">
              Academic Mission Control
            </h1>
            <Badge variant="primary" size="sm" icon={<Sparkles className="w-3 h-3" />}>
              {profile?.targetGoal || 'Active Curriculum'}
            </Badge>
          </div>
          <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-1">
            Adaptive pedagogical telemetry & daily diagnostic practice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/learn/${currentTopic?.id || 'js-event-loop'}`}>
            <Button variant="secondary" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
              Resume Monograph
            </Button>
          </Link>
          <Link href="/practice">
            <Button variant="primary" size="sm" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
              Daily Practice
            </Button>
          </Link>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Daily Exercises"
          value={`${completedToday} / ${targetToday}`}
          subValue={`${Math.round((completedToday / targetToday) * 100)}% target`}
          tag={`${remainingPercent}% REMAINING`}
          progressPercent={Math.round((completedToday / targetToday) * 100)}
          progressBarColor="primary"
          footerText="Continue daily diagnostic queue"
          footerHighlight
        />

        <MetricCard
          title="Curriculum Mastery"
          value={`${profile?.overallMastery || 0}%`}
          subValue="Active progress"
          tagIcon={<Sparkles className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />}
          progressPercent={profile?.overallMastery || 0}
          progressBarColor="success"
          footerText="Inspect topological roadmap"
        />

        <MetricCard
          title="Streak Matrix"
          value={`${profile?.streakDays || 0} Days`}
          subValue="Personal record"
          tag="STREAK ACTIVE"
          tagIcon={<Flame className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />}
          customIndicator={
            <div className="flex items-center gap-1 mt-3">
              {[1, 1, 1, 1, 1, 1, 0].map((active, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-xs ${
                    active 
                      ? 'bg-[#8B2635] dark:bg-[#E08A95]' 
                      : 'bg-[#EAE7DF] dark:bg-[#252420]'
                  }`}
                />
              ))}
            </div>
          }
          footerText="View consistency log"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Focus Topic */}
        <div className="lg:col-span-2 space-y-4">
          <Card accentTop accentVariant="primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Current Thesis</Badge>
                <span className="text-xs font-mono text-[#5C5852] dark:text-[#9E9A91]">
                  Est. {currentTopic?.estMinutes || 25} mins
                </span>
              </div>
              <CardTitle>{currentTopic?.title || 'JavaScript Event Loop'}</CardTitle>
              <CardDescription>
                {currentTopic?.description || 'Deep dive into async task queues and event loop tick sequencing.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-serif text-[#5C5852] dark:text-[#A6A299] leading-relaxed mb-4">
                {currentTopic?.whyItMatters || 'Essential foundation for non-blocking asynchronous system design.'}
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link href={`/learn/${currentTopic?.id || 'js-event-loop'}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Commence Monograph
                  </Button>
                </Link>
                <Link href="/roadmap">
                  <Button variant="ghost" size="sm">
                    View Full Roadmap
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: System Telemetry */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Telemetry</CardTitle>
              <CardDescription>Live background calibration status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#1B1A16] flex items-center justify-between">
                <span className="text-xs font-serif text-[#121212] dark:text-[#F4F2EC]">Sandbox Operational</span>
                <LoadingSpinner size="sm" variant="primary" />
              </div>
              <div className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
                XP Balance: <strong className="font-mono text-[#121212] dark:text-[#F4F2EC]">{profile?.xp || 0} XP</strong>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
