import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { deleteAccountSchema } from '../schemas/account';

describe('deleteAccountSchema', () => {
  it('accepts only the exact phrase', () => {
    expect(deleteAccountSchema.safeParse({ confirm: 'delete my account' }).success).toBe(true);
    for (const body of [{}, { confirm: 'Delete my account' }, { confirm: 'yes' }]) {
      expect(deleteAccountSchema.safeParse(body).success).toBe(false);
    }
  });
});

describe('account routes are behind requireAuth', () => {
  let server: Server;
  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = createApp().listen(0, resolve);
    });
  });
  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it.each([
    ['GET', '/account/export'],
    ['DELETE', '/account'],
  ])('rejects an anonymous %s %s', async (method, path) => {
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(method === 'DELETE' && { body: JSON.stringify({ confirm: 'delete my account' }) }),
    });
    expect(res.status).toBe(401);
  });
});
