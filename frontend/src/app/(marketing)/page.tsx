import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ChartLine,
  Database,
  FileText,
  Fingerprint,
  ListBullets,
  LockKey,
} from '@phosphor-icons/react/dist/ssr';
import { Logo, SentinelMark } from '@/components/brand/logo';
import { HeroEvidenceField } from '@/components/landing/hero-evidence-field';
import { LifecycleStory } from '@/components/landing/lifecycle-story';
import { StatusBadge } from '@/components/ui/status-badge';

const technologies = [
  { name: 'Next.js', src: 'https://cdn.simpleicons.org/nextdotjs/111311' },
  { name: 'NestJS', src: 'https://cdn.simpleicons.org/nestjs/111311' },
  { name: 'MongoDB', src: 'https://cdn.simpleicons.org/mongodb/111311' },
  { name: 'TypeScript', src: 'https://cdn.simpleicons.org/typescript/111311' },
];

const incidents = [
  { id: 'INC-0247', title: 'Suspicious privileged sign-in', severity: 'Critical' as const, status: 'Investigating' as const },
  { id: 'INC-0246', title: 'Public storage policy changed', severity: 'High' as const, status: 'Open' as const },
  { id: 'INC-0245', title: 'Endpoint malware alert', severity: 'Medium' as const, status: 'Resolved' as const },
];

