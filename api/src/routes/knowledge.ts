import { Router } from 'express';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { knowledgeQuerySchema } from '../schemas/content';
import { listKnowledge } from '../services/content';

export const knowledgeRouter = Router();

knowledgeRouter.get('/knowledge', requireAuth, async (req, res) => {
  const { category } = parseBody(knowledgeQuerySchema, req.query);
  ok(res, await listKnowledge(category));
});
