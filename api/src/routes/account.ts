import { Router } from 'express';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { deleteAccountSchema } from '../schemas/account';
import { deleteAccount, exportAccount } from '../services/account';

export const accountRouter = Router();

/** Everything we hold about her. Not cached anywhere along the way. */
accountRouter.get('/account/export', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  res.set('Cache-Control', 'no-store');
  ok(res, await exportAccount(req.user));
});

/** Permanent. Ordering and failure handling live in services/account.ts (D8). */
accountRouter.delete('/account', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  parseBody(deleteAccountSchema, req.body);
  ok(res, { outcome: await deleteAccount(req.user) });
});
