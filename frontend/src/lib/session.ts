import { queryOptions } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SessionUser } from '@/types/api';

export const sessionQueryOptions = queryOptions({
  queryKey: ['session'],
  queryFn: async () => (await api.get<SessionUser>('/auth/me')).data,
  retry: false,
  staleTime: 60_000,
});
