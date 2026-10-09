import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app';

let server: Server;
beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = createApp().listen(0, resolve);
  });
});
afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

const call = (method: string, path: string) => {
  const { port } = server.address() as AddressInfo;
  return fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(method !== 'GET' && {
      body: JSON.stringify({ title: 'x', bodyMarkdown: 'y', audience: 'user' }),
    }),
  });
};

describe('content routes are behind requireAuth', () => {
  it.each([
    ['GET', '/knowledge'],
    ['GET', '/blog'],
    ['GET', '/blog/welcome-from-sivi'],
    ['GET', '/admin/posts'],
    ['POST', '/blog'],
    ['PATCH', '/blog/abc'],
    ['POST', '/blog/abc/publish'],
    ['POST', '/blog/abc/unpublish'],
  ])('rejects an anonymous %s %s', async (method, path) => {
    expect((await call(method, path)).status).toBe(401);
  });
});
