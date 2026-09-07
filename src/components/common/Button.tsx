import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger'
  | 'academic';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#121212] text-white hover:bg-[#2A2A2A] dark:bg-[#F4F2EC] dark:text-[#121212] dark:hover:bg-[#FFFFFF] border border-[#121212] dark:border-[#F4F2EC] shadow-xs',
    secondary: 'bg-[#F4F1EA] text-[#121212] hover:bg-[#EAE7DF] dark:bg-[#201F1B] dark:text-[#F4F2EC] dark:hover:bg-[#2C2A26] border border-[#DCD9D1] dark:border-[#2C2A26]',
    outline: 'bg-transparent text-[#121212] hover:bg-[#F4F1EA] dark:text-[#F4F2EC] dark:hover:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26]',
    ghost: 'bg-transparent text-[#5C5852] hover:text-[#121212] dark:text-[#9E9A91] dark:hover:text-[#F4F2EC] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] border-transparent',
    danger: 'bg-[#8B2635] text-white hover:bg-[#731E2A] dark:bg-[#E08A95] dark:text-[#121210] dark:hover:bg-[#D47582] border border-[#8B2635] dark:border-[#E08A95]',
    academic: 'bg-[#FFFFFF] text-[#121212] hover:border-[#121212] dark:bg-[#181714] dark:text-[#F4F2EC] dark:hover:border-[#F4F2EC] border border-[#DCD9D1] dark:border-[#2C2A26] shadow-xs',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2 gap-2',
    lg: 'text-sm px-6 py-2.5 gap-2.5 font-bold',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-serif font-bold rounded-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${fullWidth ? 'w-full' : ''} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
