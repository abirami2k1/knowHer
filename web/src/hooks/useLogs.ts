import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DailyLogDto } from '@shared/types';
import { useAuth } from '@/hooks/useAuth';
import { getLogs, putLog, type UpsertLogBody } from '@/lib/api/logs';

/** The logged days in a range, keyed so neighbouring ranges cache separately. */
export function useLogs(from: string, to: string) {
  const { status } = useAuth();
  return useQuery({
    queryKey: ['logs', from, to],
    queryFn: () => getLogs(from, to),
    enabled: status === 'authed',
  });
}

/** One day, read from the day's own one-day range so edits stay cheap to refetch. */
export function useDayLog(date: string) {
  const query = useLogs(date, date);
  return { ...query, log: query.data?.[0] ?? null };
}

/** Save a day. Every cached range is refetched, since any of them may contain it. */
export function useSaveLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertLogBody): Promise<DailyLogDto> => putLog(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['logs'] }),
  });
}
