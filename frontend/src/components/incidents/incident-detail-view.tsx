'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileArrowUp, FileText, Paperclip } from '@phosphor-icons/react';
import { ErrorPanel } from '@/components/ui/error-panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/lib/api';
import { formatDateTime, formatFileSize, formatTimelineChange } from '@/lib/format';
import type { EvidenceItem, EvidenceType, IncidentDetail } from '@/types/api';

const allowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'text/plain',
  'application/pdf',
  'application/json',
];

const maxFileSize = 7 * 1024 * 1024;

function DetailSkeleton() {
  return (
    <main className="site-container py-10 lg:py-14" aria-live="polite" aria-label="Loading incident record">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton mt-6 h-14 max-w-3xl" />
      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        <div className="skeleton h-[36rem] lg:col-span-8" />
        <div className="skeleton h-[36rem] lg:col-span-4" />
      </div>
    </main>
  );
}

export function IncidentDetailView({ incidentId }: { incidentId: string }) {
  const queryClient = useQueryClient();
  const [evidenceType, setEvidenceType] = useState<EvidenceType>('note');
  const [note, setNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

  const incident = useQuery({
    queryKey: ['incident', incidentId],
    queryFn: async () => (await api.get<IncidentDetail>(`/incidents/${incidentId}`)).data,
  });

  const evidence = useQuery({
    queryKey: ['incident-evidence', incidentId],
    queryFn: async () => (await api.get<EvidenceItem[]>(`/incidents/${incidentId}/evidence`)).data,
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('type', evidenceType);
      formData.append('file', file);
      if (note.trim()) formData.append('note', note.trim());
      await api.post(`/incidents/${incidentId}/evidence`, formData);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['incident-evidence', incidentId] });
      setEvidenceType('note');
      setNote('');
      setSelectedFile(null);
      setFileError('');
      setFileInputKey((current) => current + 1);
    },
  });

  function selectFile(file: File | null) {
    setFileError('');
    setSelectedFile(null);

    if (!file) return;
    if (!allowedMimeTypes.includes(file.type)) {
      setFileError('Use a PNG, JPEG, text, PDF, or JSON file.');
      return;
    }
    if (file.size > maxFileSize) {
      setFileError('The selected file is larger than 7 MB.');
      return;
    }

    setSelectedFile(file);
  }

  function submitEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFileError('');
    if (!selectedFile) {
      setFileError('Choose a file to upload.');
      return;
    }
    upload.mutate(selectedFile);
  }

  if (incident.isPending || evidence.isPending) return <DetailSkeleton />;

  if (incident.isError || evidence.isError) {
    return (
      <main className="site-container py-16">
        <ErrorPanel
          label="Incident unavailable"
          title="The incident record could not be loaded."
          description="The record may no longer exist, or the API may be unavailable."
          onRetry={() => Promise.all([incident.refetch(), evidence.refetch()])}
        >
          <Link href="/incidents" className="button-secondary"><ArrowLeft size={18} weight="bold" /> Back to incidents</Link>
        </ErrorPanel>
      </main>
    );
  }

  const record = incident.data;

  return (
    <main className="site-container py-10 lg:py-14">
      <Link href="/incidents" transitionTypes={['nav-back']} className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft size={17} weight="bold" /> Back to incidents
      </Link>

      <header className="mt-8 border-b border-hairline pb-10">
        <div className="flex flex-wrap gap-2"><StatusBadge value={record.severity} /><StatusBadge value={record.status} /></div>
        <h1
          className="mt-5 max-w-5xl text-4xl font-medium tracking-[-0.055em] sm:text-6xl"
          style={{ viewTransitionName: `incident-${record._id}` }}
        >
          {record.title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{record.description}</p>
      </header>

      <dl className="grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Severity', record.severity],
          ['Status', record.status],
          ['Assigned to', record.assignedTo.name],
          ['Created by', record.createdBy.name],
          ['Created at', formatDateTime(record.createdAt)],
        ].map(([term, value]) => (
          <div key={term} className="min-h-28 bg-surface p-5">
            <dt className="mono-label text-muted">{term}</dt>
            <dd className="mt-4 text-sm font-medium leading-6">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <section className="lg:col-span-8" aria-labelledby="timeline-heading">
          <div className="flex items-end justify-between gap-4 border-b border-hairline pb-5">
            <div>
              <p className="mono-label text-brand">Audit history</p>
              <h2 id="timeline-heading" className="mt-2 text-3xl font-medium tracking-[-0.045em]">Timeline</h2>
            </div>
            <span className="font-mono text-xs text-muted">{record.timeline.length} EVENTS</span>
          </div>

          {record.timeline.length === 0 ? (
            <div className="panel mt-6 p-8 text-muted">No audit events have been recorded.</div>
          ) : (
            <ol className="relative mt-8 space-y-0 border-l border-hairline">
              {record.timeline.map((event, index) => (
                <li key={`${event.action}-${event.at}-${index}`} className="relative border-b border-hairline py-6 pl-8 sm:grid sm:grid-cols-[150px_1fr] sm:gap-6">
                  <span className={`absolute -left-[5px] top-8 h-2.5 w-2.5 rounded-full ${index === record.timeline.length - 1 ? 'bg-brand' : 'bg-[#aeb3ae]'}`} />
                  <time className="font-mono text-[11px] text-muted">{formatDateTime(event.at)}</time>
                  <div className="mt-2 sm:mt-0">
                    <h3 className="font-medium">{event.action}</h3>
                    {event.field && (
                      <p className="mt-2 text-sm leading-6 text-muted">
                        Changed <span className="font-mono text-xs text-ink">{event.field}</span> from {formatTimelineChange(event.oldValue, event.newValue)}.
                      </p>
                    )}
                    <p className="mt-2 font-mono text-[10px] text-muted">ACTOR {event.by}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="lg:col-span-4" aria-labelledby="evidence-heading">
          <div className="lg:sticky lg:top-28">
            <div className="flex items-end justify-between gap-4 border-b border-hairline pb-5">
              <div>
                <p className="mono-label text-brand">Attached record</p>
                <h2 id="evidence-heading" className="mt-2 text-3xl font-medium tracking-[-0.045em]">Evidence</h2>
              </div>
              <span className="font-mono text-xs text-muted">{evidence.data.length} FILES</span>
            </div>

            {evidence.data.length === 0 ? (
              <div className="panel mt-6 p-6 text-sm leading-6 text-muted">No evidence has been uploaded for this incident.</div>
            ) : (
              <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
                {evidence.data.map((item) => (
                  <li key={item._id} className="py-5">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 shrink-0" size={21} weight="light" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.originalName}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase text-muted">{item.type} · {formatFileSize(item.size)}</p>
                      </div>
                    </div>
                    {item.note && <p className="mt-3 text-sm leading-6 text-muted">{item.note}</p>}
                    <p className="mt-3 font-mono text-[10px] text-muted">{item.uploadedBy.name} · {formatDateTime(item.uploadedAt)}</p>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={submitEvidence} className="panel mt-8 grid gap-5 p-5 sm:p-6" noValidate>
              <div className="flex items-center gap-3">
                <FileArrowUp size={23} weight="light" />
                <h3 className="text-xl font-medium tracking-[-0.03em]">Upload evidence</h3>
              </div>

              <label className="grid gap-2 text-sm font-medium" htmlFor="evidence-type">
                Evidence type
                <select id="evidence-type" className="field" value={evidenceType} onChange={(event) => setEvidenceType(event.target.value as EvidenceType)}>
                  <option value="note">Note</option>
                  <option value="log">Log</option>
                  <option value="screenshot">Screenshot</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium" htmlFor="evidence-file">
                File
                <input
                  key={fileInputKey}
                  id="evidence-file"
                  className="field file:mr-3 file:border-0 file:bg-transparent file:font-medium"
                  type="file"
                  accept=".png,.jpg,.jpeg,.txt,.pdf,.json,image/png,image/jpeg,text/plain,application/pdf,application/json"
                  onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <p className="-mt-3 text-xs leading-5 text-muted">PNG, JPEG, text, PDF, or JSON. Maximum 7 MB.</p>

              {selectedFile && (
                <div className="flex items-center gap-2 border-l-2 border-brand bg-[#eef1ff] px-3 py-2 text-sm">
                  <Paperclip size={17} aria-hidden="true" />
                  <span className="truncate">{selectedFile.name}</span>
                </div>
              )}

              <label className="grid gap-2 text-sm font-medium" htmlFor="evidence-note">
                Note
                <textarea id="evidence-note" className="field min-h-28 resize-y" value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} />
                <span className="text-right font-mono text-[10px] text-muted">{note.length}/500</span>
              </label>

              {(fileError || upload.isError) && (
                <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {fileError || 'Evidence could not be uploaded. The current selection has been preserved.'}
                </p>
              )}

              {upload.isSuccess && <p role="status" className="border-l-2 border-emerald-600 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Evidence uploaded successfully.</p>}

              <button type="submit" className="button-primary" disabled={upload.isPending || !selectedFile}>
                {upload.isPending ? 'Uploading...' : 'Upload evidence'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </main>
  );
}
