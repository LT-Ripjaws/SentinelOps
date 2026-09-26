import type { Metadata } from 'next';
import { IncidentDetailView } from '@/components/incidents/incident-detail-view';

export const metadata: Metadata = {
  title: 'Incident record',
  description: 'Security incident details, audit timeline, and evidence.',
};

export default async function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <IncidentDetailView incidentId={id} />;
}
