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

const UNAUTHORIZED = {
  success: false,
  error: { code: 'unauthorized', message: 'Please sign in to continue' },
};

describe('requireAuth on GET /me', () => {
  it('rejects a request with no Authorization header', async () => {
    const res = await fetch(`${base()}/me`);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(UNAUTHORIZED);
  });

  it('rejects a non-Bearer scheme', async () => {
    const res = await fetch(`${base()}/me`, { headers: { Authorization: 'Basic dXNlcjpwdw==' } });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(UNAUTHORIZED);
  });

  it('rejects a Bearer token that is not a JWT (fails parsing, no JWKS fetch)', async () => {
    const res = await fetch(`${base()}/me`, { headers: { Authorization: 'Bearer not-a-jwt' } });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual(UNAUTHORIZED);
  });

  it('never echoes the token back in the error body', async () => {
    const res = await fetch(`${base()}/me`, { headers: { Authorization: 'Bearer secret-token' } });
    expect(await res.text()).not.toContain('secret-token');
  });
});
