import { Metadata } from 'next';
import { SkillsClient } from '@/components/skills/SkillsClient';

export const metadata: Metadata = {
  title: 'Skills Discovery & Competency Catalog | CogniPath AI',
  description: 'Explore technical canon, skill prerequisites, and batch enrollment.',
};

export default function SkillsPage() {
  return (
    <div className="p-4 sm:p-8">
      <SkillsClient />
    </div>
  );
}
