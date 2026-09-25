import { Router } from 'express';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { editCycleSchema, startCycleSchema } from '../schemas/cycles';
import { editCycleStart, listCycles, startCycle, toCycleDto } from '../services/cycles';

export const cyclesRouter = Router();

/** Her cycles, newest first. */
cyclesRouter.get('/cycles', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  ok(res, (await listCycles(req.user.id)).map(toCycleDto));
});

/** Record a period start. Closes the previous cycle; splits one if this is a backfill. */
cyclesRouter.post('/cycles', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const { startDate } = parseBody(startCycleSchema, req.body);
  ok(res, toCycleDto(await startCycle(req.user.id, startDate)), 201);
});

/** Correct a start date. Intervals move; logs are never reassigned (D2). */
cyclesRouter.patch('/cycles/:id', requireAuth, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const { startDate } = parseBody(editCycleSchema, req.body);
  const id = String(req.params.id);
  ok(res, toCycleDto(await editCycleStart(req.user.id, id, startDate)));
});
