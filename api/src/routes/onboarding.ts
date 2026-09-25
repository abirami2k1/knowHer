import { Router } from 'express';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { onboardingSchema } from '../schemas/users';
import { completeOnboarding } from '../services/onboarding';
import { toProfile } from '../services/users';

export const onboardingRouter = Router();

/**
 * The single submit at the end of the onboarding flow: saves the profile, sets
 * onboardedAt (what the web route guard checks), and seeds the first cycle when a
 * last-period date was given. "Not sure" simply omits it.
 */
onboardingRouter.post('/onboarding', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const input = parseBody(onboardingSchema, req.body);
  ok(res, toProfile(await completeOnboarding(req.user, input)));
});
