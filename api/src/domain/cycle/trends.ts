import type { TrendNote } from './copy';
import type { CycleStats } from './estimate';
import { menstrualThrough } from './phase';
import { CYCLE_RULES, type CycleRules } from './rules';
import type { CycleLog, Phase } from './types';

/**
 * Trends: patterns over past cycles, looked at after the fact.
 *
 * Two honesty rules shape this file:
 *  - A past day is placed in a phase only when there is something to place it by.
 *    A confirmed thermal shift places it as `confirmed`; a closed cycle without
 *    one is counted back from its known end and placed as `estimated`; a cycle
 *    that ran without ovulation, or a live one not yet confirmed, has only its
 *    bleeding days placed. Nothing is ever forecast.
 *  - Averages are withheld below `trendMinDaysPerPhase` logged days, rather than
 *    shown as a pattern built on two data points.
 */

export type TrendPhase = Exclude<Phase, 'unknown'>;
export const TREND_PHASES: readonly TrendPhase[] = [
  'menstrual',
  'follicular',
  'ovulatory',
  'luteal',
];

export interface DayPlacement {
  phase: TrendPhase;
  basis: 'confirmed' | 'estimated';
}

export interface CycleContext {
  logs: CycleLog[];
  /** Confirmed only — a snapshot or a live engine result, never an estimate. */
  ovulationDay: number | null;
  isAnovulatory: boolean;
  /** Closed cycles only. */
  cycleLength?: number;
}

/**
 * A placer for one cycle's days. Mirrors the dashboard's phase boundaries: the
 * ovulatory stretch runs from `ovulatoryWindowDays` before a confirmed ovulation
 * to the day itself, and luteal begins the day after.
 */
export function dayPlacer(
  context: CycleContext,
  rules: CycleRules = CYCLE_RULES,
): (cycleDay: number) => DayPlacement | null {
  const bleedingThrough = menstrualThrough(context.logs);
  const anchor = placementAnchor(context, rules);

  return (cycleDay) => {
    if (cycleDay <= bleedingThrough) return { phase: 'menstrual', basis: 'confirmed' };
    if (!anchor) return null;

    const { day, basis } = anchor;
    if (basis === 'confirmed') {
      if (cycleDay > day) return { phase: 'luteal', basis };
      if (cycleDay >= day - rules.ovulatoryWindowDays) return { phase: 'ovulatory', basis };
      return { phase: 'follicular', basis };
    }
    if (Math.abs(cycleDay - day) <= rules.ovulatoryWindowDays) return { phase: 'ovulatory', basis };
    if (cycleDay > day + rules.ovulatoryWindowDays) return { phase: 'luteal', basis };
    return { phase: 'follicular', basis };
  };
}

/** The day the rest of the cycle is placed around, or null when there is none to use. */
function placementAnchor(
  context: CycleContext,
  rules: CycleRules,
): { day: number; basis: DayPlacement['basis'] } | null {
  if (context.ovulationDay !== null) return { day: context.ovulationDay, basis: 'confirmed' };
  // No ovulation happened, so there is no luteal phase to place days in.
  if (context.isAnovulatory || context.cycleLength === undefined) return null;
  // Counting back from a period that actually came — not a forecast.
  const day = Math.max(
    context.cycleLength - rules.defaultLutealAssumption,
    rules.minFollicularDays,
  );
  return { day, basis: 'estimated' };
}

// ── Patterns over logged days ────────────────────────────────────────────────

export interface TrendDay {
  placement: DayPlacement | null;
  energy: number | null;
  symptoms: readonly string[];
}

export interface EnergyByPhase {
  phase: TrendPhase;
  /** One decimal; null below `trendMinDaysPerPhase` days with an energy reading. */
  average: number | null;
  days: number;
  /** How many of `days` were placed by estimate rather than a confirmed shift. */
  estimatedDays: number;
}

