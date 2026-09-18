import { Router } from 'express';
import { ok } from '../lib/respond';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  ok(res, { status: 'ok' });
});
