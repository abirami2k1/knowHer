import { Router } from 'express';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { logRangeSchema, upsertLogSchema } from '../schemas/logs';
import { listLogs, upsertLog } from '../services/logs';

export const logsRouter = Router();

/**
 * Save or edit a day. PUT because it is an upsert keyed by the date in the body —
 * the same call creates today's entry, edits it, or backfills last Tuesday.
 */
logsRouter.put('/logs', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const input = parseBody(upsertLogSchema, req.body);
  ok(res, await upsertLog(req.user.id, input));
});

/** The logged days in a range. Filters are dates only — never health values (no health data in URLs). */
logsRouter.get('/logs', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const { from, to } = parseBody(logRangeSchema, req.query);
  ok(res, await listLogs(req.user.id, from, to));
});
