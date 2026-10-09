import { Router } from 'express';
import { z } from 'zod';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { calendarDate } from '../schemas/users';
import { buildTrends } from '../services/trends';

export const trendsRouter = Router();

/** `today` is required: the live cycle is read as of her own day (D1). Nothing else filters. */
export const trendsQuerySchema = z.object({ today: calendarDate }).strict();

trendsRouter.get('/trends', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const { today } = parseBody(trendsQuerySchema, req.query);
  ok(res, await buildTrends(req.user.id, today));
});
