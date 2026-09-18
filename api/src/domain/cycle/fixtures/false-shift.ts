import { CLEAN_LENGTH, CLEAN_ROWS } from './clean';
import { logsFrom, type Fixture, type Row } from './types';

/**
 * 4.3.4 — days 12–13 poke above the early line (97.6) and day 14 falls back, so
 * that run is invalidated. Those two highs then sit inside the window before day
 * 17, lifting the line to 97.8; the real rise (97.9, 97.9, 98.1) still clears it.
 */
const OVERRIDES: Record<number, number> = { 12: 97.7, 13: 97.7, 17: 97.9, 18: 97.9, 19: 98.1 };
const rows: Row[] = CLEAN_ROWS.map((row) =>
  OVERRIDES[row[0]] !== undefined ? [row[0], OVERRIDES[row[0]]!, row[2], row[3], row[4]] : row,
);

export const falseShift: Fixture = {
  name: 'false-shift',
  input: { logs: logsFrom(rows), cycleLength: CLEAN_LENGTH },
  expected: {
    coverlineF: 97.8,
    coverlineWindowDays: [11, 12, 13, 14, 15, 16],
    dipDay: 14,
    ovulationDay: 16,
    shiftConfirmedOnDay: 19,
    peakDay: 14,
    lutealLength: 14,
    isAnovulatory: false,
    confidence: 'full',
    flags: ['false_shift_invalidated'],
  },
};
