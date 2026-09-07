import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  accentTop?: boolean;
  accentVariant?: 'primary' | 'success' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  accentTop = false,
  accentVariant = 'primary',
  ...props
}) => {
  const accentStyles = accentTop
    ? accentVariant === 'success'
      ? 'border-t-3 border-t-[#1F3A2B] dark:border-t-[#4E876A]'
      : 'border-t-3 border-t-[#8B2635] dark:border-t-[#E08A95]'
    : '';

  const hoverStyles = hoverable
    ? 'hover:border-[#121212] dark:hover:border-[#F4F2EC] cursor-pointer transition-all'
    : '';

  return (
    <div
      className={`rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs p-5 ${accentStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`space-y-1.5 pb-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-lg font-serif font-bold text-[#121212] dark:text-[#F4F2EC] tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs font-serif italic text-[#5C5852] dark:text-[#A6A299] leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`space-y-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`pt-3 border-t border-[#DCD9D1]/50 dark:border-[#2C2A26]/50 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);
