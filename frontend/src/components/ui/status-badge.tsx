import type { IncidentStatus, Severity } from '@/types/api';

const toneClasses: Record<IncidentStatus | Severity, string> = {
  Critical: 'border-red-300 bg-red-50 text-red-800',
  High: 'border-orange-300 bg-orange-50 text-orange-800',
  Medium: 'border-amber-300 bg-amber-50 text-amber-800',
  Low: 'border-slate-300 bg-slate-50 text-slate-700',
  Open: 'border-blue-300 bg-blue-50 text-blue-800',
  Investigating: 'border-amber-300 bg-amber-50 text-amber-800',
  Resolved: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  Closed: 'border-slate-300 bg-slate-50 text-slate-700',
};

export function StatusBadge({ value }: { value: IncidentStatus | Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium ${toneClasses[value]}`}
    >
      {value}
    </span>
  );
}
