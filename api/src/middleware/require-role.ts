import type { RequestHandler } from 'express';
import type { Role } from '../generated/prisma/client';
import { AppError } from '../lib/errors';

/**
 * Role check (D7): roles live on the DB user, not in Cognito groups. Mount after
 * requireAuth, which attaches that user — an anonymous request never reaches here.
 */
export function requireRole(role: Role): RequestHandler {
  return (req, _res, next) => {
    if (req.user?.role !== role) {
      next(new AppError(403, 'forbidden', "You don't have access to this"));
      return;
    }
    next();
  };
}
