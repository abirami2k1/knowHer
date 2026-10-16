import { describe, expect, it } from 'vitest';
import { isNudgeTime, isTimeZone, localClock, nudgeDecision } from './nudge-schedule';

/** 2026-10-15 14:34 UTC — a fixed instant, so these cases never depend on when they run. */
const NOW = new Date('2026-10-15T14:34:00Z');

describe('isNudgeTime', () => {
  it('accepts a 24-hour local time', () => {
    for (const time of ['00:00', '09:05', '20:00', '23:59']) expect(isNudgeTime(time)).toBe(true);
  });

  it('rejects anything else', () => {
    for (const time of ['24:00', '8:00', '20:60', '20:00:00', '8pm', '']) {
      expect(isNudgeTime(time)).toBe(false);
    }
  });
});

describe('isTimeZone', () => {
  it('accepts IANA zones and rejects invented ones', () => {
    expect(isTimeZone('Asia/Kolkata')).toBe(true);
    expect(isTimeZone('UTC')).toBe(true);
    expect(isTimeZone('Mars/Olympus')).toBe(false);
  });
});

describe('localClock', () => {
  it('reads the clock where she is, not where the server is', () => {
    expect(localClock(NOW, 'UTC')).toEqual({ date: '2026-10-15', time: '14:34' });
    // +05:30 — the half-hour offset catches a minutes bug a whole-hour zone would hide.
    expect(localClock(NOW, 'Asia/Kolkata')).toEqual({ date: '2026-10-15', time: '20:04' });
  });

  it('crosses the date line into the next day', () => {
    expect(localClock(new Date('2026-10-15T19:30:00Z'), 'Asia/Kolkata')).toEqual({
      date: '2026-10-16',
      time: '01:00',
    });
  });

  it('crosses back into the previous day', () => {
    expect(localClock(new Date('2026-10-15T02:00:00Z'), 'America/Los_Angeles')).toEqual({
      date: '2026-10-14',
      time: '19:00',
    });
  });

  it('returns null for a zone this runtime cannot convert', () => {
    expect(localClock(NOW, 'Mars/Olympus')).toBeNull();
  });
});

describe('nudgeDecision', () => {
  const base = { nudgeTime: '20:00', timeZone: 'Asia/Kolkata', lastNudgedOn: null };

  it('is due once her own clock reaches the time she chose', () => {
    // 14:34 UTC is 20:04 in Kolkata — past 20:00, inside the catch-up window.
    expect(nudgeDecision(base, NOW)).toEqual({ due: true, localDate: '2026-10-15' });
  });

  it('is not due before her time, even when the server is well past it', () => {
    expect(nudgeDecision({ ...base, nudgeTime: '21:00' }, NOW).due).toBe(false);
  });

  it('is not due again on a day this device already had', () => {
    expect(nudgeDecision({ ...base, lastNudgedOn: '2026-10-15' }, NOW)).toEqual({
      due: false,
      localDate: '2026-10-15',
    });
  });

  it('is due again the next day', () => {
    expect(nudgeDecision({ ...base, lastNudgedOn: '2026-10-14' }, NOW).due).toBe(true);
  });

  it('catches up after a short outage but not a long one', () => {
    const late = new Date('2026-10-15T14:39:00Z'); // 20:09 local — 9 minutes late
    const tooLate = new Date('2026-10-15T15:00:00Z'); // 20:30 local
    expect(nudgeDecision(base, late).due).toBe(true);
    expect(nudgeDecision(base, tooLate).due).toBe(false);
  });

  it('still means 20:00 to her across a DST change', () => {
    // London is UTC+1 in July and UTC+0 in December; 20:00 local is both times due.
    const summer = new Date('2026-07-15T19:00:00Z');
    const winter = new Date('2026-12-15T20:00:00Z');
    const london = { ...base, timeZone: 'Europe/London' };
    expect(nudgeDecision(london, summer).due).toBe(true);
    expect(nudgeDecision(london, winter).due).toBe(true);
    // And an hour either side of the switch is not.
    expect(nudgeDecision(london, new Date('2026-12-15T19:00:00Z')).due).toBe(false);
  });

  it('never fires on a row it cannot make sense of', () => {
    expect(nudgeDecision({ ...base, timeZone: 'Mars/Olympus' }, NOW).due).toBe(false);
    expect(nudgeDecision({ ...base, nudgeTime: 'evening' }, NOW).due).toBe(false);
  });
});
