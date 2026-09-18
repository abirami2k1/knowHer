import { logsFrom, type Fixture, type Row } from './types';

/**
 * The 0.01 °F boundary. Window max is 97.65 (days 1–6). With the grid snap off the
 * line is 97.75: a 97.75 reading is NOT above it, 97.76 is. With the snap on, the
 * window max rounds to 97.7 and the line is 97.8. No mucus is logged, so every
 * variant also carries 'no_mucus_data'. Closed 12-day cycles keep the maths short.
 */
const WINDOW: Row[] = [
  [1, 97.55],
  [2, 97.6],
  [3, 97.65],
  [4, 97.5],
  [5, 97.62],
  [6, 97.58],
];

const withRise = (day7: number, day8: number, day9: number): Row[] => [
  ...WINDOW,
  [7, day7],
  [8, day8],
  [9, day9],
  [10, 97.9],
  [11, 97.9],
  [12, 97.4],
];

export const decimalOnLine: Fixture = {
  name: 'decimal-boundary: exactly on the line is not above',
  rules: { coverlineOnGrid: false },
  input: { logs: logsFrom(withRise(97.75, 97.8, 97.85)), cycleLength: 12 },
  expected: {
    coverlineF: null,
    ovulationDay: null,
    isAnovulatory: true,
    flags: ['no_mucus_data', 'anovulatory'],
  },
};

export const decimalAbove: Fixture = {
  name: 'decimal-boundary: 0.01 above the line counts',
  rules: { coverlineOnGrid: false },
  input: { logs: logsFrom(withRise(97.76, 97.9, 97.95)), cycleLength: 12 },
  expected: {
    coverlineF: 97.75,
    coverlineWindowDays: [1, 2, 3, 4, 5, 6],
    ovulationDay: 6,
    shiftConfirmedOnDay: 9,
    lutealLength: 6,
    confidence: 'reduced',
    flags: ['no_mucus_data'],
  },
};

export const decimalGrid: Fixture = {
  name: 'decimal-boundary: grid snap draws the line at 97.8',
  input: { logs: logsFrom(withRise(97.81, 97.9, 97.95)), cycleLength: 12 },
  expected: { coverlineF: 97.8, ovulationDay: 6, shiftConfirmedOnDay: 9, flags: ['no_mucus_data'] },
};
