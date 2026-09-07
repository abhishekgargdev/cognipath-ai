import { Metadata } from 'next';
import { LandingClient } from '@/components/landing/LandingClient';

export const metadata: Metadata = {
  title: 'Adaptive Learning Platform for Engineers',
  description: 'Master software engineering through AI-synthesized syllabi, sandboxed coding challenges, and real-time diagnostic evaluation.',
};

export default function LandingPage() {
  return <LandingClient />;
}
