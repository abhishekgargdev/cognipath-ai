import React from 'react';
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
import { BookOpen, CheckCircle2, Flame, Sparkles } from 'lucide-react';

export default function DashboardPage() {
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
              Active Roadmap
            </Badge>
          </div>
          <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-1">
            Adaptive pedagogical telemetry & daily diagnostic practice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
            Resume Monograph
          </Button>
          <Button variant="primary" size="sm" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
            Daily Practice
          </Button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Daily Exercises"
          value="4 / 10"
          subValue="60% target"
          tag="40% REMAINING"
          progressPercent={40}
          progressBarColor="primary"
          footerText="Continue daily diagnostic queue"
          footerHighlight
        />

        <MetricCard
          title="Curriculum Mastery"
          value="42%"
          subValue="+4% this week"
          tagIcon={<Sparkles className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />}
          progressPercent={42}
          progressBarColor="success"
          footerText="Inspect topological roadmap"
        />

        <MetricCard
          title="Streak Matrix"
          value="18 Days"
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
                <span className="text-xs font-mono text-[#5C5852] dark:text-[#9E9A91]">Est. 25 mins</span>
              </div>
              <CardTitle>JavaScript Event Loop & Microtask Execution</CardTitle>
              <CardDescription>
                Deep dive into task queues, MutationObserver callbacks, and event loop tick sequencing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-serif text-[#5C5852] dark:text-[#A6A299] leading-relaxed">
                Understand how V8 schedules microtasks vs macrotasks during browser paint steps and asynchronous promises execution.
              </p>
              <div className="pt-3 flex items-center gap-3">
                <Button variant="primary" size="sm">
                  Commence Monograph
                </Button>
                <Button variant="ghost" size="sm">
                  View Subtopics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Async Status & Skeleton Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Telemetry</CardTitle>
              <CardDescription>Live background calibration status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#1B1A16] flex items-center justify-between">
                <span className="text-xs font-serif text-[#121212] dark:text-[#F4F2EC]">Evaluating AST Sandbox</span>
                <LoadingSpinner size="sm" variant="primary" />
              </div>
              <SkeletonMetricCard />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
