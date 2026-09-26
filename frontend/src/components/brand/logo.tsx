import Link from 'next/link';

type LogoProps = {
  compact?: boolean;
  href?: string;
  className?: string;
};

export function SentinelMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 6H7V25H14" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M26 34H33V15H26" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
      <path d="M20 9V31" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="20" r="4" fill="currentColor" />
      <path d="M10 30H17" stroke="#2559F6" strokeWidth="3" />
    </svg>
  );
}

export function Logo({ compact = false, href = '/', className = '' }: LogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 font-semibold tracking-[-0.035em] ${className}`}
      aria-label="SentinelOps home"
    >
      <SentinelMark className="h-8 w-8 shrink-0" />
      {!compact && <span className="text-lg">SentinelOps</span>}
    </Link>
  );
}
