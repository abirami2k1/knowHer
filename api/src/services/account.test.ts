import { describe, expect, it } from 'vitest';
import type { User } from '../generated/prisma/client';
import { deleteAccount, type DeletionDeps } from './account';

const USER = { id: 'u1', cognitoSub: 'sub-1', role: 'user' } as User;

/** Records every step in order; any step can be made to fail. */
function fakeDeps(
  fail: Partial<Record<'disable' | 'deleteRows' | 'remove', boolean>> = {},
  posts = 0,
) {
  const steps: string[] = [];
  const step = (name: string, shouldFail?: boolean) => async () => {
    steps.push(name);
    if (shouldFail) throw new Error(`${name} failed`);
  };
  const deps: DeletionDeps = {
    identity: {
      disable: step('disable', fail.disable),
      enable: step('enable'),
      remove: step('remove', fail.remove),
    },
    deleteRows: step('deleteRows', fail.deleteRows),
    queueRetry: step('queueRetry'),
    countPosts: async () => posts,
  };
  return { deps, steps };
}

describe('deleteAccount (D8)', () => {
  it('disables, then deletes rows, then removes the Cognito user', async () => {
    const { deps, steps } = fakeDeps();
    expect(await deleteAccount(USER, deps)).toBe('deleted');
    expect(steps).toEqual(['disable', 'deleteRows', 'remove']);
  });

  it('fails closed when Cognito cannot be reached: nothing is deleted', async () => {
    const { deps, steps } = fakeDeps({ disable: true });
    await expect(deleteAccount(USER, deps)).rejects.toMatchObject({
      status: 503,
      code: 'deletion_unavailable',
    });
    expect(steps).toEqual(['disable']);
  });

  it('re-enables her sign-in if the database delete fails, so she is never locked out of her data', async () => {
    const { deps, steps } = fakeDeps({ deleteRows: true });
    await expect(deleteAccount(USER, deps)).rejects.toThrow('deleteRows failed');
    expect(steps).toEqual(['disable', 'deleteRows', 'enable']);
  });

  it('queues the Cognito removal when only the last step fails — the account is already inert', async () => {
    const { deps, steps } = fakeDeps({ remove: true });
    expect(await deleteAccount(USER, deps)).toBe('deleted_identity_pending');
    expect(steps).toEqual(['disable', 'deleteRows', 'remove', 'queueRetry']);
  });

  it('refuses an author who still has posts, before touching anything', async () => {
    const { deps, steps } = fakeDeps({}, 2);
    await expect(deleteAccount(USER, deps)).rejects.toMatchObject({
      status: 409,
      code: 'author_has_posts',
    });
    expect(steps).toEqual([]);
  });
});
