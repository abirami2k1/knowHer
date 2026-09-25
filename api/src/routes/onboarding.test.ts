import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app';

const app = createApp();
let server: Server;
const base = () => `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, resolve);
  });
});
afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const send = (path: string, method: string, body: unknown) =>
  fetch(`${base()}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const UNAUTHORIZED = {
  success: false,
  error: { code: 'unauthorized', message: 'Please sign in to continue' },
};

// Validation itself is unit-tested in schemas/users.test.ts; here we prove the
// guard runs BEFORE any body handling, so anonymous input never reaches the DB.
describe('the write routes are behind requireAuth', () => {
  it('rejects an anonymous POST /onboarding', async () => {
    const res = await send('/onboarding', 'POST', { displayName: 'Abi', ageBand: 'b25_34' });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(UNAUTHORIZED);
  });

  it('rejects an anonymous PATCH /me', async () => {
    const res = await send('/me', 'PATCH', { trackingBBT: true });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(UNAUTHORIZED);
  });

  it('answers 401, not 400, for an anonymous request with an invalid body', async () => {
    const res = await send('/onboarding', 'POST', { ageBand: 'nonsense' });
    expect(res.status).toBe(401);
  });
});
