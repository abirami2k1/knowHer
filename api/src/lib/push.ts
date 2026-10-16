import webpush from 'web-push';
import { CONFIG } from '../config';

/**
 * Sending one web-push message. An interface so the sweep's ordering and
 * failure handling in services/push.ts can be tested without a push service.
 */
export interface PushTarget {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export type PushOutcome =
  /** Delivered to the push service. */
  | 'sent'
  /** The browser is gone (unsubscribed, uninstalled, expired) — drop the row. */
  | 'gone'
  /** Something else went wrong; worth one more try tomorrow. */
  | 'failed';

export interface PushSender {
  send(target: PushTarget, payload: string): Promise<PushOutcome>;
}

let configured = false;

/**
 * The real sender. A 404 or 410 from the push service is the standard way a
 * browser says "this subscription is dead" — it is an expected outcome, not an
 * error, so it is returned rather than thrown.
 */
export function webPushSender(): PushSender {
  if (!configured) {
    const { subject, publicKey, privateKey } = CONFIG.vapid;
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }

  return {
    async send(target, payload) {
      try {
        await webpush.sendNotification(
          { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
          payload,
          { TTL: 60 * 60 },
        );
        return 'sent';
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        return status === 404 || status === 410 ? 'gone' : 'failed';
      }
    },
  };
}
