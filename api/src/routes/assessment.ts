import { Router } from 'express';
import { z } from 'zod';
import { CYCLE_COPY, type CopyKey } from '../domain/cycle';
import { AppError } from '../lib/errors';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { calendarDate } from '../schemas/users';
import { assess, findCycle, toCycleDto } from '../services/cycles';

export const assessmentRouter = Router();

/** A live cycle is assessed as of the user's own today (D1); a closed one needs none. */
const assessmentQuerySchema = z.object({ today: calendarDate.optional() }).strict();

/**
 * The engine's reading of one cycle, with the chart rows and the copy for every
 * state it reports. The client renders this and computes nothing itself.
 *
 * Note on D4: closed cycles keep a stored snapshot, but it holds six summary
 * fields and no chart rows, so this endpoint re-runs the engine either way. The
 * snapshot stays the cheap read for Trends; this is the detailed one.
 */
assessmentRouter.get('/cycles/:id/assessment', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const { today } = parseBody(assessmentQuerySchema, req.query);

  const cycle = await findCycle(req.user.id, String(req.params.id));
  if (!cycle) throw new AppError(404, 'not_found', 'That cycle could not be found');

  const assessment = await assess(req.user.id, cycle, today);

  // Only the copy this cycle actually needs, so the UI never picks its own words.
  const keys: CopyKey[] = [...assessment.flags, `confidence.${assessment.confidence}` as CopyKey];
  const copy = Object.fromEntries(keys.map((key) => [key, CYCLE_COPY[key]]));

  ok(res, { cycle: toCycleDto(cycle), assessment, copy });
});
