import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../lib/errors';
import { fail } from '../lib/respond';

/** Shape body-parser (express.json) attaches to the errors it throws. */
interface BodyParserError {
  type?: string;
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  fail(res, 404, 'not_found', 'Route not found');
};

/**
 * Single place every error is turned into the response envelope.
 * Must keep the 4-argument signature so Express treats it as an error handler.
 * Never sends a stack trace or internal message to the client. Logs the message
 * only — never the request body, which may contain health data.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err instanceof AppError) {
    fail(res, err.status, err.code, err.message);
    return;
  }
  const { type } = err as BodyParserError;
  if (type === 'entity.too.large') {
    fail(res, 413, 'payload_too_large', 'Request body is too large');
    return;
  }
  if (type === 'entity.parse.failed') {
    fail(res, 400, 'invalid_json', 'Request body is not valid JSON');
    return;
  }
  console.error('[api] unhandled error:', err instanceof Error ? err.message : String(err));
  fail(res, 500, 'internal_error', 'Something went wrong');
};
