'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, MagnifyingGlass, X } from '@phosphor-icons/react';
import { ErrorPanel } from '@/components/ui/error-panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/format';
import type { IncidentStatus, IncidentsResponse, Severity } from '@/types/api';

const statuses: IncidentStatus[] = ['Open', 'Investigating', 'Resolved', 'Closed'];
const severities: Severity[] = ['Low', 'Medium', 'High', 'Critical'];

function parsePage(value: string | null) {
  const page = Number(value ?? 1);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function IncidentsSkeleton() {
  return (
    <div className="mt-7 panel overflow-hidden" aria-live="polite" aria-label="Loading incidents">
      <div className="hidden grid-cols-[minmax(0,1fr)_140px_140px_180px] gap-4 border-b border-hairline bg-[#f6f7f3] px-5 py-3 md:grid">
        {['Incident', 'Severity', 'Status', 'Created'].map((item) => <div key={item} className="skeleton h-3 w-20" />)}
      </div>
      <div className="divide-y divide-hairline">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1fr)_140px_140px_180px]">
            <div>
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton mt-3 h-3 w-28" />
            </div>
            <div className="skeleton h-7 w-20" />
            <div className="skeleton h-7 w-24" />
            <div className="skeleton h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function IncidentsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';
  const severity = searchParams.get('severity') ?? '';
  const page = parsePage(searchParams.get('page'));
  const [searchInput, setSearchInput] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

  // Back/forward can change `q` without typing; copy it into the input.
  // When `q` matches the debounced value, the change came from our own push,
  // so leave the input alone (the user may have kept typing).
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    if (query !== debouncedSearch) setSearchInput(query);
  }

  const updateParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') params.delete(key);
        else params.set(key, String(value));
      });
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Only push once the debounce has caught up with the input, so a stale
  // debounced value never overwrites a `q` that came from navigation.
  const searchSettled = debouncedSearch === searchInput.trim();

  useEffect(() => {
    if (searchSettled && debouncedSearch !== query) updateParams({ q: debouncedSearch, page: 1 });
  }, [debouncedSearch, query, searchSettled, updateParams]);

  const incidents = useQuery({
    queryKey: ['incidents', query, status, severity, page],
    queryFn: async () =>
      (
        await api.get<IncidentsResponse>('/incidents', {
          params: {
            search: query || undefined,
            status: status || undefined,
            severity: severity || undefined,
            page,
            limit: 10,
          },
        })
      ).data,
    placeholderData: keepPreviousData,
  });

  const resetFilters = () => {
    setSearchInput('');
    updateParams({ q: null, status: null, severity: null, page: null });
  };

  return (
    <main className="site-container py-10 lg:py-14">
      <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="mono-label text-brand">Operational queue</p>
          <h1 className="mt-4 text-5xl font-medium tracking-[-0.06em] sm:text-6xl">Incidents</h1>
          <p className="mt-5 max-w-xl leading-7 text-muted">Search, filter, and open the active record for every reported security event.</p>
        </div>
        {incidents.data && (
          <p className="font-mono text-xs text-muted lg:col-span-5 lg:text-right">
            SHOWING {incidents.data.items.length} OF {incidents.data.meta.total} RECORDS
          </p>
        )}
      </header>

      <section className="mt-10 grid gap-4 border-y border-hairline py-5 lg:grid-cols-12" aria-label="Incident filters">
        <label className="grid gap-2 text-sm font-medium lg:col-span-6" htmlFor="incident-search">
          Search incidents
          <span className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
            <input
              id="incident-search"
              className="field pl-10"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Title or description"
              type="search"
            />
          </span>
        </label>

        <label className="grid gap-2 text-sm font-medium lg:col-span-2" htmlFor="status-filter">
          Status
          <select id="status-filter" className="field" value={status} onChange={(event) => updateParams({ status: event.target.value, page: 1 })}>
            <option value="">All statuses</option>
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium lg:col-span-2" htmlFor="severity-filter">
          Severity
          <select id="severity-filter" className="field" value={severity} onChange={(event) => updateParams({ severity: event.target.value, page: 1 })}>
            <option value="">All severities</option>
            {severities.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <button type="button" className="button-secondary self-end lg:col-span-2" onClick={resetFilters} disabled={!query && !status && !severity}>
          <X size={17} weight="bold" /> Reset
        </button>
      </section>

      {incidents.isPending ? (
        <IncidentsSkeleton />
      ) : incidents.isError ? (
        <ErrorPanel
          className="mt-7"
          headingLevel="h2"
          label="Incidents unavailable"
          title="The incident queue could not be loaded."
          description="Check the API connection, then retry this request."
          onRetry={() => incidents.refetch()}
        />
      ) : incidents.data.items.length === 0 ? (
        <div className="panel mt-7 grid min-h-64 place-items-center p-8 text-center">
          <div>
            <h2 className="text-3xl font-medium tracking-[-0.045em]">No incidents match this view.</h2>
            <p className="mt-3 text-muted">Change the search or clear the filters to see other records.</p>
            <button type="button" className="button-secondary mt-6" onClick={resetFilters}>Clear filters</button>
          </div>
        </div>
      ) : (
        <>
          <div className={`mt-7 panel overflow-hidden transition-opacity ${incidents.isPlaceholderData ? 'opacity-60' : 'opacity-100'}`}>
            <table className="hidden w-full table-fixed border-collapse md:table">
              <caption className="sr-only">Security incident records</caption>
              <thead className="bg-[#f6f7f3] text-left font-mono text-[11px] uppercase tracking-[0.07em] text-muted">
                <tr>
                  <th className="w-auto px-5 py-3 font-medium" scope="col">Incident</th>
                  <th className="w-36 px-5 py-3 font-medium" scope="col">Severity</th>
                  <th className="w-40 px-5 py-3 font-medium" scope="col">Status</th>
                  <th className="w-48 px-5 py-3 font-medium" scope="col">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {incidents.data.items.map((incident) => (
                  <tr key={incident._id} className="group transition-colors hover:bg-[#f5f6f2]">
                    <td className="px-5 py-5">
                      <Link
                        href={`/incidents/${incident._id}`}
                        transitionTypes={['nav-forward']}
                        className="inline-block font-medium group-hover:text-brand"
                        style={{ viewTransitionName: `incident-${incident._id}` }}
                      >
                        {incident.title}
                      </Link>
                      <p className="mt-1 line-clamp-1 text-sm text-muted">{incident.description}</p>
                    </td>
                    <td className="px-5 py-5"><StatusBadge value={incident.severity} /></td>
                    <td className="px-5 py-5"><StatusBadge value={incident.status} /></td>
                    <td className="px-5 py-5 font-mono text-xs text-muted">{formatDateTime(incident.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-hairline md:hidden">
              {incidents.data.items.map((incident) => (
                <li key={incident._id}>
                  <Link href={`/incidents/${incident._id}`} className="block p-5 active:bg-[#eef0eb]">
                    <div className="flex flex-wrap gap-2"><StatusBadge value={incident.severity} /><StatusBadge value={incident.status} /></div>
                    <h2 className="mt-4 text-lg font-medium">{incident.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{incident.description}</p>
                    <p className="mt-4 font-mono text-[11px] text-muted">{formatDateTime(incident.createdAt)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <nav className="mt-6 flex items-center justify-between gap-4" aria-label="Incident pages">
            <button type="button" className="button-secondary" onClick={() => updateParams({ page: page - 1 })} disabled={page <= 1}>
              <ArrowLeft size={18} weight="bold" /> Previous
            </button>
            <span className="font-mono text-xs text-muted">
              PAGE {incidents.data.meta.page} OF {incidents.data.meta.totalPages}
            </span>
            <button type="button" className="button-secondary" onClick={() => updateParams({ page: page + 1 })} disabled={page >= incidents.data.meta.totalPages}>
              Next <ArrowRight size={18} weight="bold" />
            </button>
          </nav>
        </>
      )}
    </main>
  );
}
