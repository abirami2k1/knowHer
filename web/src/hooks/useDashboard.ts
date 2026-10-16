import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getDashboard } from '@/lib/api/dashboard';
import { todayIsoDate } from '@/lib/dates';
import { cacheDashboard, readCachedDashboard, type CachedDashboard } from '@/lib/offline';

/** Today, as the API assembled it. The screen adds no reasoning of its own. */
export function useDashboard() {
  const { status } = useAuth();
  const today = todayIsoDate();
  return useQuery({
    queryKey: ['dashboard', today],
    queryFn: async () => {
      const data = await getDashboard(today);
      cacheDashboard(data, today);
      return data;
    },
    enabled: status === 'authed',
  });
}

/**
 * The last dashboard the API sent, for an app opened with no connection.
 * Returned only when the live read failed, and always with the time it was
 * fetched, so the screen can say so rather than imply it is today's reading.
 */
export function lastFetchedDashboard(): CachedDashboard | null {
  return readCachedDashboard();
}
