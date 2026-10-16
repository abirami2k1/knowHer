import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { pendingLogs, replayQueue } from '@/lib/offline';

function subscribeToConnection(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

/** The browser's own view of the connection. Not proof, but a good hint. */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    subscribeToConnection,
    () => navigator.onLine,
    () => true, // assume connected while rendering on no browser at all
  );
}

export interface OfflineState {
  isOnline: boolean;
  /** Days written on this device that the API has not accepted yet. */
  pending: number;
}

/**
 * The connection, and what is still waiting because of it. Replays the queue
 * whenever the browser comes back, and once on mount — a tab opened after a
 * reload never sees the `online` event that happened while it was closed.
 */
export function useOffline(): OfflineState {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const isOnline = useIsOnline();
  const [pending, setPending] = useState(0);

  const sync = useCallback(async () => {
    try {
      setPending((await pendingLogs()).length);
      if (status !== 'authed' || !navigator.onLine) return;

      const { sent, rejected } = await replayQueue();
      if (sent) {
        await queryClient.invalidateQueries();
        toast.success(sent === 1 ? 'Your saved day is synced.' : `${sent} saved days are synced.`);
      }
      if (rejected) {
        // Dropped rather than retried forever — but she is told, so the day is not lost quietly.
        toast.error(
          rejected === 1
            ? "One saved day couldn't be synced and was dropped. Please log it again."
            : `${rejected} saved days couldn't be synced and were dropped. Please log them again.`,
        );
      }
      setPending((await pendingLogs()).length);
    } catch {
      setPending(0);
    }
  }, [status, queryClient]);

  useEffect(() => {
    // Deferred by a frame: nothing here needs to happen during the render that
    // scheduled it, and syncing inside the effect body would cascade renders.
    const handle = window.setTimeout(() => void sync(), 0);
    return () => window.clearTimeout(handle);
  }, [sync, isOnline]);

  return { isOnline, pending };
}
