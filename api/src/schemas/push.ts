import { z } from 'zod';
import { isNudgeTime, isTimeZone } from '../lib/nudge-schedule';

/**
 * What the browser hands over at opt-in. The endpoint and keys come straight
 * from the PushSubscription the browser minted; the time and zone are hers.
 */
export const savePushSubscriptionSchema = z
  .object({
    endpoint: z.url().max(2000),
    p256dh: z.string().min(1).max(256),
    auth: z.string().min(1).max(256),
    nudgeTime: z.string().refine(isNudgeTime, 'must be a local time like 20:00'),
    timeZone: z.string().max(64).refine(isTimeZone, 'must be an IANA time zone'),
  })
  .strict();

/** Turning the nudge off for this browser. */
export const removePushSubscriptionSchema = z.object({ endpoint: z.url().max(2000) }).strict();

export type SavePushSubscriptionInput = z.infer<typeof savePushSubscriptionSchema>;
