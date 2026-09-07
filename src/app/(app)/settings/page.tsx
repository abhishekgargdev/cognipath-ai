import { Metadata } from 'next';
import { SettingsClient } from '@/components/settings/SettingsClient';

export const metadata: Metadata = {
  title: 'Curator Profile & Settings | CogniPath AI',
  description: 'Manage dossier, daily commitment, pacing, and theme preferences.',
};

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-8">
      <SettingsClient />
    </div>
  );
}
