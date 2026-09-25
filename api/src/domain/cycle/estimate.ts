import { CYCLE_RULES, type CycleRules } from './rules';
import type { FallbackReason } from './types';

/**
 * Estimates and the honest fallback. The dashboard is the only consumer: the
 * History calendar never calls this file, because nothing estimated belongs on
 * a calendar of what actually happened (D4).
 *
 * Nothing here confirms anything. An estimate is a formula over past cycle
 * lengths, always labelled as such by the caller.
 */

export interface CycleStats {
  n: number;
  mean: number;
  /** Sample standard deviation (n − 1); 0 when fewer than two cycles. */
  stdev: number;
  /** Coefficient of variation: stdev / mean. 0 when there is nothing to vary. */
  cv: number;
}

export interface ExpectedOvulation {
  day: number;
  basis: 'history' | 'self_reported';
}

/** Descriptive statistics over completed cycle lengths. */
export function cycleStats(lengths: number[]): CycleStats {
  const n = lengths.length;
  if (n === 0) return { n: 0, mean: 0, stdev: 0, cv: 0 };

  const mean = lengths.reduce((sum, value) => sum + value, 0) / n;
  if (n === 1) return { n, mean, stdev: 0, cv: 0 };

  const variance = lengths.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1);
  const stdev = Math.sqrt(variance);
  return { n, mean, stdev, cv: mean === 0 ? 0 : stdev / mean };
}

/**
 * The cycle day ovulation would be expected on, if this cycle behaves like her
 * others: `avg − defaultLutealAssumption`, floored at `minFollicularDays`.
 *
 * Her own history is preferred once there is enough of it; below that the
 * average she gave at onboarding is used and said to be self-reported. With
 * neither, there is no estimate — and the dashboard says so rather than guessing.
 */
export function expectedOvulationDay(
  input: { stats: CycleStats; selfReportedAvg?: number | null },
  rules: CycleRules = CYCLE_RULES,
): ExpectedOvulation | null {
  const fromHistory = input.stats.n >= rules.minCyclesForEstimate;
  const average = fromHistory ? input.stats.mean : (input.selfReportedAvg ?? null);
  if (average === null) return null;

  const day = Math.max(
    Math.round(average - rules.defaultLutealAssumption),
    rules.minFollicularDays,
  );
  return { day, basis: fromHistory ? 'history' : 'self_reported' };
}

/**
 * When to stop asserting a phase and say something honest instead: her cycles
 * vary too much to place today in one, this cycle has already run past what is
 * usual for her, or there is no cycle to speak of at all.
 *
 * `no_history` means she has no current cycle — not merely that this is her
 * first. A woman on day 2 of her first period is plainly menstruating, and
 * saying otherwise would be a different kind of dishonesty.
 *
 * Returning a reason is not a warning. It is the app declining to pretend.
 */
export function isFallback(
  input: { stats: CycleStats; todayCycleDay?: number; hasCurrentCycle?: boolean },
  rules: CycleRules = CYCLE_RULES,
): FallbackReason | null {
  if (input.hasCurrentCycle === false) return 'no_history';
  if (input.stats.cv > rules.irregularCvThreshold) return 'irregular';

  const enoughToJudgeLength = input.stats.n >= rules.minCyclesForEstimate;
  const limit = input.stats.mean + rules.longCycleStdevMultiplier * input.stats.stdev;
  if (enoughToJudgeLength && input.todayCycleDay !== undefined && input.todayCycleDay > limit) {
    return 'long';
  }
  return null;
}
