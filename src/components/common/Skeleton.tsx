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

