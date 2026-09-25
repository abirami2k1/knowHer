import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getHistory } from '@/lib/api/history';

/** A month of logged days, keyed by month so browsing back and forth is instant. */
export function useHistory(month: string) {
  const { status } = useAuth();
  return useQuery({
    queryKey: ['history', month],
    queryFn: () => getHistory(month),
    enabled: status === 'authed',
  });
}