function ProductPreview() {
  return (
    <div className="panel overflow-hidden shadow-[var(--shadow)]" aria-label="SentinelOps incident workspace preview">
      <div className="flex min-h-14 items-center justify-between border-b border-hairline bg-ink px-4 text-white sm:px-6">
        <div className="flex items-center gap-3">
          <SentinelMark className="h-6 w-6" />
          <span className="font-semibold">Incident workspace</span>
        </div>
        <span className="hidden font-mono text-[11px] text-white/60 sm:block">OPERATIONAL RECORD</span>
      </div>
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-hairline p-5 lg:border-b-0 lg:border-r sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="mono-label text-muted">Active incidents</p>
              <p className="mt-2 text-2xl font-medium tracking-[-0.035em]">Response queue</p>
            </div>
            <span className="font-mono text-xs text-muted">3 records</span>
          </div>
          <div className="mt-6 divide-y divide-hairline border-y border-hairline">
            {incidents.map((incident) => (
              <article key={incident.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <span className="font-mono text-[11px] text-muted">{incident.id}</span>
                  <h3 className="mt-1 font-medium">{incident.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge value={incident.severity} />
                  <StatusBadge value={incident.status} />
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="bg-[#f6f7f3] p-5 sm:p-7">
          <p className="mono-label text-muted">Audit timeline</p>
          <ol className="relative mt-7 space-y-8 border-l border-hairline pl-6">
            {[
              ['09:14', 'Incident created'],
              ['09:22', 'Assigned to analyst'],
              ['09:41', 'Evidence attached'],
              ['10:08', 'Status changed'],
            ].map(([time, event], index) => (
              <li key={time} className="relative">
                <span className={`absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full ${index === 2 ? 'bg-brand' : 'bg-[#aeb3ae]'}`} />
                <time className="font-mono text-[11px] text-muted">{time} UTC</time>
                <p className="mt-1 text-sm font-medium">{event}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="w-full overflow-x-hidden">
      <header className="absolute inset-x-0 top-0 z-50 border-b border-black/10">
        <div className="site-container flex h-[72px] items-center justify-between gap-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm md:flex" aria-label="Primary navigation">
            <a href="#product" className="transition-colors hover:text-brand">Product</a>
            <a href="#workflow" className="transition-colors hover:text-brand">Workflow</a>
            <a href="#architecture" className="transition-colors hover:text-brand">Architecture</a>
          </nav>
          <Link href="/login" className="button-secondary min-h-10 px-4 py-2">Sign in</Link>
        </div>
      </header>

      <section className="relative flex min-h-[100dvh] items-end overflow-hidden border-b border-hairline pt-24">
        <HeroEvidenceField />
        <div className="site-container relative z-40 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-5xl hero-enter">
            <h1
              className="display-title max-w-5xl"
              style={{ fontSize: 'clamp(2.25rem, calc(0.93rem + 5.86vw), 7.25rem)' }}
            >
              Track the incident.<br />Preserve the truth.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted">
              A SOC workspace for investigation, evidence, audit trails, access control, and resolution.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="button-primary group">
                Sign in <ArrowRight className="transition-transform duration-500 group-hover:translate-x-1" size={18} weight="bold" />
              </Link>
              <a href="#workflow" className="button-secondary">See the workflow</a>
            </div>
          </div>
        </div>
      </section>

      <section id="product" className="py-28 lg:py-40">
        <div className="site-container">
          <div className="grid gap-10 border-y border-hairline py-7 lg:grid-cols-12 lg:items-center">
            <h2 className="text-3xl font-medium tracking-[-0.045em] lg:col-span-4">Built for the full incident record.</h2>
            <div className="grid grid-cols-2 gap-px bg-hairline lg:col-span-8 lg:grid-cols-4">
              {technologies.map((technology) => (
                <div key={technology.name} className="flex min-h-20 items-center gap-3 bg-canvas px-4 sm:px-6">
                  <Image src={technology.src} alt="" width={24} height={24} unoptimized />
                  <span className="text-sm font-medium">{technology.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-14 hero-enter-delayed">
            <ProductPreview />
          </div>
        </div>
      </section>

      <section className="border-t border-hairline py-28 lg:py-40">
        <div className="site-container">
          <h2 className="section-title">One record. Every response.</h2>
          <div className="mt-14 grid grid-flow-dense gap-px overflow-hidden bg-hairline lg:grid-cols-12 lg:auto-rows-[13rem]">
            <article className="grid min-h-72 content-between bg-ink p-7 text-white lg:col-span-7 lg:row-span-2">
              <ListBullets size={32} weight="light" />
              <div>
                <h3 className="text-4xl font-medium tracking-[-0.05em]">Incident lifecycle</h3>
                <p className="mt-4 max-w-md leading-7 text-white/65">Track ownership, status, and context from first report to resolution.</p>
              </div>
            </article>
            <article className="grid min-h-60 content-between bg-surface p-7 lg:col-span-5 lg:row-span-2">
              <Fingerprint size={32} weight="light" />
              <div>
                <h3 className="text-3xl font-medium tracking-[-0.045em]">Immutable audit timeline</h3>
                <p className="mt-4 max-w-sm leading-7 text-muted">Every material change is appended to the incident record.</p>
              </div>
            </article>
            <article className="grid min-h-60 content-between bg-surface p-7 lg:col-span-5 lg:row-span-2">
              <FileText size={32} weight="light" />
              <div>
                <h3 className="text-3xl font-medium tracking-[-0.045em]">Evidence collection</h3>
                <p className="mt-4 max-w-sm leading-7 text-muted">Keep screenshots, logs, notes, and supporting files close to the case.</p>
              </div>
            </article>
            <article className="grid min-h-60 content-between bg-ink p-7 text-white lg:col-span-3 lg:row-span-2">
              <LockKey size={32} weight="light" />
              <div>
                <h3 className="text-2xl font-medium tracking-[-0.04em]">Role-based access</h3>
                <p className="mt-4 text-sm leading-6 text-white/65">Explicit analyst and manager permissions.</p>
              </div>
            </article>
            <article className="grid min-h-60 content-between bg-[#e8ecff] p-7 lg:col-span-4 lg:row-span-2">
              <ChartLine size={32} weight="light" />
              <div>
                <h3 className="text-3xl font-medium tracking-[-0.045em]">Operational analytics</h3>
                <p className="mt-4 leading-7 text-muted">Understand severity, status, resolution time, and monthly volume.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <LifecycleStory />

      <section id="architecture" className="border-t border-hairline py-28 lg:py-40">
        <div className="site-container">
          <p className="mono-label text-brand">MongoDB architecture</p>
          <h2 className="section-title mt-6">Designed around the incident record.</h2>
          <div className="mt-16 grid gap-px bg-hairline lg:grid-cols-3">
            {[
              { title: 'Timeline', mode: 'Embedded', copy: 'Bounded, append-only, and read with its incident in one operation.', icon: ListBullets },
              { title: 'Evidence', mode: 'Referenced', copy: 'Independent, scalable, and loaded only when an investigation needs it.', icon: FileText },
              { title: 'Users', mode: 'Referenced', copy: 'Shared identity and role data without duplicated mutable state.', icon: Database },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="min-h-[23rem] bg-surface p-7 sm:p-9">
                  <Icon size={30} weight="light" />
                  <h3 className="mt-16 text-4xl font-medium tracking-[-0.05em]">{item.title}.</h3>
                  <p className="mt-5 font-mono text-xs uppercase tracking-[0.08em] text-brand">{item.mode}</p>
                  <p className="mt-4 max-w-sm leading-7 text-muted">{item.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-hairline pt-28 lg:pt-40">
        <div className="site-container pb-24">
          <h2 className="max-w-[13ch] text-[clamp(3.5rem,8vw,8rem)] font-medium leading-[0.9] tracking-[-0.07em]">
            Every incident deserves a complete record.
          </h2>
          <Link href="/login" className="button-primary group mt-10">
            Sign in <ArrowRight className="transition-transform duration-500 group-hover:translate-x-1" size={18} weight="bold" />
          </Link>
        </div>
        <footer className="border-t border-hairline">
          <div className="site-container grid gap-px py-8 text-sm sm:grid-cols-2 lg:grid-cols-6">
            <Logo className="lg:col-span-2" />
            <a href="#product" className="py-2 hover:text-brand">Product</a>
            <a href="#architecture" className="py-2 hover:text-brand">Architecture</a>
            <Link href="/login" className="py-2 hover:text-brand">Sign in</Link>
            <a href="https://github.com/LT-Ripjaws/SentinelOps" target="_blank" rel="noreferrer" className="py-2 hover:text-brand">GitHub</a>
          </div>
        </footer>
      </section>
    </main>
  );
}
