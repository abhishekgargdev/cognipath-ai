import React from 'react';

export type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'neutral' 
  | 'outline';

export type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  icon,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#121212] dark:text-[#F4F2EC]',
    primary: 'border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95]',
    success: 'border-[#1F3A2B]/40 bg-[#1F3A2B]/10 text-[#1F3A2B] dark:text-[#4E876A]',
    error: 'border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95]',
    warning: 'border-[#B45309]/40 bg-[#B45309]/10 text-[#B45309] dark:text-[#FBBF24]',
    neutral: 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91]',
    outline: 'border-[#DCD9D1] dark:border-[#2C2A26] bg-transparent text-[#5C5852] dark:text-[#9E9A91]',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[9px] px-1.5 py-0.5 font-mono tracking-wider',
    md: 'text-[10px] px-2.5 py-1 font-mono tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold uppercase rounded-xs border whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
