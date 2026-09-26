'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartLineUp } from '@phosphor-icons/react';
import { ErrorPanel } from '@/components/ui/error-panel';
import { api } from '@/lib/api';
import type { DashboardStats, IncidentStatus, Severity } from '@/types/api';

const severityColors: Record<Severity, string> = {
  Low: '#64748b',
  Medium: '#b97900',
  High: '#cf5b23',
  Critical: '#d42d2d',
};

const statusColors: Record<IncidentStatus, string> = {
  Open: '#2559f6',
  Investigating: '#b97900',
  Resolved: '#1f8a53',
  Closed: '#64748b',
};

const tooltipStyle = {
  border: '1px solid #CDD1CB',
  borderRadius: 2,
  background: '#FAFBF8',
  color: '#111311',
  boxShadow: '0 18px 45px rgba(17,19,17,.09)',
  fontSize: 12,
};

function DashboardSkeleton() {
  return (
    <div className="site-container py-10 lg:py-14" aria-live="polite" aria-label="Loading dashboard">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton mt-5 h-14 max-w-xl" />
      <div className="mt-12 grid gap-4 lg:grid-cols-12">
        <div className="skeleton h-64 lg:col-span-5" />
        <div className="skeleton h-64 lg:col-span-7" />
        <div className="skeleton h-96 lg:col-span-8" />
        <div className="skeleton h-96 lg:col-span-4" />
      </div>
    </div>
  );
}

export function DashboardView() {
  const stats = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get<DashboardStats>('/dashboard/stats')).data,
  });

  if (stats.isPending) return <DashboardSkeleton />;

  if (stats.isError) {
    return (
      <main className="site-container py-16">
        <ErrorPanel
          label="Dashboard unavailable"
          title="The operational summary could not be loaded."
          description="Check the API connection, then retry this request."
          onRetry={() => stats.refetch()}
        />
      </main>
    );
  }

  const data = stats.data;

  return (
    <main className="site-container py-10 lg:py-14">
      <header className="max-w-3xl">
        <p className="mono-label text-brand">Operational overview</p>
        <h1 className="mt-4 text-5xl font-medium tracking-[-0.06em] sm:text-6xl">Dashboard</h1>
        <p className="mt-5 max-w-xl leading-7 text-muted">
          Current workload, severity distribution, and response performance across the incident record.
        </p>
      </header>

      <section className="mt-12 grid gap-px bg-hairline lg:grid-cols-12" aria-label="Incident totals">
        <article className="min-h-64 bg-ink p-7 text-white lg:col-span-5 sm:p-9">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="mono-label text-white/55">Open incidents</p>
              <strong className="mt-8 block font-mono text-8xl font-normal tracking-[-0.08em]">{data.totals.open}</strong>
            </div>
            <ChartLineUp size={32} weight="light" />
          </div>
          <p className="mt-9 max-w-sm text-sm leading-6 text-white/60">Records requiring active ownership or investigation.</p>
        </article>
        <div className="grid bg-hairline sm:grid-cols-3 lg:col-span-7">
          {[
            { label: 'Closed', value: data.totals.closed, note: 'Completed records' },
            { label: 'Critical', value: data.totals.critical, note: 'Highest severity' },
            { label: 'Avg resolution', value: `${data.totals.avgResolutionHours.toFixed(1)}h`, note: 'Across resolved incidents' },
          ].map((metric) => (
            <article key={metric.label} className="min-h-64 bg-surface p-7 sm:p-8">
              <p className="mono-label text-muted">{metric.label}</p>
              <strong className="mt-12 block font-mono text-5xl font-normal tracking-[-0.06em]">{metric.value}</strong>
              <p className="mt-5 text-sm text-muted">{metric.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-12">
        <article className="panel p-5 sm:p-7 lg:col-span-8">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="mono-label text-muted">Volume</p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">Monthly trend</h2>
            </div>
            <span className="font-mono text-xs text-muted">INCIDENTS / MONTH</span>
          </div>
          <div className="mt-8 h-80 w-full" role="img" aria-label="Line chart showing monthly incident volume">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend} margin={{ top: 6, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={12} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#CDD1CB' }} />
                <Line type="monotone" dataKey="count" stroke="#2559F6" strokeWidth={2.5} dot={{ r: 3, fill: '#2559F6' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <div className="grid gap-6 lg:col-span-4">
          <article className="panel p-5 sm:p-7">
            <p className="mono-label text-muted">Distribution</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">By severity</h2>
            <div className="mt-6 h-56" role="img" aria-label="Bar chart showing incidents by severity">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.bySeverity} margin={{ top: 5, right: 4, left: -30, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="severity" axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F2F3EF' }} />
                  <Bar dataKey="count" radius={0}>
                    {data.bySeverity.map((entry) => <Cell key={entry.severity} fill={severityColors[entry.severity]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel p-5 sm:p-7">
            <p className="mono-label text-muted">Distribution</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.04em]">By status</h2>
            <div className="mt-6 grid gap-3">
              {data.byStatus.length === 0 ? (
                <p className="text-sm text-muted">No status data is available.</p>
              ) : (
                data.byStatus.map((item) => (
                  <div key={item.status} className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-hairline pt-3">
                    <span className="text-sm">{item.status}</span>
                    <span className="font-mono text-lg" style={{ color: statusColors[item.status] }}>{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
