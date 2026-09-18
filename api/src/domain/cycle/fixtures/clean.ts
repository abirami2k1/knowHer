import { logsFrom, type Fixture, type Row } from './types';

/**
 * The `clean` fixture from cycle-engine-plan.md §7. Synthetic: modelled on the
 * *shape* of Sivi's workbook sample (one blank day, dip on the egg-white day, first
 * high three days later, a disturbed luteal reading) with different numbers, so
 * nothing from her workbook is republished. Expectations traced by hand in §7.
 * Awaiting Sivi's sign-off at 4.4.0.
 */
export const CLEAN_ROWS: Row[] = [
  [1, 97.2, undefined, 'medium'],
  [2, 97.4, undefined, 'medium'],
  [3, 97.3, undefined, 'light'],
  [4, 97.2, 'dry'],
  [5, 97.2, 'dry'],
  [6, 97.5, 'dry'],
  [7, 97.4, 'dry', 'spotting'],
  [8, 97.2, 'sticky'],
  [9, 97.2, 'sticky'],
  [10, null, 'sticky'], // blank temperature day
  [11, 97.3, 'sticky'],
  [12, 97.3, 'sticky'],
  [13, 97.4, 'watery'],
  [14, 97.2, 'eggwhite'], // the dip, on the single egg-white day → peak day
  [15, 97.3, 'sticky'],
  [16, 97.5, 'sticky'],
  [17, 97.8, 'sticky'], // first high → luteal day 1
  [18, 97.7, 'dry'],
  [19, 98.0, 'dry'], // shift confirmed
  [20, 98.0],
  [21, 97.9],
  [22, 97.9],
  [23, 98.1, 'sticky'],
  [24, 98.0, 'watery'],
  [25, 98.3, 'watery'],
  [26, 98.0, 'watery'],
  [27, 98.4, 'watery'],
  [28, 98.4, 'watery', undefined, true], // disturbed, outside the rules' span → no flag
  [29, 98.4, 'watery'],
  [30, 97.9, undefined, 'spotting'],
];

export const CLEAN_LENGTH = 30;

export const clean: Fixture = {
  name: 'clean',
  input: { logs: logsFrom(CLEAN_ROWS), cycleLength: CLEAN_LENGTH },
  expected: {
    coverlineF: 97.6,
    coverlineWindowDays: [11, 12, 13, 14, 15, 16],
    dipDay: 14,
    ovulationDay: 16,
    shiftConfirmedOnDay: 19,
    peakDay: 14,
    peakConfirmedOnDay: 16,
    lutealLength: 14,
    lutealDayToday: null,
    isAnovulatory: false,
    confidence: 'full',
    flags: [],
  },
};
