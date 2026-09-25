import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CycleDto } from '@shared/types';
import { useAuth } from '@/hooks/useAuth';
import { getCycles, postCycleStart } from '@/lib/api/cycles';

export function useCycles() {
  const { status } = useAuth();
  return useQuery({ queryKey: ['cycles'], queryFn: getCycles, enabled: status === 'authed' });
}

/** True when a cycle's interval already covers this date. */
export function cycleCovers(cycles: CycleDto[] | undefined, date: string): boolean {
  return (cycles ?? []).some(
    (c) => c.startDate <= date && (c.endDate === null || date <= c.endDate),
  );
}

export function useStartCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ startDate, today }: { startDate: string; today: string }) =>
      postCycleStart(startDate, today),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycles'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
  });
}
