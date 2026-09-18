import { describe, expect, it } from 'vitest';
import { assessCycle } from './assess';
import { CLEAN_LENGTH, CLEAN_ROWS, clean } from './fixtures/clean';
import { logsFrom } from './fixtures/types';
import { computeCoverline } from './shift';

/** The clean cycle as a live cycle seen on `today`. */
const liveAt = (today: number) => ({ logs: logsFrom(CLEAN_ROWS), todayCycleDay: today });

describe('engine invariants (clean cycle)', () => {
  it('is deterministic and independent of log order', () => {
    const a = assessCycle(clean.input);
    const shuffled = { ...clean.input, logs: [...clean.input.logs].reverse() };
    expect(assessCycle(shuffled)).toEqual(a);
    expect(assessCycle(clean.input)).toEqual(a);
  });

  it('never exposes ovulation before the confirmation day, then never changes it', () => {
    for (let today = 1; today <= CLEAN_LENGTH; today++) {
      const result = assessCycle(liveAt(today));
      if (today < 19) {
        expect(result.ovulationDay, `day ${today}`).toBeNull();
        expect(result.coverlineF, `day ${today}`).toBeNull();
      } else {
        expect(result.ovulationDay, `day ${today}`).toBe(16);
        expect(result.coverlineF, `day ${today}`).toBe(97.6);
      }
    }
  });

  it('never exposes peak day before its confirmation day, then never changes it', () => {
    for (let today = 1; today <= CLEAN_LENGTH; today++) {
      const result = assessCycle(liveAt(today));
      expect(result.peakDay, `day ${today}`).toBe(today < 16 ? null : 14);
    }
  });

  it('reports pending states honestly on a live cycle', () => {
    expect(assessCycle(liveAt(18))).toMatchObject({
      coverlineF: null,
      ovulationDay: null,
      peakDay: 14,
      flags: ['shift_pending'],
      confidence: 'none',
    });
    expect(assessCycle(liveAt(15))).toMatchObject({
      peakDay: null,
      flags: ['shift_pending', 'peak_pending'],
    });
    expect(assessCycle(liveAt(22))).toMatchObject({ ovulationDay: 16, lutealDayToday: 6 });
  });

  it("fills Sivi's chart rows in the series", () => {
    const { series } = assessCycle(clean.input);
    const row = (day: number) => series[day - 1]!;
    expect(series).toHaveLength(CLEAN_LENGTH);
    expect([17, 18, 19].map((d) => row(d).tempCount)).toEqual([1, 2, 3]);
    expect(row(16).tempCount).toBeNull();
    expect(row(17).lutealDay).toBe(1);
    expect(row(30).lutealDay).toBe(14);
    expect(row(16).lutealDay).toBeNull();
    expect([15, 16].map((d) => row(d).peakCount)).toEqual([1, 2]);
    expect(row(10).bbtF).toBeNull();
    expect(row(28).isDisturbed).toBe(true);
    expect(row(28).excludedFromRules).toBe(true);
    expect(row(17).aboveCoverline).toBe(true);
    expect(row(16).aboveCoverline).toBe(false);
  });

  it('computeCoverline exposes the confirmed line and its window', () => {
    expect(computeCoverline(clean.input)).toEqual({
      coverlineF: 97.6,
      windowDays: [11, 12, 13, 14, 15, 16],
    });
    expect(computeCoverline(liveAt(18))).toBeNull();
  });
});
