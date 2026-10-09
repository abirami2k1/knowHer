import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { User } from '../generated/prisma/client';
import { AppError } from '../lib/errors';
import { requireRole } from './require-role';

const run = (user?: Partial<User>) => {
  const next = vi.fn<NextFunction>();
  requireRole('author')({ user } as Request, {} as Response, next);
  return next.mock.calls[0][0] as unknown;
};

describe('requireRole', () => {
  it('lets an author through', () => {
    expect(run({ role: 'author' })).toBeUndefined();
  });

  it('refuses a regular user with 403', () => {
    const error = run({ role: 'user' });
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ status: 403, code: 'forbidden' });
  });

  it('refuses when no user was attached', () => {
    expect(run()).toMatchObject({ status: 403 });
  });
});
