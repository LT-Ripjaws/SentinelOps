import { QueryProvider } from '@/components/providers/query-provider';
import { WorkspaceShell } from '@/components/workspace/workspace-shell';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </QueryProvider>
  );
}
