import { CLEAN_LENGTH, CLEAN_ROWS } from './clean';
import { logsFrom, type Fixture, type Row } from './types';

/**
 * 4.4.3 — proof that the rules are live config. consecutiveRises: 4 on the clean
 * cycle still confirms, one day later. On a variant whose day 20 dips back below
 * the line, four-in-a-row never happens and the cycle reads as anovulatory.
 */
export const configFlipStillConfirms: Fixture = {
  name: 'config-flip: consecutiveRises=4 confirms one day later',
  rules: { consecutiveRises: 4 },
  input: { logs: logsFrom(CLEAN_ROWS), cycleLength: CLEAN_LENGTH },
  expected: { coverlineF: 97.6, ovulationDay: 16, shiftConfirmedOnDay: 20, flags: [] },
};

const dipOnDay20: Row[] = CLEAN_ROWS.map((row) => (row[0] === 20 ? [20, 97.5] : row));

export const configFlipBreaks: Fixture = {
  name: 'config-flip: consecutiveRises=4 with a day-20 dip does not confirm',
  rules: { consecutiveRises: 4 },
  input: { logs: logsFrom(dipOnDay20), cycleLength: CLEAN_LENGTH },
  expected: {
    ovulationDay: null,
    isAnovulatory: true,
    flags: ['false_shift_invalidated', 'anovulatory'],
  },
};

/** Same variant under the default rule confirms normally — the flip alone changes the verdict. */
export const configFlipControl: Fixture = {
  name: 'config-flip: control — same variant confirms with consecutiveRises=3',
  input: { logs: logsFrom(dipOnDay20), cycleLength: CLEAN_LENGTH },
  expected: { ovulationDay: 16, shiftConfirmedOnDay: 19, isAnovulatory: false },
};
