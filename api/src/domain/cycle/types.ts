/**
 * Types for the cycle rule engine. The engine is pure: (logs, rules) → assessment.
 * Nothing here knows about Prisma, Express, or the clock.
 */

export type Mucus = 'dry' | 'sticky' | 'watery' | 'eggwhite';
export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export interface CycleLog {
  /** 1-based; the service derives it from date − cycle.startDate. */
  cycleDay: number;
  /** YYYY-MM-DD, carried through for the UI; the engine never parses it. */
  date: string;
  /** Plain number, ≤ 2 decimals (the service converts Prisma.Decimal). */
  bbtF?: number;
  isDisturbed: boolean;
  cervicalMucus?: Mucus;
  flow?: FlowLevel;
}

export interface CycleInput {
  logs: CycleLog[];
  /** Present only for closed cycles: endDate − startDate + 1. */
  cycleLength?: number;
  /** Live cycles only; logs beyond it are ignored (backfill safety). */
  todayCycleDay?: number;
}

export type Flag =
  | 'low_data' // fewer than minValidTemps usable readings
  | 'no_temp_data' // user logs no BBT at all (mucus-only tracker)
  | 'no_mucus_data' // user logs no mucus at all (temp-only tracker)
  | 'disturbed_excluded' // a disturbed reading fell inside the window or the confirming run
  | 'false_shift_invalidated' // a rise crossed the candidate line then fell back
  | 'shift_pending' // live cycle: not enough post-rise readings yet
  | 'peak_pending' // live cycle: egg-white seen, confirmation days not logged yet
  | 'signal_disagreement' // peak and thermal-shift ovulation differ beyond tolerance
  | 'anovulatory'; // closed cycle, enough data, no confirmed shift

export type Confidence = 'full' | 'reduced' | 'none';

/** Dashboard phases (resolved in Task 8); named here so copy keys can exist. */
export type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown';
export type FallbackReason = 'irregular' | 'long' | 'no_history';

export interface ChartPoint {
  cycleDay: number;
  bbtF: number | null;
  isDisturbed: boolean;
  /** Disturbed (when excludeDisturbed) or early-cycle exclusion. */
  excludedFromRules: boolean;
  /** null while there is no coverline. */
  aboveCoverline: boolean | null;
  /** The "Temp Count" row: 1..consecutiveRises on the confirming run. */
  tempCount: number | null;
  /** The "Luteal Phase" row. */
  lutealDay: number | null;
  /** The "Peak Day Count" row: 1..peakConfirmDays after peak. */
  peakCount: number | null;
  mucus: Mucus | null;
  flow: FlowLevel | null;
}

/**
 * Structural honesty: ovulationDay, coverlineF and peakDay are non-null ONLY when
 * their confirmation day exists in the logs (and ≤ todayCycleDay when given).
 * There is no "likely" field for the UI to misuse.
 */
export interface CycleAssessment {
  /** null until the shift is confirmed — never provisional. */
  coverlineF: number | null;
  /** Cycle days whose readings formed the window (explainability). */
  coverlineWindowDays: number[];
  /** Lowest reading in the window if it coincides with egg-white/watery mucus. */
  dipDay: number | null;
  /** cycleDay(first high) − 1. */
  ovulationDay: number | null;
  /** cycleDay of the last reading in the confirming run. */
  shiftConfirmedOnDay: number | null;
  peakDay: number | null;
  peakConfirmedOnDay: number | null;
  /** Closed cycles: cycleLength − ovulationDay. */
  lutealLength: number | null;
  /** Live cycles: todayCycleDay − ovulationDay. */
  lutealDayToday: number | null;
  isAnovulatory: boolean;
  confidence: Confidence;
  flags: Flag[];
  series: ChartPoint[];
}
