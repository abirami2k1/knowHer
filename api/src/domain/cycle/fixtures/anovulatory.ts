import { logsFrom, type Fixture, type Row } from './types';

/**
 * 4.3.1 — a 35-day closed cycle of 97.2–97.6 noise. A 97.6 sits inside every
 * 6-reading window, so the line is always ≥ 97.7 and nothing ever clears it.
 * Mucus never reaches egg-white. Expected: calm anovulatory, no throw.
 */
const PATTERN = [97.4, 97.6, 97.3, 97.5, 97.2, 97.6, 97.4];
const MUCUS = ['dry', 'sticky', 'watery', 'sticky', 'dry'] as const;

const rows: Row[] = Array.from({ length: 35 }, (_, i) => {
  const day = i + 1;
  return [
    day,
    PATTERN[i % PATTERN.length]!,
    MUCUS[i % MUCUS.length],
    day <= 4 ? 'medium' : undefined,
  ];
});

export const anovulatory: Fixture = {
  name: 'anovulatory',
  input: { logs: logsFrom(rows), cycleLength: 35 },
  expected: {
    coverlineF: null,
    coverlineWindowDays: [],
    ovulationDay: null,
    shiftConfirmedOnDay: null,
    peakDay: null,
    lutealLength: null,
    isAnovulatory: true,
    confidence: 'none',
    flags: ['anovulatory'],
  },
};
