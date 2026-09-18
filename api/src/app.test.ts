import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from './app';
import { CONFIG } from './config';

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

describe('GET /health', () => {
  it('returns 200 with the ok envelope', async () => {
    const res = await fetch(`${base()}/health`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toEqual({ success: true, data: { status: 'ok' } });
  });
});

describe('hardening', () => {
  it('sets helmet security headers and hides x-powered-by', async () => {
    const res = await fetch(`${base()}/health`);
    expect(res.headers.get('x-powered-by')).toBeNull();
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('content-security-policy')).toBeTruthy();
  });

  it('allows CORS only for the configured web origin', async () => {
    const allowed = await fetch(`${base()}/health`, { headers: { Origin: CONFIG.webOrigin } });
    expect(allowed.headers.get('access-control-allow-origin')).toBe(CONFIG.webOrigin);

    const other = await fetch(`${base()}/health`, { headers: { Origin: 'https://evil.example' } });
    expect(other.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('rejects JSON bodies over the limit with a 413 envelope', async () => {
    const big = JSON.stringify({ pad: 'x'.repeat(150 * 1024) });
    const res = await fetch(`${base()}/health`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: big,
    });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({
      success: false,
      error: { code: 'payload_too_large', message: 'Request body is too large' },
    });
  });

  it('rejects malformed JSON with a 400 envelope', async () => {
    const res = await fetch(`${base()}/health`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{ not json',
    });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe('invalid_json');
  });

  it('exposes rate-limit headers', async () => {
    const res = await fetch(`${base()}/health`);
    expect(res.headers.get('ratelimit')).toBeTruthy();
  });
});
