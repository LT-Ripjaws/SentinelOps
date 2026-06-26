'use client'

import {useEffect, useState} from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'


type Incident = {
    _id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    createdAt: string;
}

type IncidentsResponse = {
    items: Incident[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}

export default function IncidentsPage() {

    const [meta, setMeta] = useState<IncidentsResponse['meta'] | null>(null);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [error, setError] = useState('')

    const [status, setStatus] = useState('');
    const [severity, setSeverity] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    
    
    useEffect(() => {   
        let ignore = false;

        async function loadIncidents() {
            try {
            const response = await api.get<IncidentsResponse>('/incidents', {
                params: {
                    status: status || undefined,
                    severity: severity || undefined,
                    search: search || undefined,
                    page,
                    limit
                }
            });

            if (!ignore) {
                setIncidents(response.data.items);
                setMeta(response.data.meta);
            }
            } catch {
            if (!ignore) {
                setError('Could not load incidents');
            }
            }
        }

        loadIncidents();

        return () => {
            ignore = true;
        };
    }, [status, severity, search, page, limit])

    return (
        <main>
            <h1>Incidents</h1>
            
            {meta && (
                <p>
                    Showing {incidents.length} of {meta.total} incidents
                </p>
            )}

            {error && <p>{error}</p>}

            <div>
                <input
                    value={search}
                    onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                    }}
                    placeholder="Search incidents"
                />

                <select
                    value={status}
                    onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                    }}
                >
                    <option value="">All statuses</option>
                    <option value="Open">Open</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </select>

                <select
                    value={severity}
                    onChange={(e) => {
                    setSeverity(e.target.value);
                    setPage(1);
                    }}
                >
                    <option value="">All severities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>

            <ul>
                {incidents.map((incident)=> (
                    <li key = {incident._id}>
                        <Link href={`/incidents/${incident._id}`}>
                            <strong>{incident.title}</strong>
                        </Link>
                        <span>{incident.severity}</span>
                        <span>{incident.status}</span>
                    </li>
                ))}
            </ul>

            {meta && (
        <div>
            <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage - 1)}
            disabled={page <= 1}
            >
            Previous
            </button>

            <span>
            Page {meta.totalPages === 0 ? 0 : meta.page} of {meta.totalPages}
            </span>

            <button
            type="button"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={page >= meta.totalPages}
            >
            Next
            </button>
        </div>
        )}
        </main>
    )
}