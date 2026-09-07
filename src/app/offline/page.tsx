import { Metadata } from 'next';
import Link from 'next/link';
import { WifiOff, RefreshCw, BookOpen, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Offline Telemetry',
  description: 'Network connection unavailable. Accessing cached CogniPath AI resources.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/10 mx-auto flex items-center justify-center text-[#8B2635] dark:text-[#E08A95]">
          <WifiOff className="w-8 h-8" />
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-[#8B2635] dark:text-[#E08A95]">
            Offline Protocol Engaged
          </span>
          <h1 className="text-2xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1">
            Network Connection Severed
          </h1>
          <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-2 leading-relaxed">
            Your device is disconnected from the global network. Cached monographs and previously loaded syllabus data remain accessible offline.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            href="/dashboard"
            className="w-full py-2.5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-white dark:text-[#121212] font-serif font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 border border-[#121212] dark:border-[#F4F2EC]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Attempt Telemetry Reconnection</span>
          </Link>

          <Link
            href="/roadmap"
            className="w-full py-2.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] hover:bg-[#EAE7DF] dark:hover:bg-[#2A2823] text-[#121212] dark:text-[#F4F2EC] font-serif font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />
            <span>View Cached Roadmap</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-center gap-2 text-[10px] font-mono text-[#5C5852] dark:text-[#9E9A91]">
          <Sparkles className="w-3 h-3 text-[#8B2635] dark:text-[#E08A95]" />
          <span>CogniPath AI PWA Service Worker v1.0</span>
        </div>
      </div>
    </div>
  );
}
