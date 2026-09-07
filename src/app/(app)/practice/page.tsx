import { Metadata } from 'next';
import { PracticeClient } from '@/components/practice/PracticeClient';

export const metadata: Metadata = {
  title: 'Applied Practicum & Code Sandbox | CogniPath AI',
  description: 'Sandboxed code execution, practice exercises, and real-time AI diagnostic evaluation.',
};

export default function PracticePage() {
  return (
    <div className="p-4 sm:p-8">
      <PracticeClient />
    </div>
  );
}
