import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, isCalendarDate, toDbDate, toIsoDate } from './dates';

describe('isCalendarDate', () => {
  it('accepts a real date', () => {
    expect(isCalendarDate('2026-09-24')).toBe(true);
    expect(isCalendarDate('2024-02-29')).toBe(true); // leap year
  });

  it('rejects a bad shape', () => {
    for (const value of ['2026-9-24', '24-09-2026', '2026-09-24T00:00:00Z', '', 'today']) {
      expect(isCalendarDate(value)).toBe(false);
    }
  });

  it('rejects a date that does not exist', () => {
    for (const value of ['2026-02-30', '2026-13-01', '2026-00-10', '2025-02-29']) {
      expect(isCalendarDate(value)).toBe(false);
    }
  });
});

describe('round-tripping through an @db.Date carrier', () => {
  it('returns the same calendar day it was given', () => {
    for (const value of ['2026-01-01', '2026-06-30', '2026-12-31']) {
      expect(toIsoDate(toDbDate(value))).toBe(value);
    }
  });

  it('carries the date as UTC midnight, so no local offset can shift the day', () => {
    const carried = toDbDate('2026-09-24');
    expect(carried.toISOString()).toBe('2026-09-24T00:00:00.000Z');
  });
});

describe('daysBetween / addDays', () => {
  it('counts whole calendar days in both directions', () => {
    expect(daysBetween('2026-09-01', '2026-09-08')).toBe(7);
    expect(daysBetween('2026-09-08', '2026-09-01')).toBe(-7);
    expect(daysBetween('2026-09-08', '2026-09-08')).toBe(0);
  });

  it('crosses month and year boundaries', () => {
    expect(addDays('2026-09-28', 5)).toBe('2026-10-03');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(daysBetween('2026-02-27', '2026-03-02')).toBe(3); // 2026 is not a leap year
    expect(daysBetween('2024-02-27', '2024-03-02')).toBe(4); // 2024 is
  });

  it('is unaffected by daylight-saving transitions', () => {
    // US DST ends 2026-11-01; a local-midnight implementation would return 0 or 2 here.
    expect(daysBetween('2026-10-31', '2026-11-01')).toBe(1);
    expect(addDays('2026-03-07', 1)).toBe('2026-03-08'); // DST begins
  });
});
