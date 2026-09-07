import { Metadata } from 'next';
import { ProgressClient } from '@/components/progress/ProgressClient';

export const metadata: Metadata = {
  title: 'Progress Telemetry & Mastery Index | CogniPath AI',
  description: 'Empirical diagnostics, activity chronicle, domain distribution, and weak concept remediation.',
};

export default function ProgressPage() {
  return (
    <div className="p-4 sm:p-8">
      <ProgressClient />
    </div>
  );
}
