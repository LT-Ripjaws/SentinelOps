'use client'

import {useEffect, useState} from 'react'
import { api } from '@/lib/api'

type Incident = {
    _id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    createdAt: string;
}

export default function IncidentsPage() {

    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [error, setError] = useState('')
    
    useEffect(() => {   
        let ignore = false;

        async function loadIncidents() {
            try {
            const response = await api.get<Incident[]>('/incidents');

            if (!ignore) {
                setIncidents(response.data);
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
    }, [])

    return (
        <main>
            <h1>Incidents</h1>

            {error && <p>{error}</p>}

            <ul>
                {incidents.map((incident)=> (
                    <li key = {incident._id}>
                        <strong>{incident.title}</strong>
                        <span>{incident.severity}</span>
                        <span>{incident.status}</span>
                    </li>
                ))}
            </ul>
        </main>
    )
}