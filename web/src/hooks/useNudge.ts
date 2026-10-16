import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getPushKey,
  getPushSubscriptions,
  removePushSubscription,
  savePushSubscription,
} from '@/lib/api/push';
import {
  currentSubscription,
  deviceTimeZone,
  nudgeBlocker,
  subscribeBrowser,
  unsubscribeBrowser,
  type NudgeBlocker,
} from '@/lib/push-browser';

export const DEFAULT_NUDGE_TIME = '20:00';

export interface NudgeState {
  /** Why this browser cannot be offered the nudge, or null when it can. */
  blocker: NudgeBlocker | null;
  /** True once the server and this browser agree it is subscribed. */
  isOn: boolean;
  /** The time saved for this browser, or the default when it is off. */
  nudgeTime: string;
  isLoading: boolean;
  isSaving: boolean;
  turnOn: (nudgeTime: string) => void;
  turnOff: () => void;
  changeTime: (nudgeTime: string) => void;
}

/**
 * The daily nudge for *this* browser. Two sources have to agree: the browser
 * holds the subscription, the API holds the time — and either can fall out of
 * step (she can revoke permission in site settings, or clear site data). The
 * hook reports on only when both say so, so the switch never claims a nudge
 * that will not arrive.
 */
export function useNudge({ enabled = true }: { enabled?: boolean } = {}): NudgeState {
  const queryClient = useQueryClient();
  const blocker = useMemo(() => nudgeBlocker(), []);

  const key = useQuery({ queryKey: ['push', 'key'], queryFn: getPushKey, enabled });
  const saved = useQuery({
    queryKey: ['push', 'subscriptions'],
    queryFn: getPushSubscriptions,
    enabled,
  });
  const browser = useQuery({
    queryKey: ['push', 'browser'],
    queryFn: currentSubscription,
    enabled: enabled && !blocker,
  });

  const here = browser.data
    ? saved.data?.find((device) => device.endpoint === browser.data?.endpoint)
    : undefined;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['push'] });

  const on = useMutation({
    mutationFn: async (nudgeTime: string) => {
      const publicKey = key.data?.publicKey;
      if (!publicKey) throw new Error('this knowHer API has no push key configured');

      // An already-subscribed browser only needs its time moved.
      const subscription = here ? await currentSubscription() : await subscribeBrowser(publicKey);
      if (!subscription) return false; // she declined the browser prompt
      await savePushSubscription({ ...subscription, nudgeTime, timeZone: deviceTimeZone() });
      return true;
    },
    onSuccess: invalidate,
  });

  const off = useMutation({
    mutationFn: async () => {
      const subscription = await currentSubscription();
      await unsubscribeBrowser();
      // Tell the API last: if this fails, the browser is already deaf to it,
      // and the sweep drops the endpoint the first time it is refused.
      if (subscription) await removePushSubscription(subscription.endpoint);
    },
    onSuccess: invalidate,
  });

  return {
    blocker,
    isOn: Boolean(here && browser.data),
    nudgeTime: here?.nudgeTime ?? DEFAULT_NUDGE_TIME,
    isLoading: key.isPending || saved.isPending || browser.isPending,
    isSaving: on.isPending || off.isPending,
    turnOn: (nudgeTime) => on.mutate(nudgeTime),
    turnOff: () => off.mutate(),
    changeTime: (nudgeTime) => on.mutate(nudgeTime),
  };
}
