import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-xs border border-dashed border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] space-y-3 ${className}`}>
      {icon && (
        <div className="mx-auto w-10 h-10 rounded-xs bg-[#F4F1EA] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-center text-[#8B2635] dark:text-[#E08A95]">
          {icon}
        </div>
      )}
      <h3 className="text-base font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
        {title}
      </h3>
      <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