export function energyByPhase(days: TrendDay[], rules: CycleRules = CYCLE_RULES): EnergyByPhase[] {
  return TREND_PHASES.map((phase) => {
    const inPhase = days.filter((day) => day.placement?.phase === phase && day.energy !== null);
    const total = inPhase.reduce((sum, day) => sum + (day.energy as number), 0);
    return {
      phase,
      average:
        inPhase.length >= rules.trendMinDaysPerPhase
          ? Math.round((total / inPhase.length) * 10) / 10
          : null,
      days: inPhase.length,
      estimatedDays: inPhase.filter((day) => day.placement?.basis === 'estimated').length,
    };
  });
}

export interface SymptomPattern {
  symptom: string;
  /** Logged days it was noted on, placed or not. */
  days: number;
  byPhase: Record<TrendPhase, number>;
  /**
   * The phase it turns up in most, relative to how many days she logged in each
   * phase (follicular days are simply more numerous). Null when it is noted too
   * rarely to say, or when two phases tie.
   */
  mostOften: TrendPhase | null;
}

export function symptomPatterns(
  days: TrendDay[],
  rules: CycleRules = CYCLE_RULES,
): SymptomPattern[] {
  const loggedInPhase = countByPhase(days.filter((day) => day.placement));
  const symptoms = [...new Set(days.flatMap((day) => day.symptoms))];

  return symptoms
    .map((symptom) => {
      const withIt = days.filter((day) => day.symptoms.includes(symptom));
      const byPhase = countByPhase(withIt);
      return {
        symptom,
        days: withIt.length,
        byPhase,
        mostOften:
          withIt.length >= rules.trendMinDaysPerPhase ? leadingPhase(byPhase, loggedInPhase) : null,
      };
    })
    .sort((a, b) => b.days - a.days || a.symptom.localeCompare(b.symptom));
}

function countByPhase(days: TrendDay[]): Record<TrendPhase, number> {
  const counts = { menstrual: 0, follicular: 0, ovulatory: 0, luteal: 0 };
  for (const day of days) if (day.placement) counts[day.placement.phase] += 1;
  return counts;
}

function leadingPhase(
  counts: Record<TrendPhase, number>,
  logged: Record<TrendPhase, number>,
): TrendPhase | null {
  const rates = TREND_PHASES.filter((phase) => counts[phase] > 0).map((phase) => ({
    phase,
    rate: counts[phase] / logged[phase],
  }));
  rates.sort((a, b) => b.rate - a.rate);
  if (rates.length === 0) return null;
  if (rates.length > 1 && rates[0].rate === rates[1].rate) return null;
  return rates[0].phase;
}

// ── Cycle history (D4 precedence) ────────────────────────────────────────────

export interface CompletedCycle {
  startDate: string;
  length: number;
  lutealLength: number | null;
  isAnovulatory: boolean;
  source: 'cycle' | 'summary';
}

/**
 * Closed cycles from both stores, oldest first. A Cycle row is authoritative
 * while it exists; a CycleSummary only stands in for a cycle whose row is gone.
 * Deduped on start date, so no cycle is ever counted twice (D4).
 */
export function mergeCycleHistory(
  cycles: CompletedCycle[],
  summaries: CompletedCycle[],
): CompletedCycle[] {
  const byStart = new Map<string, CompletedCycle>();
  for (const summary of summaries) byStart.set(summary.startDate, summary);
  for (const cycle of cycles) byStart.set(cycle.startDate, cycle);
  return [...byStart.values()].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** Which sentence describes her cycle lengths. Description only — never a grade. */
export function lengthNote(stats: CycleStats, rules: CycleRules = CYCLE_RULES): TrendNote {
  if (stats.n === 0) return 'lengths.none';
  if (stats.n < rules.minCyclesForEstimate) return 'lengths.few';
  return stats.cv > rules.irregularCvThreshold ? 'lengths.varied' : 'lengths.steady';
}
