import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getDashboard } from '@/lib/api/dashboard';
import { todayIsoDate } from '@/lib/dates';

/** Today, as the API assembled it. The screen adds no reasoning of its own. */
export function useDashboard() {
  const { status } = useAuth();
  const today = todayIsoDate();
  return useQuery({
    queryKey: ['dashboard', today],
    queryFn: () => getDashboard(today),
    enabled: status === 'authed',
  });
}
