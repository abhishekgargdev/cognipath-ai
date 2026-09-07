import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  className?: string;
  variant?: 'primary' | 'neutral' | 'accent';
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
  variant = 'primary',
  centered = false,
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  const variantMap = {
    primary: 'text-[#8B2635] dark:text-[#E08A95]',
    neutral: 'text-[#5C5852] dark:text-[#9E9A91]',
    accent: 'text-[#121212] dark:text-[#F4F2EC]',
  };

  const spinner = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <Loader2 className={`animate-spin ${sizeMap[size]} ${variantMap[variant]}`} />
      {label && (
        <span className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
          {label}
        </span>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-2">
        {spinner}
      </div>
    );
  }

  return spinner;
};
