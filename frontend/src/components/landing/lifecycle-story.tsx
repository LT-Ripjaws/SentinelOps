'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  CheckCircle,
  FileArrowUp,
  MagnifyingGlass,
  UserFocus,
  WarningCircle,
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const steps = [
  {
    title: 'Create',
    description: 'Capture the first report with severity, context, and ownership.',
    detail: 'Suspicious sign-in from an unfamiliar location',
    icon: WarningCircle,
  },
  {
    title: 'Assign',
    description: 'Place responsibility with the right analyst without losing context.',
    detail: 'Assigned to Priya Shah, Tier 2 Analyst',
    icon: UserFocus,
  },
  {
    title: 'Investigate',
    description: 'Record each material change in an immutable operational timeline.',
    detail: 'Scope reviewed, affected identity isolated',
    icon: MagnifyingGlass,
  },
  {
    title: 'Attach evidence',
    description: 'Keep logs, screenshots, notes, and supporting files with the incident.',
    detail: 'signin-log.json added to the evidence record',
    icon: FileArrowUp,
  },
  {
    title: 'Resolve',
    description: 'Close the loop with a complete record of what changed and why.',
    detail: 'Incident resolved with a preserved audit history',
    icon: CheckCircle,
  },
];

export function LifecycleStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        if (!sectionRef.current || !copyRef.current) return;

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: copyRef.current,
          pinSpacing: false,
        });

        const panels = gsap.utils.toArray<HTMLElement>('[data-lifecycle-panel]');
        panels.forEach((panel) => {
          gsap.fromTo(
            panel,
            { opacity: 0.28, scale: 0.965 },
            {
              opacity: 1,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                start: 'top 78%',
                end: 'top 38%',
                scrub: true,
              },
            },
          );
        });
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} id="workflow" className="border-t border-hairline py-28 lg:py-40">
      <div className="site-container grid gap-16 lg:grid-cols-12 lg:gap-6">
        <div ref={copyRef} className="self-start lg:col-span-5 lg:pr-12">
          <p className="mono-label text-brand">Incident lifecycle</p>
          <h2 className="section-title mt-6">From first signal to final evidence.</h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-muted">
            A clear chain of responsibility and evidence for every security incident.
          </p>
          <a href="#architecture" className="mt-8 inline-flex items-center gap-2 font-semibold text-brand">
            See the data model <ArrowRight size={18} weight="bold" />
          </a>
        </div>

        <div className="grid gap-5 lg:col-span-7 lg:pb-[24vh]">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                data-lifecycle-panel
                className="panel grid min-h-64 content-between gap-12 p-6 sm:p-8 lg:min-h-[20rem]"
              >
                <div className="flex items-start justify-between gap-6">
                  <Icon size={28} weight="light" aria-hidden="true" />
                  <span className="font-mono text-xs text-muted">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-medium tracking-[-0.04em]">{step.title}</h3>
                  <p className="mt-3 max-w-lg leading-7 text-muted">{step.description}</p>
                  <p className="mt-7 border-t border-hairline pt-4 font-mono text-xs leading-5 text-muted">
                    {step.detail}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
