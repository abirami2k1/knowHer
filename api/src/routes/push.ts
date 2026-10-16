import { Router } from 'express';
import { CONFIG } from '../config';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { removePushSubscriptionSchema, savePushSubscriptionSchema } from '../schemas/push';
import {
  listPushSubscriptions,
  removePushSubscription,
  savePushSubscription,
} from '../services/push';

export const pushRouter = Router();

/**
 * The VAPID public key, served rather than baked into the web bundle so the
 * key can be rotated without rebuilding the app. null when push is not
 * configured — the UI then simply does not offer the nudge.
 */
pushRouter.get('/push/key', requireAuth, (_req, res) => {
  ok(res, { publicKey: CONFIG.pushConfigured ? CONFIG.vapid.publicKey : null });
});

/** The browsers she has opted in, so Profile can tell whether this one is on. */
pushRouter.get('/push/subscriptions', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  ok(res, await listPushSubscriptions(req.user.id));
});

/** Opt this browser in, or move its time. Upsert, so saying yes twice is fine. */
pushRouter.put('/push/subscriptions', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const input = parseBody(savePushSubscriptionSchema, req.body);
  ok(res, await savePushSubscription(req.user.id, input));
});

/** Opt out. Always succeeds: turning off a nudge that is already off is not an error. */
pushRouter.delete('/push/subscriptions', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const { endpoint } = parseBody(removePushSubscriptionSchema, req.body);
  await removePushSubscription(req.user.id, endpoint);
  ok(res, { removed: true });
});
