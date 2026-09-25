import { useQuery } from '@tanstack/react-query';
import { getAssessment } from '@/lib/api/assessment';
import { todayIsoDate } from '@/lib/dates';

/** The engine's reading of one cycle. Everything shown on the chart comes from here. */
export function useAssessment(cycleId: string | undefined) {
  const today = todayIsoDate();
  return useQuery({
    queryKey: ['assessment', cycleId, today],
    queryFn: () => getAssessment(cycleId as string, today),
    enabled: Boolean(cycleId),
  });
}
