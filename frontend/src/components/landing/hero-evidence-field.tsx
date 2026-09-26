'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HeroEvidenceField() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        if (!fieldRef.current) return;

        const background = fieldRef.current.querySelector<HTMLElement>('[data-hero-depth="background"]');
        const evidence = fieldRef.current.querySelector<HTMLElement>('[data-hero-depth="evidence"]');
        const network = fieldRef.current.querySelector<HTMLElement>('[data-hero-depth="network"]');

        if (!background || !evidence || !network) return;

        gsap.timeline({
          scrollTrigger: {
            trigger: fieldRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
          .to(background, { yPercent: 9, scale: 1.045, ease: 'none' }, 0)
          .to(evidence, { xPercent: 8, yPercent: -22, rotate: 1.25, ease: 'none' }, 0)
          .to(network, { xPercent: -10, yPercent: -34, rotate: -1.75, ease: 'none' }, 0);
      });

      return () => media.revert();
    },
    { scope: fieldRef },
  );

  return (
    <div ref={fieldRef} className="pointer-events-none absolute inset-0">
      <div data-hero-depth="background" className="absolute -inset-4">
        <Image
          src="/brand/hero-evidence-lab.png"
          alt="A bright incident-response evidence table with a network recorder, preserved documents, and blue data cable"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[58%_center] sm:object-[55%_center] lg:object-center"
        />
      </div>

      <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(242,243,239,0.04)_0%,rgba(242,243,239,0.48)_43%,rgba(242,243,239,0.98)_88%)] md:bg-[linear-gradient(90deg,rgba(242,243,239,0.98)_0%,rgba(242,243,239,0.88)_31%,rgba(242,243,239,0.18)_58%,rgba(242,243,239,0)_78%)]" />

      <div
        data-hero-depth="evidence"
        className="absolute right-[4vw] top-[15%] z-20 hidden h-[41%] w-[clamp(11rem,19vw,22rem)] overflow-hidden border-[5px] border-surface bg-surface shadow-[0_24px_70px_rgba(17,19,17,0.13)] sm:block"
      >
        <Image
          src="/brand/hero-evidence-seal.png"
          alt=""
          fill
          sizes="(min-width: 1280px) 22rem, 20vw"
          className="object-cover object-[38%_center]"
        />
      </div>

      <div
        data-hero-depth="network"
        className="absolute bottom-[5%] right-[25%] z-30 hidden h-[28%] w-[clamp(18rem,28vw,32rem)] overflow-hidden border-[5px] border-surface bg-surface shadow-[0_28px_80px_rgba(17,19,17,0.16)] lg:block"
      >
        <Image
          src="/brand/hero-network-tap.png"
          alt=""
          fill
          sizes="28vw"
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}
