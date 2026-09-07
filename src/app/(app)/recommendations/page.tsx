import { Metadata } from 'next';
import { RecommendationsClient } from '@/components/recommendations/RecommendationsClient';

export const metadata: Metadata = {
  title: 'Adaptive AI Recommendations | CogniPath AI',
  description: 'AI-prescribed skill trajectory and dynamic roadmap incorporation.',
};

export default function RecommendationsPage() {
  return (
    <div className="p-4 sm:p-8">
      <RecommendationsClient />
    </div>
  );
}
