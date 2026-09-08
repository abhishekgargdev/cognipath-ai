import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'text':
        return 'rounded-xs h-4 my-1';
      case 'rectangular':
      default:
        return 'rounded-xs';
    }
  };

  return (
    <div
      className={`animate-pulse bg-[#E5E2DA] dark:bg-[#25231F] ${getVariantClasses()} ${className}`}
      style={{
        width,
        height,
        ...style
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={i === lines - 1 ? 'w-3/4' : 'w-full'} 
        />
      ))}
    </div>
  );
};

export const SkeletonBadge: React.FC<{ width?: string; className?: string }> = ({
  width = '64px',
  className = ''
}) => {
  return <Skeleton className={`h-5 ${className}`} style={{ width }} />;
};

export const SkeletonCard: React.FC<{ className?: string; lines?: number }> = ({
  className = '',
  lines = 2
}) => {
  return (
    <div className={`p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <SkeletonBadge width="80px" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-6 w-2/3" />
      <SkeletonText lines={lines} />
      <div className="pt-2 border-t border-[#DCD9D1]/40 dark:border-[#2C2A26]/40 flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};

export const SkeletonMetricCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] h-full flex flex-col justify-between space-y-4 ${className}`}>
      <div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-1.5 w-full mt-3" />
      </div>
      <div className="pt-2 border-t border-[#DCD9D1]/50 dark:border-[#2C2A26]/50 flex items-center justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-4" />
      </div>
    </div>
  );
};

export const PracticeEvaluationSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
};

/* --- VIEW SKELETONS FOR ROUTE & CLIENT FETCH LOADING STATES --- */

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="flex items-center justify-between border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-4">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-3 w-48 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard lines={4} />
        </div>
        <div>
          <SkeletonCard lines={2} />
        </div>
      </div>
    </div>
  );
};

export const RoadmapSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-4">
        <div>
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-9 w-64" />
        </div>
        <Skeleton className="h-16 w-56" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="space-y-4">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
    </div>
  );
};

export const LessonSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto p-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-20 w-full" />
      <div className="space-y-4">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );
};

export const PracticeSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-36" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard lines={6} />
        <SkeletonCard lines={6} />
      </div>
    </div>
  );
};

export const ProgressSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-5xl mx-auto p-4">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>
      <SkeletonCard lines={4} />
    </div>
  );
};

export const SkillsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-5xl mx-auto p-4">
      <Skeleton className="h-9 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
    </div>
  );
};

export const RecommendationsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto p-4">
      <Skeleton className="h-9 w-64" />
      <div className="space-y-4">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
    </div>
  );
};

export const SettingsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse max-w-3xl mx-auto p-4">
      <Skeleton className="h-9 w-48" />
      <SkeletonCard lines={4} />
      <SkeletonCard lines={3} />
    </div>
  );
};
