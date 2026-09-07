import { Metadata } from 'next';
import { OnboardingClient } from '@/components/onboarding/OnboardingClient';

export const metadata: Metadata = {
  title: 'Curriculum Onboarding',
  description: 'Designate career goals, skills proficiency, and daily study commitment.',
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}
