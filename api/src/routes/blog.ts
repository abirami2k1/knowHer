import { Router } from 'express';
import { ok } from '../lib/respond';
import { parseBody } from '../lib/validate';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/require-role';
import { blogQuerySchema, createPostSchema, slugParam, updatePostSchema } from '../schemas/content';
import {
  createPost,
  findPublishedPost,
  listAllPosts,
  listPublishedPosts,
  setPublished,
  updatePost,
} from '../services/content';

export const blogRouter = Router();

// ── Readers: published posts only ────────────────────────────────────────────

blogRouter.get('/blog', requireAuth, async (req, res) => {
  const { audience } = parseBody(blogQuerySchema, req.query);
  ok(res, await listPublishedPosts(audience));
});

blogRouter.get('/blog/:slug', requireAuth, async (req, res) => {
  const slug = parseBody(slugParam, req.params.slug);
  ok(res, await findPublishedPost(slug));
});

// ── Authors (D7): drafts and writes ──────────────────────────────────────────

const author = [requireAuth, requireRole('author')];

blogRouter.get('/admin/posts', ...author, async (_req, res) => {
  ok(res, await listAllPosts());
});

blogRouter.post('/blog', ...author, async (req, res) => {
  if (!req.user) throw new Error('requireAuth did not attach a user');
  const input = parseBody(createPostSchema, req.body);
  ok(res, await createPost(req.user.id, input), 201);
});

blogRouter.patch('/blog/:id', ...author, async (req, res) => {
  const input = parseBody(updatePostSchema, req.body);
  ok(res, await updatePost(String(req.params.id), input));
});

blogRouter.post('/blog/:id/publish', ...author, async (req, res) => {
  ok(res, await setPublished(String(req.params.id), true));
});

blogRouter.post('/blog/:id/unpublish', ...author, async (req, res) => {
  ok(res, await setPublished(String(req.params.id), false));
});
