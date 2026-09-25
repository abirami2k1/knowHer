import { Router } from 'express';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { updateProfileSchema } from '../schemas/users';
import { toProfile, updateProfile } from '../services/users';

export const meRouter = Router();

/** The signed-in user's profile. requireAuth has already created the row if needed. */
meRouter.get('/me', requireAuth, (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  ok(res, toProfile(req.user));
});

/** Edit profile fields after onboarding. Identity comes from the token, never the body. */
meRouter.patch('/me', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const input = parseBody(updateProfileSchema, req.body);
  ok(res, toProfile(await updateProfile(req.user.id, input)));
});
