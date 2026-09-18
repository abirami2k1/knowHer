import type { Response } from 'express';
import type { ApiResponse } from '../../../shared/types';

/**
 * The one response envelope every knowHer endpoint uses (type in /shared/types.ts).
 * Routes never call res.json() directly — they call ok() or fail().
 */
export function ok<T>(res: Response, data: T, status = 200): Response {
  const body: ApiResponse<T> = { success: true, data };
  return res.status(status).json(body);
}

export function fail(res: Response, status: number, code: string, message: string): Response {
  const body: ApiResponse<never> = { success: false, error: { code, message } };
  return res.status(status).json(body);
}
