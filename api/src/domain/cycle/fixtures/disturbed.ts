import { CLEAN_LENGTH, CLEAN_ROWS } from './clean';
import { logsFrom, type Fixture, type Row } from './types';

/**
 * 4.3.3 — the clean cycle with a 98.1 fever reading marked unusual. One data
 * shape, three lessons.
 */
const withFeverOn = (day: number): Row[] =>
  CLEAN_ROWS.map((row) => (row[0] === day ? [day, 98.1, row[2], row[3], true] : row));

/**
 * Fever on day 12, excluded (default rules): the window reaches back one reading
 * (day 9), the line and the verdict are unchanged, confidence drops one tier.
 * Days 9 and 14 now tie for the window minimum, so no unique dip is named.
 */
export const disturbed: Fixture = {
  name: 'disturbed: fever day 12 excluded → same verdict, reduced confidence',
  input: { logs: logsFrom(withFeverOn(12)), cycleLength: CLEAN_LENGTH },
  expected: {
    coverlineF: 97.6,
    coverlineWindowDays: [9, 11, 13, 14, 15, 16],
    dipDay: null,
    ovulationDay: 16,
    shiftConfirmedOnDay: 19,
    peakDay: 14,
    lutealLength: 14,
    isAnovulatory: false,
    confidence: 'reduced',
    flags: ['disturbed_excluded'],
  },
};

/** excludeDisturbed: false — the fever counts as real, lifts every line after it, and no shift survives. */
export const disturbedIncluded: Fixture = {
  name: 'disturbed: fever day 12 included (excludeDisturbed=false) → no shift',
  rules: { excludeDisturbed: false },
  input: { logs: logsFrom(withFeverOn(12)), cycleLength: CLEAN_LENGTH },
  expected: {
    coverlineF: null,
    ovulationDay: null,
    peakDay: 14,
    isAnovulatory: true,
    confidence: 'none',
    flags: ['false_shift_invalidated', 'anovulatory'],
  },
};

/**
 * Fever on day 13, excluded. Day 13's clean reading (97.4) was the window maximum
 * before day 16; without it the window before day 16 tops out at 97.3, the line
 * drops to 97.4, and day 16's 97.5 now starts the run. Ovulation reads as day 15,
 * one day earlier than the clean cycle. This is what "the window is six *readings*"
 * implies when a reading is excluded — engine-plan questions Q2 and Q9 for Sivi.
 */
export const disturbedMovesWindow: Fixture = {
  name: 'disturbed: fever day 13 excluded → window reaches back, verdict moves a day',
  input: { logs: logsFrom(withFeverOn(13)), cycleLength: CLEAN_LENGTH },
  expected: {
    coverlineF: 97.4,
    coverlineWindowDays: [8, 9, 11, 12, 14, 15],
    ovulationDay: 15,
    shiftConfirmedOnDay: 18,
    peakDay: 14,
    lutealLength: 15,
    confidence: 'reduced',
    flags: ['disturbed_excluded'],
  },
};
