import { CLEAN_ROWS } from './clean';
import { logsFrom, type Fixture } from './types';

/**
 * 4.3.6 — the clean cycle seen live. Nothing provisional is ever exposed:
 * on day 18 the rise has begun but is unconfirmed; on day 15 even the peak waits.
 */
export const livePendingDay18: Fixture = {
  name: 'live-pending: day 18 (rise begun, unconfirmed)',
  input: { logs: logsFrom(CLEAN_ROWS), todayCycleDay: 18 },
  expected: {
    coverlineF: null,
    ovulationDay: null,
    shiftConfirmedOnDay: null,
    peakDay: 14,
    lutealLength: null,
    lutealDayToday: null,
    isAnovulatory: false,
    confidence: 'none',
    flags: ['shift_pending'],
  },
};

export const livePendingDay15: Fixture = {
  name: 'live-pending: day 15 (peak not yet confirmable)',
  input: { logs: logsFrom(CLEAN_ROWS), todayCycleDay: 15 },
  expected: {
    coverlineF: null,
    ovulationDay: null,
    peakDay: null,
    flags: ['shift_pending', 'peak_pending'],
  },
};

/** Backfill safety: logs dated after "today" are ignored even if present. */
export const liveConfirmed: Fixture = {
  name: 'live: day 22 after confirmation',
  input: { logs: logsFrom(CLEAN_ROWS), todayCycleDay: 22 },
  expected: {
    coverlineF: 97.6,
    ovulationDay: 16,
    shiftConfirmedOnDay: 19,
    lutealDayToday: 6,
    lutealLength: null,
    confidence: 'full',
    flags: [],
  },
};
