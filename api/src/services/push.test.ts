import { describe, expect, it } from 'vitest';
import type { PushSubscription } from '../generated/prisma/client';
import type { PushOutcome, PushSender } from '../lib/push';
import { NUDGE_COPY, sendDueNudges, type SweepDeps } from './push';

const NOW = new Date('2026-10-15T14:34:00Z'); // 20:04 in Kolkata

function device(overrides: Partial<PushSubscription> = {}): PushSubscription {
  return {
    id: 'dev1',
    userId: 'u1',
    endpoint: 'https://push.example/dev1',
    p256dh: 'key',
    auth: 'auth',
    nudgeTime: '20:00',
    timeZone: 'Asia/Kolkata',
    lastNudgedOn: null,
    failures: 0,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

/** Records what the sweep did, in order, so the ordering itself can be asserted. */
function harness(devices: PushSubscription[], outcome: PushOutcome | PushOutcome[]) {
  const outcomes = Array.isArray(outcome) ? [...outcome] : null;
  const steps: string[] = [];
  const payloads: string[] = [];

  const sender: PushSender = {
    send: async (target, payload) => {
      payloads.push(payload);
      steps.push(`send:${target.endpoint}`);
      return outcomes ? (outcomes.shift() ?? 'sent') : (outcome as PushOutcome);
    },
  };

  const deps: SweepDeps = {
    sender,
    load: async () => devices,
    markSent: async (id, localDate) => void steps.push(`sent:${id}:${localDate}`),
    markFailed: async (id) => void steps.push(`failed:${id}`),
    drop: async (id) => void steps.push(`drop:${id}`),
  };

  return { deps, steps, payloads };
}

describe('sendDueNudges', () => {
  it('sends to a device whose local time has come, and records her local date', async () => {
    const { deps, steps, payloads } = harness([device()], 'sent');
    const result = await sendDueNudges(NOW, deps);

    expect(result).toEqual({ considered: 1, sent: 1, failed: 0, dropped: 0 });
    expect(steps).toEqual(['send:https://push.example/dev1', 'sent:dev1:2026-10-15']);
    expect(payloads).toEqual([JSON.stringify(NUDGE_COPY)]);
  });

  it('leaves a device alone until her own clock reaches her time', async () => {
    const { deps, steps } = harness([device({ nudgeTime: '22:00' })], 'sent');
    const result = await sendDueNudges(NOW, deps);

    expect(result.sent).toBe(0);
    expect(steps).toEqual([]);
  });

  it('cannot nudge the same device twice in one of her days', async () => {
    const { deps, steps } = harness(
      [device({ lastNudgedOn: new Date('2026-10-15T00:00:00Z') })],
      'sent',
    );
    await sendDueNudges(NOW, deps);
    expect(steps).toEqual([]);
  });

  it('drops a device the push service says is gone', async () => {
    const { deps, steps } = harness([device()], 'gone');
    const result = await sendDueNudges(NOW, deps);

    expect(result).toEqual({ considered: 1, sent: 0, failed: 0, dropped: 1 });
    expect(steps).toContain('drop:dev1');
  });

  it('counts a soft failure and keeps the device for tomorrow', async () => {
    const { deps, steps } = harness([device({ failures: 1 })], 'failed');
    const result = await sendDueNudges(NOW, deps);

    expect(result).toEqual({ considered: 1, sent: 0, failed: 1, dropped: 0 });
    expect(steps).toContain('failed:dev1');
  });

  it('gives up on a device that has failed every day for a week', async () => {
    const { deps, steps } = harness([device({ failures: 4 })], 'failed');
    const result = await sendDueNudges(NOW, deps);

    expect(result.dropped).toBe(1);
    expect(steps).toContain('drop:dev1');
  });

  it('carries on past a failing device to the ones behind it', async () => {
    const devices = [
      device({ id: 'a', endpoint: 'https://push.example/a' }),
      device({ id: 'b', endpoint: 'https://push.example/b' }),
    ];
    const { deps } = harness(devices, ['failed', 'sent']);
    const result = await sendDueNudges(NOW, deps);

    expect(result).toEqual({ considered: 2, sent: 1, failed: 1, dropped: 0 });
  });
});

describe('the nudge itself', () => {
  it('says nothing about her cycle, her body or her dates', () => {
    const words = `${NUDGE_COPY.title} ${NUDGE_COPY.body}`.toLowerCase();
    for (const leak of [
      'period',
      'cycle',
      'ovulat',
      'fertile',
      'luteal',
      'follicular',
      'bbt',
      'temperature',
      'mucus',
      'bleed',
      'flow',
      'symptom',
      'day ',
      'pcod',
    ]) {
      expect(
        words,
        `the nudge must not mention "${leak}" — it lands on a lock screen`,
      ).not.toContain(leak);
    }
  });
});
