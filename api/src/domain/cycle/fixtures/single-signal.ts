import { CLEAN_LENGTH, CLEAN_ROWS } from './clean';
import { logsFrom, type Fixture, type Row } from './types';

/** A mucus-only tracker: no temperatures at all → 'no_temp_data', never 'anovulatory'. */
export const mucusOnly: Fixture = {
  name: 'mucus-only tracker',
  input: {
    logs: logsFrom(CLEAN_ROWS.map((row): Row => [row[0], null, row[2], row[3]])),
    cycleLength: CLEAN_LENGTH,
  },
  expected: {
    coverlineF: null,
    ovulationDay: null,
    peakDay: 14,
    peakConfirmedOnDay: 16,
    isAnovulatory: false,
    confidence: 'none',
    flags: ['no_temp_data'],
  },
};

/** A temperature-only tracker: the shift confirms, but with no mucus there is no peak and no dip. */
export const tempOnly: Fixture = {
  name: 'temp-only tracker',
  input: {
    logs: logsFrom(CLEAN_ROWS.map((row): Row => [row[0], row[1], undefined, row[3], row[4]])),
    cycleLength: CLEAN_LENGTH,
  },
  expected: {
    coverlineF: 97.6,
    dipDay: null,
    ovulationDay: 16,
    peakDay: null,
    lutealLength: 14,
    confidence: 'reduced',
    flags: ['no_mucus_data'],
  },
};
