import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getTrends } from '@/lib/api/trends';
import { todayIsoDate } from '@/lib/dates';

/** Patterns over her cycles, as the API assembled them. The screen does no math. */
export function useTrends() {
  const { status } = useAuth();
  const today = todayIsoDate();
  return useQuery({
    queryKey: ['trends', today],
    queryFn: () => getTrends(today),
    enabled: status === 'authed',
  });
}
