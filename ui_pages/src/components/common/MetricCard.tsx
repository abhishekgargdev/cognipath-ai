import React from 'react';
import { ArrowRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  tag?: string;
  tagIcon?: React.ReactNode;
  progressPercent?: number;
  progressBarColor?: 'primary' | 'dark' | 'success';
  customIndicator?: React.ReactNode;
  footerText: string;
  footerHighlight?: boolean;
  onClick?: () => void;
  className?: string;
  id?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  tag,
  tagIcon,
  progressPercent,
  progressBarColor = 'primary',
  customIndicator,
  footerText,
  footerHighlight = false,
  onClick,
  className = '',
  id,
}) => {
  const getProgressColor = () => {
    switch (progressBarColor) {
      case 'dark':
        return 'bg-[#121212] dark:bg-[#F4F2EC]';
      case 'success':
        return 'bg-[#1F3A2B] dark:bg-[#4E876A]';
      case 'primary':
      default:
        return 'bg-[#8B2635] dark:bg-[#E08A95]';
    }
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-all cursor-pointer group h-full flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] font-bold text-[#5C5852] dark:text-[#9E9A91]">
            {title}
          </span>
          {tag && (
            <span className="text-xs font-mono font-bold text-[#8B2635] dark:text-[#E08A95] flex items-center gap-1">
              {tagIcon}
              <span>{tag}</span>
            </span>
          )}
          {!tag && tagIcon && <div>{tagIcon}</div>}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
            {value}
          </span>
          {subValue && (
            <span className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
              {subValue}
            </span>
          )}
        </div>

        {customIndicator ? (
          <div className="mt-3">{customIndicator}</div>
        ) : typeof progressPercent === 'number' ? (
          <div className="w-full bg-[#EAE7DF] dark:bg-[#252420] rounded-none h-1.5 mt-3 overflow-hidden">
            <div
              className={`${getProgressColor()} h-full transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        ) : null}
      </div>

      <p className={`text-[11px] font-serif text-[#5C5852] dark:text-[#9E9A91] mt-3.5 pt-2 border-t border-[#DCD9D1]/50 dark:border-[#2C2A26]/50 flex items-center justify-between transition-colors ${
        footerHighlight
          ? 'group-hover:text-[#8B2635] dark:group-hover:text-[#E08A95]'
          : 'group-hover:text-[#121212] dark:group-hover:text-[#F4F2EC]'
      }`}>
        <span>{footerText}</span>
        <ArrowRight className="w-3 h-3 ml-auto transition-transform group-hover:translate-x-0.5" />
      </p>
    </div>
  );
};
