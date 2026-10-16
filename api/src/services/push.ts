import type { PushPreferenceDto } from '../../../shared/types';
import type { PushSubscription } from '../generated/prisma/client';
import { toDbDate, toIsoDate, type CalendarDate } from '../lib/dates';
import { nudgeDecision } from '../lib/nudge-schedule';
import { prisma } from '../lib/prisma';
import { webPushSender, type PushOutcome, type PushSender } from '../lib/push';
import type { SavePushSubscriptionInput } from '../schemas/push';

/**
 * The nudge's words. A notification lands on a lock screen, where anyone nearby
 * can read it — so it says nothing about her cycle, her phase, her symptoms or
 * her dates. It only opens the door; what is behind it is hers.
 */
export const NUDGE_COPY = {
  title: 'knowHer',
  body: 'A moment for today, whenever suits you.',
  /** Where a tap lands. Carries no data of its own. */
  url: '/log',
} as const;

/** Failures in a row before a device is given up on. */
const MAX_FAILURES = 5;

// ── Opt in / out ─────────────────────────────────────────────────────────────

function toPreferenceDto(row: PushSubscription): PushPreferenceDto {
  return { endpoint: row.endpoint, nudgeTime: row.nudgeTime, timeZone: row.timeZone };
}

/**
 * Opting this browser in, or changing its time. Keyed on the endpoint the
 * browser minted, so saying yes twice on the same device updates one row.
 * Re-subscribing clears any past failures — she just proved the device works.
 */
export async function savePushSubscription(
  userId: string,
  input: SavePushSubscriptionInput,
): Promise<PushPreferenceDto> {
  const { endpoint, p256dh, auth, nudgeTime, timeZone } = input;
  const row = await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId, endpoint, p256dh, auth, nudgeTime, timeZone },
    // userId too: a shared browser can change hands between accounts.
    update: { userId, p256dh, auth, nudgeTime, timeZone, failures: 0 },
  });
  return toPreferenceDto(row);
}

/** Her devices, so Profile can show whether this one is already opted in. */
export async function listPushSubscriptions(userId: string): Promise<PushPreferenceDto[]> {
  const rows = await prisma.pushSubscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map(toPreferenceDto);
}

/**
 * Opting out. Scoped to her own rows, and silent when there is nothing to
 * delete — turning off a nudge that is already off is not an error.
 */
export async function removePushSubscription(userId: string, endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({ where: { userId, endpoint } });
}

// ── The sweep ────────────────────────────────────────────────────────────────

export interface SweepDeps {
  sender: PushSender;
  /** Every opted-in device. Small by construction: one row per browser. */
  load: () => Promise<PushSubscription[]>;
  markSent: (id: string, localDate: CalendarDate) => Promise<void>;
  markFailed: (id: string) => Promise<void>;
  drop: (id: string) => Promise<void>;
}

export interface SweepResult {
  considered: number;
  sent: number;
  failed: number;
  dropped: number;
}

/**
 * One pass: send to every device whose local clock has reached the time she
 * chose. Runs each minute, and is safe to run more often than that — a device
 * is marked with the local date it was nudged on before the next pass sees it,
 * so a double sweep cannot send twice.
 *
 * Devices are handled one at a time rather than in parallel: this is a handful
 * of requests a minute, and a push service that is rate-limiting us deserves
 * patience rather than a burst.
 */
export async function sendDueNudges(now: Date, deps: SweepDeps): Promise<SweepResult> {
  const payload = JSON.stringify(NUDGE_COPY);
  const result: SweepResult = { considered: 0, sent: 0, failed: 0, dropped: 0 };

  for (const device of await deps.load()) {
    const { due, localDate } = nudgeDecision(
      {
        nudgeTime: device.nudgeTime,
        timeZone: device.timeZone,
        lastNudgedOn: device.lastNudgedOn ? toIsoDate(device.lastNudgedOn) : null,
      },
      now,
    );
    if (!due || !localDate) continue;

    result.considered += 1;
    const outcome: PushOutcome = await deps.sender.send(device, payload);
    if (outcome === 'sent') {
      await deps.markSent(device.id, localDate);
      result.sent += 1;
    } else if (outcome === 'gone') {
      await deps.drop(device.id);
      result.dropped += 1;
    } else if (device.failures + 1 >= MAX_FAILURES) {
      // Something is persistently wrong with this device; stop trying every day.
      await deps.drop(device.id);
      result.dropped += 1;
    } else {
      await deps.markFailed(device.id);
      result.failed += 1;
    }
  }

  return result;
}

/** The database-backed dependencies the running API sweeps with. */
export function liveSweepDeps(): SweepDeps {
  return {
    sender: webPushSender(),
    load: () => prisma.pushSubscription.findMany(),
    markSent: async (id, localDate) => {
      await prisma.pushSubscription.update({
        where: { id },
        data: { lastNudgedOn: toDbDate(localDate), failures: 0 },
      });
    },
    markFailed: async (id) => {
      await prisma.pushSubscription.update({ where: { id }, data: { failures: { increment: 1 } } });
    },
    drop: async (id) => {
      await prisma.pushSubscription.delete({ where: { id } });
    },
  };
}
