import { CLEAN_LENGTH, CLEAN_ROWS } from './clean';
import { logsFrom, type Fixture, type Row } from './types';

/**
 * 4.3.5 — mucus peaks on day 10 (confirmed by days 11–12) while temperatures put
 * ovulation on day 16. Six days apart, beyond the 2-day tolerance → both signals
 * are reported, confidence reduced. Day 14 keeps its dip (watery counts for that).
 */
const MUCUS: Record<number, Row[2]> = { 10: 'eggwhite', 14: 'watery' };
const rows: Row[] = CLEAN_ROWS.map((row) =>
  MUCUS[row[0]] ? [row[0], row[1], MUCUS[row[0]], row[3], row[4]] : row,
);

export const disagreement: Fixture = {
  name: 'disagreement',
  input: { logs: logsFrom(rows), cycleLength: CLEAN_LENGTH },
  expected: {
    coverlineF: 97.6,
    dipDay: 14,
    ovulationDay: 16,
    shiftConfirmedOnDay: 19,
    peakDay: 10,
    peakConfirmedOnDay: 12,
    lutealLength: 14,
    confidence: 'reduced',
    flags: ['signal_disagreement'],
  },
};
