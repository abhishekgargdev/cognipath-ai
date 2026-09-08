'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const RouteProgressBar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Complete progress on route change
  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Global link click handler for instant click feedback
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      // Check if internal navigation link
      if (
        href &&
        href.startsWith('/') &&
        targetAttr !== '_blank' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.altKey
      ) {
        setIsVisible(true);
        setProgress(20);

        // Animate up to 80% while waiting for page load
        const interval = setInterval(() => {
          setProgress((prev) => (prev < 80 ? prev + Math.floor(Math.random() * 10) + 5 : prev));
        }, 100);

        setTimeout(() => clearInterval(interval), 2000);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      id="route-progress-bar"
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-[#8B2635] dark:bg-[#E08A95] pointer-events-none transition-all duration-200 ease-out shadow-xs"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
      }}
    />
  );
};
