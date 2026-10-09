import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { trendsQuerySchema } from './trends';

describe('trendsQuerySchema', () => {
  it('requires her own today as a real calendar date', () => {
    expect(trendsQuerySchema.safeParse({ today: '2026-10-09' }).success).toBe(true);
    for (const query of [{}, { today: '2026-02-30' }, { today: '09-10-2026' }]) {
      expect(trendsQuerySchema.safeParse(query).success).toBe(false);
    }
  });

  it('rejects any other query param, so nothing about her health is filtered by URL', () => {
    expect(trendsQuerySchema.safeParse({ today: '2026-10-09', symptom: 'cramps' }).success).toBe(
      false,
    );
  });
});

describe('GET /trends is behind requireAuth', () => {
  let server: Server;
  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = createApp().listen(0, resolve);
    });
  });
  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('rejects an anonymous request before reading the query', async () => {
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}/trends`);
    expect(res.status).toBe(401);
  });
});
