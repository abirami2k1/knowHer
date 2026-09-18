import { Router } from 'express';
import { ok } from '../lib/respond';
import { requireAuth } from '../middleware/auth';
import { toProfile } from '../services/users';

export const meRouter = Router();

/** The signed-in user's profile. requireAuth has already created the row if needed. */
meRouter.get('/me', requireAuth, (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  ok(res, toProfile(req.user));
});
