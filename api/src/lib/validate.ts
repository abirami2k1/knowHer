import type { ZodType } from 'zod';
import { AppError } from './errors';

/**
 * Validates a request body at the route boundary. On failure the message names
 * the offending fields only — never the submitted values, which may be health data.
 */
export function parseBody<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (result.success) return result.data;

  const fields = result.error.issues.map((issue) => issue.path.join('.') || 'body');
  const unique = [...new Set(fields)].join(', ');
  throw new AppError(400, 'invalid_input', `Please check these fields: ${unique}`);
}
