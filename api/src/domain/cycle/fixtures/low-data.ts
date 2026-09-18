import { logsFrom, type Fixture } from './types';

/**
 * 4.3.2 — three readings in a closed 28-day cycle: below minValidTemps, so no
 * coverline and 'low_data' (NOT anovulatory — we couldn't tell). Mucus is an
 * independent signal, so the peak is still found.
 */
export const lowData: Fixture = {
  name: 'low-data',
  input: {
    logs: logsFrom([
      [1, null, undefined, 'medium'],
      [5, 97.3, 'dry'],
      [9, 97.4, 'sticky'],
      [12, null, 'watery'],
      [13, null, 'eggwhite'],
      [14, null, 'sticky'],
      [15, null, 'dry'],
      [20, 98.0, 'dry'],
    ]),
    cycleLength: 28,
  },
  expected: {
    coverlineF: null,
    ovulationDay: null,
    peakDay: 13,
    peakConfirmedOnDay: 15,
    lutealLength: null,
    isAnovulatory: false,
    confidence: 'none',
    flags: ['low_data'],
  },
};
