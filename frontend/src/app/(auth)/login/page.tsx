'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, LockKey } from '@phosphor-icons/react';
import { Logo, SentinelMark } from '@/components/brand/logo';
import { api } from '@/lib/api';
import { sessionQueryOptions } from '@/lib/session';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const existingSession = useQuery(sessionQueryOptions);

  useEffect(() => {
    if (existingSession.data) router.replace('/incidents');
  }, [existingSession.data, router]);

  const login = useMutation({
    mutationFn: async () => api.post('/auth/login', { email, password }),
    onSuccess: () => router.replace('/incidents'),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate();
  }

  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-2">
      <section className="flex min-h-[100dvh] flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
            <ArrowLeft size={17} weight="bold" /> Back home
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-16">
          <p className="mono-label text-brand">Secure workspace</p>
          <h1 className="mt-5 text-5xl font-medium tracking-[-0.06em] sm:text-6xl">Sign in to SentinelOps.</h1>
          <p className="mt-5 max-w-sm leading-7 text-muted">
            Continue to your incident queue, operational timeline, and evidence record.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 grid gap-5">
            <label className="grid gap-2 text-sm font-medium" htmlFor="email">
              Email
              <input
                id="email"
                className="field"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                required
                placeholder="analyst@company.com"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium" htmlFor="password">
              Password
              <input
                id="password"
                className="field"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                required
                placeholder="Your password"
              />
            </label>

            {login.isError && (
              <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">
                Email or password was not accepted. Check your credentials and try again.
              </p>
            )}

            <button
              className="button-primary group mt-2 w-full"
              type="submit"
              disabled={login.isPending || !email || !password}
            >
              {login.isPending ? 'Signing in...' : 'Sign in'}
              {!login.isPending && (
                <ArrowRight className="transition-transform duration-500 group-hover:translate-x-1" size={18} weight="bold" />
              )}
            </button>
          </form>
        </div>
      </section>

      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center justify-between">
          <SentinelMark className="h-12 w-12" />
          <LockKey size={28} weight="light" />
        </div>
        <div>
          <p className="max-w-xl text-5xl font-medium leading-[1.02] tracking-[-0.055em]">
            One operational truth for every incident.
          </p>
          <ol className="mt-14 grid gap-6 border-l border-white/20 pl-8">
            {['Signal recorded', 'Ownership assigned', 'Evidence preserved', 'Resolution documented'].map((item, index) => (
              <li key={item} className="relative">
                <span className={`absolute -left-[37px] top-1.5 h-3 w-3 rounded-full ${index === 2 ? 'bg-brand' : 'bg-white/35'}`} />
                <span className="font-mono text-xs text-white/45">{String(index + 1).padStart(2, '0')}</span>
                <p className="mt-1 text-lg">{item}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="font-mono text-xs text-white/45">HTTP-ONLY SESSION · CSRF PROTECTED</p>
      </section>
    </main>
  );
}
