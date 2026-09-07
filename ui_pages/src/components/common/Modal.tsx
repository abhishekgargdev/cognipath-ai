import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '3xl',
  className = '',
  id,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthClasses[maxWidth]} rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F9F7F2] dark:bg-[#121210] shadow-2xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-150 my-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header if title exists */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-3">
            <div className="flex-1 pr-3">
              {title && (
                <div className="text-lg sm:text-xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
                  {title}
                </div>
              )}
              {subtitle && (
                <div className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-0.5">
                  {subtitle}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91] hover:text-[#121212] dark:hover:text-[#F4F2EC] cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
