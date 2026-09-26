'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChartBar, SignOut, Siren } from '@phosphor-icons/react';
import { Logo } from '@/components/brand/logo';
import { api, AUTH_EXPIRED_EVENT } from '@/lib/api';
import { sessionQueryOptions } from '@/lib/session';

const navigation = [
  { href: '/incidents', label: 'Incidents', icon: Siren },
  { href: '/dashboard', label: 'Dashboard', icon: ChartBar },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const session = useQuery(sessionQueryOptions);

  useEffect(() => {
    const expire = () => {
      queryClient.clear();
      router.replace('/login');
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, expire);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, expire);
  }, [queryClient, router]);

  useEffect(() => {
    if (session.isError) router.replace('/login');
  }, [router, session.isError]);

  const logout = useMutation({
    mutationFn: async () => api.post('/auth/logout'),
    onSettled: () => {
      queryClient.clear();
      router.replace('/login');
    },
  });

  if (session.isPending || session.isError) {
    return (
      <main className="site-container flex min-h-[100dvh] items-center justify-center" aria-live="polite">
        <div className="w-full max-w-md">
          <div className="skeleton h-3 w-28" />
          <div className="skeleton mt-5 h-10 w-full" />
          <p className="mt-5 font-mono text-xs text-muted">Verifying secure session...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/95 backdrop-blur-xl">
        <div className="site-container flex h-[72px] items-center justify-between gap-3">
          <Logo compact={false} href="/incidents" className="hidden sm:inline-flex" />
          <Logo compact href="/incidents" className="sm:hidden" />
          <nav className="flex h-full items-center" aria-label="Workspace navigation">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-full min-w-12 items-center justify-center gap-2 border-b-2 px-2 text-sm transition-colors sm:px-4 ${
                    active ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  <Icon size={20} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden max-w-52 text-right lg:block">
              <p className="truncate text-sm font-medium">{session.data.email}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">{session.data.role}</p>
            </div>
            <button
              type="button"
              className="button-secondary min-h-10 px-3 py-2"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              aria-label="Sign out"
            >
              <SignOut size={19} aria-hidden="true" />
              <span className="hidden sm:inline">{logout.isPending ? 'Signing out' : 'Sign out'}</span>
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
