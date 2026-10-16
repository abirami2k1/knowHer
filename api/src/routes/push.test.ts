import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { removePushSubscriptionSchema, savePushSubscriptionSchema } from '../schemas/push';

const VALID = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
  p256dh: 'BPublicKeyMaterial',
  auth: 'authSecret',
  nudgeTime: '20:00',
  timeZone: 'Asia/Kolkata',
};

describe('savePushSubscriptionSchema', () => {
  it('accepts what a browser actually hands over', () => {
    expect(savePushSubscriptionSchema.safeParse(VALID).success).toBe(true);
  });

  it('rejects a time or zone it cannot act on', () => {
    expect(savePushSubscriptionSchema.safeParse({ ...VALID, nudgeTime: '8pm' }).success).toBe(
      false,
    );
    expect(savePushSubscriptionSchema.safeParse({ ...VALID, nudgeTime: '24:00' }).success).toBe(
      false,
    );
    expect(
      savePushSubscriptionSchema.safeParse({ ...VALID, timeZone: 'Mars/Olympus' }).success,
    ).toBe(false);
  });

  it('rejects an endpoint that is not a URL', () => {
    expect(savePushSubscriptionSchema.safeParse({ ...VALID, endpoint: 'not-a-url' }).success).toBe(
      false,
    );
  });

  it('refuses fields the client has no business setting', () => {
    expect(savePushSubscriptionSchema.safeParse({ ...VALID, userId: 'someone-else' }).success).toBe(
      false,
    );
    expect(
      savePushSubscriptionSchema.safeParse({ ...VALID, lastNudgedOn: '2026-10-15' }).success,
    ).toBe(false);
  });
});

describe('removePushSubscriptionSchema', () => {
  it('needs the endpoint and nothing else', () => {
    expect(removePushSubscriptionSchema.safeParse({ endpoint: VALID.endpoint }).success).toBe(true);
    expect(removePushSubscriptionSchema.safeParse({}).success).toBe(false);
  });
});

describe('push routes are behind requireAuth', () => {
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
    ['GET', '/push/key'],
    ['GET', '/push/subscriptions'],
    ['PUT', '/push/subscriptions'],
    ['DELETE', '/push/subscriptions'],
  ])('rejects an anonymous %s %s', async (method, path) => {
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(method !== 'GET' && { body: JSON.stringify(VALID) }),
    });
    expect(res.status).toBe(401);
  });
});
