import { describe, expect, it } from 'vitest';
import {
  MAX_POST_LENGTH,
  blogQuerySchema,
  createPostSchema,
  knowledgeQuerySchema,
  slugParam,
  updatePostSchema,
} from './content';

const POST = { title: 'Notes on the luteal phase', bodyMarkdown: 'Hello', audience: 'user' };

describe('content query schemas', () => {
  it('accepts the reader sections and nothing else', () => {
    expect(blogQuerySchema.safeParse({}).success).toBe(true);
    expect(blogQuerySchema.safeParse({ audience: 'supporter' }).success).toBe(true);
    expect(blogQuerySchema.safeParse({ audience: 'both' }).success).toBe(false);
    expect(blogQuerySchema.safeParse({ drafts: 'true' }).success).toBe(false);
    expect(knowledgeQuerySchema.safeParse({ category: 'basics' }).success).toBe(true);
    expect(knowledgeQuerySchema.safeParse({ category: 'secret' }).success).toBe(false);
  });

  it('accepts only well-formed slugs', () => {
    expect(slugParam.safeParse('welcome-from-sivi').success).toBe(true);
    for (const bad of ['Welcome', '../etc', 'a--b', '-a', '']) {
      expect(slugParam.safeParse(bad).success).toBe(false);
    }
  });
});

describe('post schemas', () => {
  it('requires a title, a body and an audience to create', () => {
    expect(createPostSchema.safeParse(POST).success).toBe(true);
    expect(createPostSchema.safeParse({ ...POST, title: '   ' }).success).toBe(false);
    expect(createPostSchema.safeParse({ ...POST, audience: 'everyone' }).success).toBe(false);
  });

  it('refuses fields an author must not set directly', () => {
    for (const extra of [{ isPublished: true }, { authorId: 'x' }, { slug: 'x' }]) {
      expect(createPostSchema.safeParse({ ...POST, ...extra }).success).toBe(false);
      expect(updatePostSchema.safeParse(extra).success).toBe(false);
    }
  });

  it('caps the body length and rejects an empty edit', () => {
    const long = 'a'.repeat(MAX_POST_LENGTH + 1);
    expect(createPostSchema.safeParse({ ...POST, bodyMarkdown: long }).success).toBe(false);
    expect(updatePostSchema.safeParse({}).success).toBe(false);
    expect(updatePostSchema.safeParse({ title: 'New title' }).success).toBe(true);
  });
});
