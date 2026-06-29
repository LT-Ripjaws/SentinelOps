'use client'

import { useEffect, useState, SubmitEvent } from 'react';
import { useParams } from 'next/navigation';
import {api} from '@/lib/api';

type UserSummary = {
    _id: string;
    name: string;
    email: string;
    role: string;
}

type TimelineEvent = {
    action: string;
    field?: string;
    oldValue?: unknown;
    newValue?: unknown;
    by: string;
    at: string;
}

type EvidenceType = 'screenshot' | 'log' | 'note';

type EvidenceItem = {
    _id: string;
    type: EvidenceType;
    filePath: string;
    originalName: string;
    mimeType: string;
    size: number;
    note?: string;
    uploadedBy: UserSummary;
    uploadedAt: string;
}

type IncidentDetail = {
    _id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    assignedTo: UserSummary;
    createdBy: UserSummary;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    timeline: TimelineEvent[];
}

export default function IncidentDetailPage(){
    const params = useParams<{id: string}>();
    const [incident, setIncident] = useState<IncidentDetail | null>(null);
    const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
    const [error, setError] = useState(''); 
    const [uploadError, setUploadError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [evidenceType, setEvidenceType] = useState<EvidenceType>('note');
    const [evidenceNote, setEvidenceNote] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileInputKey, setFileInputKey] = useState(0);
    
    useEffect(() => {
        let ignore = false;

    async function loadIncidentPage() {
        try {
            const [incidentResponse, evidenceResponse] = await Promise.all([
            api.get<IncidentDetail>(`/incidents/${params.id}`),
            api.get<EvidenceItem[]>(`/incidents/${params.id}/evidence`),
            ]);

            if (!ignore) {
            setIncident(incidentResponse.data);
            setEvidence(evidenceResponse.data);
            }
        } catch {
            if (!ignore) {
            setError('Could not load incident');
            }
        }
        }

        loadIncidentPage();

        return () => {
        ignore = true;
        };
    }, [params.id]);

    async function handleEvidenceUpload(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setUploadError('');

        if (!selectedFile) {
        setUploadError('Choose a file to upload');
        return;
        }

        const formData = new FormData();
        formData.append('type', evidenceType);
        formData.append('file', selectedFile);

        if (evidenceNote.trim()) {
        formData.append('note', evidenceNote.trim());
        }

        try {
        setIsUploading(true);
        await api.post(`/incidents/${params.id}/evidence`, formData);

        const response = await api.get<EvidenceItem[]>(
            `/incidents/${params.id}/evidence`,
        );

        setEvidence(response.data);
        setEvidenceType('note');
        setEvidenceNote('');
        setSelectedFile(null);
        setFileInputKey((currentKey) => currentKey + 1);
        } catch {
        setUploadError('Could not upload evidence');
        } finally {
        setIsUploading(false);
        }
    }

    if (error) {
        return (
        <main>
            <p>{error}</p>
        </main>
        );
    }

    if (!incident) {
        return (
        <main>
            <p>Loading incident...</p>
        </main>
        );
    }
    
    return (
        <main>
        <h1>{incident.title}</h1>

        <p>{incident.description}</p>

        <dl>
            <div>
            <dt>Severity</dt>
            <dd>{incident.severity}</dd>
            </div>

            <div>
            <dt>Status</dt>
            <dd>{incident.status}</dd>
            </div>

            <div>
            <dt>Assigned to</dt>
            <dd>{incident.assignedTo.name}</dd>
            </div>

            <div>
            <dt>Created by</dt>
            <dd>{incident.createdBy.name}</dd>
            </div>

            <div>
            <dt>Created at</dt>
            <dd>{new Date(incident.createdAt).toLocaleString()}</dd>
            </div>
        </dl>

        <section>
            <h2>Timeline</h2>

            <ul>
            {incident.timeline.map((event, index) => (
                <li key={`${event.action}-${event.at}-${index}`}>
                <strong>{event.action}</strong>

                {event.field && (
                    <span>
                    {' '}
                    changed {event.field} from {String(event.oldValue)} to{' '}
                    {String(event.newValue)}
                    </span>
                )}

                <span> at {new Date(event.at).toLocaleString()}</span>
                </li>
            ))}
            </ul>
        </section>

        <section>
            <h2>Evidence</h2>

            {evidence.length === 0 ? (
            <p>No evidence uploaded yet.</p>
            ) : (
            <ul>
                {evidence.map((item) => (
                <li key={item._id}>
                    <strong>{item.originalName}</strong>
                    <span> {item.type}</span>
                    <span> {Math.ceil(item.size / 1024)} KB</span>
                    <span> uploaded by {item.uploadedBy.name}</span>
                    <span> at {new Date(item.uploadedAt).toLocaleString()}</span>
                    {item.note && <p>{item.note}</p>}
                </li>
                ))}
            </ul>
            )}

            <form onSubmit={handleEvidenceUpload}>
            <h3>Upload evidence</h3>

            <label>
                Type
                <select
                value={evidenceType}
                onChange={(event) =>
                    setEvidenceType(event.target.value as EvidenceType)
                }
                >
                <option value="note">Note</option>
                <option value="log">Log</option>
                <option value="screenshot">Screenshot</option>
                </select>
            </label>

            <label>
                File
                <input
                key={fileInputKey}
                type="file"
                onChange={(event) =>
                    setSelectedFile(event.target.files?.[0] ?? null)
                }
                />
            </label>

            <label>
                Note
                <textarea
                value={evidenceNote}
                onChange={(event) => setEvidenceNote(event.target.value)}
                maxLength={500}
                />
            </label>

            {uploadError && <p>{uploadError}</p>}

            <button type="submit" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload evidence'}
            </button>
            </form>
        </section>
        </main>
    );
}
