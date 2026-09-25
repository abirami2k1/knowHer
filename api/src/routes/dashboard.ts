import { Router } from 'express';
import { z } from 'zod';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { calendarDate } from '../schemas/users';
import { buildDashboard } from '../services/dashboard';

export const dashboardRouter = Router();

/** `today` is required: the answer depends on her day, which the server cannot know (D1). */
const dashboardQuerySchema = z.object({ today: calendarDate }).strict();

dashboardRouter.get('/dashboard', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const { today } = parseBody(dashboardQuerySchema, req.query);
  ok(res, await buildDashboard(req.user, today));
});
