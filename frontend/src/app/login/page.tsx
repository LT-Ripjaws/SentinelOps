'use client';

import { useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('manager@sentinelops.dev');
    const [password, setPassword] = useState('manager1234')
    const [error, setError] = useState('');

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        try {
            await api.post('/auth/login', {email, password})
            router.push('/incidents');
        } catch {
            setError('Invalid Email or Password')
        }

    }

    return (
        <main>
            <form onSubmit={handleSubmit}>
                <h1> Sign in</h1>

                <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email"
                placeholder="Email" />

                <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder='Password' />


                {error && <p>{error}</p>}

                <button type="submit">Sign In</button>
            </form>
        </main>
    )


}