'use client'

import { Bar, Line, BarChart, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis  } from "recharts";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type DashboardStats = {
    totals: {
        open: number;
        closed: number;
        critical: number;
        avgResolutionHours: number; };
    
    bySeverity: Array<{
        severity: string;
        count: number;
    }>;

    byStatus: Array<{
        status: string;
        count: number;
    }>;

    monthlyTrend: Array<{
        month: string;
        count: number;
    }>;
}


export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [error, setError] = useState('')

    useEffect(()=>{
        let ignore = false;

        async function loadDashboardPage() {
            try{    
                const response = await api.get<DashboardStats>('/dashboard/stats')

                if (!ignore) {
                    setStats(response.data)
                }
            } catch {
            if (!ignore) {
                setError('Could not load stats')
            }
            }
        }
        loadDashboardPage()

        return () => {
            ignore = true;
        }
    },[])

    if (error){
        return(
            <main>
                <p>{error}</p>
            </main>
        )
    }

    if (!stats){
        return(
            <main>
                <p> Loading Dashboard...</p>
            </main>
        )
    }

    
    return (
        <main>
            <h1> Dashboard </h1>

            <section>
                <h2> Overview </h2>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <article className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Open</p>
                        <strong className="mt-2 block text-3xl">{stats.totals.open}</strong>
                    </article>

                    <article className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Closed</p>
                        <strong className="mt-2 block text-3xl">{stats.totals.closed}</strong>
                    </article>

                    <article className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Critical</p>
                        <strong className="mt-2 block text-3xl">{stats.totals.critical}</strong>
                    </article>

                    <article className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Avg resolution</p>
                        <strong className="mt-2 block text-3xl">
                        {stats.totals.avgResolutionHours.toFixed(1)}h
                        </strong>
                    </article>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-xl font-semibold"> Severity </h2>

                <div className="mt-4 h-72 rounded-lg border border-gray-200 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.bySeverity}>
                            <XAxis dataKey="severity" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#2563eb" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-xl font-semibold"> Status </h2>

                <div className="mt-4 h-72 rounded-lg border border-gray-200 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.byStatus}>
                            <XAxis dataKey="status"/>
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#16a34a"/>
                        </BarChart>
                    </ResponsiveContainer>

                </div>
            </section>

             <section className="mt-8">
                <h2 className="text-xl font-semibold">Monthly trend</h2>

                <div className="mt-4 h-72 rounded-lg border border-gray-200 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.monthlyTrend}>
                            <XAxis dataKey="month"/>
                            <YAxis allowDecimals={false}/>
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#dc2626"/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

        </main>
    )
}