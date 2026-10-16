/**
 * When a device is due its daily nudge. Pure: no clock of its own, no database —
 * `now` is always passed in, so every case below is testable without waiting.
 *
 * The nudge is the one feature that must think in wall-clock time. Everywhere
 * else knowHer stores a plain local calendar date chosen by the client (D1);
 * here the server has to decide, unprompted, that it is 20:00 where she is. So
 * each device carries its own IANA zone, and the sweep converts rather than
 * assuming the server's own timezone means anything.
 */

import type { CalendarDate } from './dates';

/** Minutes after her chosen time that a nudge may still be sent. */
export const NUDGE_CATCH_UP_MINUTES = 10;

const TIME_SHAPE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isNudgeTime(value: string): boolean {
  return TIME_SHAPE.test(value);
}

/** True only for a zone this runtime can actually convert into. */
export function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export interface LocalClock {
  /** The calendar date it is in that zone, 'YYYY-MM-DD'. */
  date: CalendarDate;
  /** The wall-clock time in that zone, 'HH:mm'. */
  time: string;
}

/**
 * What her clock reads at this instant. Returns null for a zone the runtime
 * does not know, so one bad row can never stop the sweep.
 */
export function localClock(now: Date, timeZone: string): LocalClock | null {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(now);
  } catch {
    return null;
  }

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? '';

  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    time: `${part('hour')}:${part('minute')}`,
  };
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

export interface NudgeWindow {
  nudgeTime: string;
  timeZone: string;
  /** Local date of the last nudge sent to this device, or null if never. */
  lastNudgedOn: CalendarDate | null;
}

export interface NudgeDecision {
  due: boolean;
  /** Her local date, so the caller can record what it just sent on. */
  localDate: CalendarDate | null;
}

/**
 * Due when her clock has passed the time she chose, by no more than the
 * catch-up window, and this device has not already been nudged today.
 *
 * The window is what makes a restart survivable: a sweep that misses 20:00
 * still fires at 20:04. It is deliberately short — being nudged at 3am because
 * the API was down all evening would be worse than not being nudged at all.
 */
export function nudgeDecision(
  window: NudgeWindow,
  now: Date,
  catchUpMinutes = NUDGE_CATCH_UP_MINUTES,
): NudgeDecision {
  const clock = localClock(now, window.timeZone);
  if (!clock || !isNudgeTime(window.nudgeTime)) return { due: false, localDate: null };
  if (clock.date === window.lastNudgedOn) return { due: false, localDate: clock.date };

  const elapsed = toMinutes(clock.time) - toMinutes(window.nudgeTime);
  return { due: elapsed >= 0 && elapsed <= catchUpMinutes, localDate: clock.date };
}
