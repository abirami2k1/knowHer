import { Router } from 'express';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { historyQuerySchema } from '../schemas/history';
import { historyForMonth } from '../services/history';

export const historyRouter = Router();

/** One month of logged days. Never estimates — see services/history.ts. */
historyRouter.get('/history', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const { month } = parseBody(historyQuerySchema, req.query);
  ok(res, await historyForMonth(req.user.id, month));
});
