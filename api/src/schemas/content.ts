import { z } from 'zod';

/** Input validation for the knowledge and blog routes (the only place it lives). */

export const AUDIENCES = ['user', 'supporter', 'both'] as const;
export const KNOWLEDGE_CATEGORIES = ['basics', 'cycle', 'supporters'] as const;

export const knowledgeQuerySchema = z
  .object({ category: z.enum(KNOWLEDGE_CATEGORIES).optional() })
  .strict();

/** A reader asks for her section; 'both' posts appear in either. */
export const blogQuerySchema = z
  .object({ audience: z.enum(['user', 'supporter']).optional() })
  .strict();

export const slugParam = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Not a valid post address')
  .max(100);

/** The JSON body limit is ~100 kB; this keeps a post well inside it. */
export const MAX_POST_LENGTH = 50_000;

const postFields = {
  title: z.string().trim().min(1).max(120),
  bodyMarkdown: z.string().trim().min(1).max(MAX_POST_LENGTH),
  audience: z.enum(AUDIENCES),
};

export const createPostSchema = z.object(postFields).strict();

export const updatePostSchema = z
  .object(postFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Nothing to update');

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
