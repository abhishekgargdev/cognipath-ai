import React from 'react';
import { Skeleton, SkeletonCard, SkeletonMetricCard, SkeletonText } from './Skeleton';
import { LoadingSpinner } from './LoadingSpinner';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Banner Skeleton */}
      <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>

      {/* Main Focus Section Skeleton */}
      <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <SkeletonText lines={2} />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA]/50 dark:bg-[#1C1B18] space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LessonSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Lesson Header Skeleton */}
      <div className="p-8 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] space-y-4 border-t-3 border-t-[#8B2635] dark:border-t-[#E08A95]">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-16 w-full rounded-xs" />
      </div>

      {/* Content Columns Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={5} />
        </div>
        <div className="hidden lg:block space-y-4">
          <SkeletonCard lines={6} />
        </div>
      </div>
    </div>
  );
};

export const PracticeEvaluationSkeleton: React.FC<{ statusMessage?: string }> = ({
  statusMessage = 'Evaluating solution against AST and performance runtime benchmarks...'
}) => {
  return (
    <div className="p-6 sm:p-8 space-y-6 text-center">
      <LoadingSpinner size="lg" variant="primary" centered />
      <div>
        <h3 className="text-base font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
          Synthesizing Diagnostic Assessment
        </h3>
        <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-1 max-w-md mx-auto">
          {statusMessage}
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-3 pt-2 text-left">
        <div className="p-3 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="p-3 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      </div>
    </div>
  );
};
