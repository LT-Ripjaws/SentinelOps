import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to the SentinelOps incident response workspace.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
