import { Metadata } from 'next';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Academic mission control telemetry and daily diagnostic progress.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
