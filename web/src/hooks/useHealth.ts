import { useQuery } from '@tanstack/react-query';
import { getHealth } from '@/lib/api/health';

/** Polls GET /health so the Home screen can show whether the API is reachable. */
export function useHealth() {
  return useQuery({ queryKey: ['health'], queryFn: getHealth, refetchInterval: 30_000 });
}
