import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DailyLogDto } from '@shared/types';
import { useAuth } from '@/hooks/useAuth';
import { getLogs, putLog, type UpsertLogBody } from '@/lib/api/logs';
import { isOffline, queueLog } from '@/lib/offline';

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

/** What a save turned into: accepted by the API, or held on this device. */
export type SaveOutcome = { queued: false; log: DailyLogDto } | { queued: true };

/**
 * Save a day. With no connection the day is queued on the device instead of
 * failing, and replayed later through the normal client (13.0.3) — `PUT /logs`
 * upserts by date, so a replay is last-write-wins however long it waited.
 *
 * Only the network is caught: an API that *refuses* the day is a real error
 * she needs to see now, while she still has it in front of her.
 */
export function useSaveLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpsertLogBody): Promise<SaveOutcome> => {
      try {
        return { queued: false, log: await putLog(body) };
      } catch (error) {
        if (!isOffline(error)) throw error;
        await queueLog(body);
        return { queued: true };
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['logs'] }),
  });
}
