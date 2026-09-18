/**
 * The ONLY place cycle numbers live. Change a rule = edit here + adjust the fixture that proves it.
 * Every engine function takes `rules: CycleRules = CYCLE_RULES` as its last argument, so tests
 * pass overrides without mutating this object.
 *
 * "← ask Sivi (Qn)" marks the 4.4.0 agenda item (cycle-engine-plan.md §11) that settles the default.
 */
export interface CycleRules {
  // ── Coverline ──────────────────────────────────────────────────────────────
  /** Readings before the anchor that form the window. */
  coverlineWindow: number;
  /** 'readings' skips blank days; 'calendar_days' uses the previous N calendar days. ← ask Sivi (Q2) */
  coverlineWindowUnit: 'readings' | 'calendar_days';
  /** Textbook 3-over-6 anchors on the first high temp; Sivi's prose describes the dip. ← ask Sivi (Q1) */
  coverlineAnchor: 'first_high_temp' | 'dip_with_fertile_mucus';
  /** line = window max + offset (°F). */
  coverlineOffsetF: number;
  /** Snap the window max to 0.1 before adding the offset (she draws on grid lines). */
  coverlineOnGrid: boolean;
  /** Readings on days 1..N never enter the window (0 = off). ← ask Sivi (Q3) */
  excludeEarlyCycleDays: number;

  // ── Thermal shift ──────────────────────────────────────────────────────────
  /** Readings strictly above the line, in a row. */
  consecutiveRises: number;
  /** Below this many usable readings: no coverline, 'low_data'. */
  minValidTemps: number;
  /** Disturbed readings leave the window and cannot start or continue a run. */
  excludeDisturbed: boolean;
  /** A run that fails is discarded and scanning continues. */
  invalidateFalseShift: boolean;

  // ── Peak day ───────────────────────────────────────────────────────────────
  /** Logged non-egg-white days needed after the last egg-white day. ← ask Sivi (Q5) */
  peakConfirmDays: number;

  // ── Corroboration ──────────────────────────────────────────────────────────
  /** |peakDay − ovulationDay| beyond this → 'signal_disagreement'. */
  disagreementToleranceDays: number;

  // ── Estimates (dashboard only, Task 8; never the History calendar) ─────────
  defaultLutealAssumption: number;
  minFollicularDays: number;
  minCyclesForEstimate: number;
  ovulatoryWindowDays: number;
  irregularCvThreshold: number;
  /** today > mean + k·stdev → fallback copy instead of a phase. */
  longCycleStdevMultiplier: number;
}

export const CYCLE_RULES: Readonly<CycleRules> = Object.freeze({
  coverlineWindow: 6,
  coverlineWindowUnit: 'readings',
  coverlineAnchor: 'first_high_temp',
  coverlineOffsetF: 0.1,
  coverlineOnGrid: true,
  excludeEarlyCycleDays: 0,

  consecutiveRises: 3,
  minValidTemps: 4,
  excludeDisturbed: true,
  invalidateFalseShift: true,

  peakConfirmDays: 2,

  disagreementToleranceDays: 2,

  defaultLutealAssumption: 14,
  minFollicularDays: 8,
  minCyclesForEstimate: 2,
  ovulatoryWindowDays: 2,
  irregularCvThreshold: 0.18,
  longCycleStdevMultiplier: 2,
} satisfies CycleRules);

/** Convenience for tests and callers that tweak one rule. */
export function withRules(
  overrides: Partial<CycleRules>,
  base: Readonly<CycleRules> = CYCLE_RULES,
): CycleRules {
  return { ...base, ...overrides };
}
