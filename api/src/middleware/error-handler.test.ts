import express from 'express';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppError } from '../lib/errors';
import { errorHandler, notFoundHandler } from './error-handler';

/** A tiny app that exercises the error middleware in isolation from createApp(). */
const app = express();
app.get('/boom', () => {
  throw new Error('secret internal detail');
});
app.get('/async-boom', async () => {
  throw new Error('async secret');
});
app.get('/teapot', () => {
  throw new AppError(418, 'teapot', 'I am a teapot');
});
app.use(notFoundHandler);
app.use(errorHandler);

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

describe('error middleware', () => {
  it('turns an AppError into its status + code + message', async () => {
    const res = await fetch(`${base()}/teapot`);
    expect(res.status).toBe(418);
    expect(await res.json()).toEqual({
      success: false,
      error: { code: 'teapot', message: 'I am a teapot' },
    });
  });

  it('turns an unexpected thrown error into a generic 500 with no stack or message leak', async () => {
    const res = await fetch(`${base()}/boom`);
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).not.toContain('secret');
    expect(text).not.toContain('stack');
    expect(JSON.parse(text)).toEqual({
      success: false,
      error: { code: 'internal_error', message: 'Something went wrong' },
    });
  });

  it('catches async rejections too (Express 5)', async () => {
    const res = await fetch(`${base()}/async-boom`);
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain('async secret');
  });

  it('answers unknown routes with the 404 envelope', async () => {
    const res = await fetch(`${base()}/nope`);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      success: false,
      error: { code: 'not_found', message: 'Route not found' },
    });
  });
});
