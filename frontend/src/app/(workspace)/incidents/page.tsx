import type { Metadata } from 'next';
import { Suspense } from 'react';
import { IncidentsView } from '@/components/incidents/incidents-view';

export const metadata: Metadata = {
  title: 'Incidents',
  description: 'Search and filter the operational security incident queue.',
};

export default function IncidentsPage() {
  return (
    <Suspense fallback={<main className="site-container py-16"><div className="skeleton h-14 max-w-xl" /></main>}>
      <IncidentsView />
    </Suspense>
  );
}
