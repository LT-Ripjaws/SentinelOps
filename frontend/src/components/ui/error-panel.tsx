import { ArrowClockwise } from '@phosphor-icons/react';

type ErrorPanelProps = {
  label: string;
  title: string;
  description: string;
  onRetry: () => void;
  headingLevel?: 'h1' | 'h2';
  className?: string;
  children?: React.ReactNode;
};

export function ErrorPanel({
  label,
  title,
  description,
  onRetry,
  headingLevel: Heading = 'h1',
  className = '',
  children,
}: ErrorPanelProps) {
  return (
    <div className={`panel max-w-xl p-7 ${className}`} role="alert">
      <p className="mono-label text-red-700">{label}</p>
      <Heading className="mt-4 text-4xl font-medium tracking-[-0.05em]">{title}</Heading>
      <p className="mt-4 leading-7 text-muted">{description}</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <button type="button" className="button-secondary" onClick={onRetry}>
          <ArrowClockwise size={18} weight="bold" /> Retry
        </button>
        {children}
      </div>
    </div>
  );
}
