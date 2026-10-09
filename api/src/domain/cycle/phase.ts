import { CYCLE_RULES, type CycleRules } from './rules';
import type { ExpectedOvulation } from './estimate';
import type { CycleAssessment, CycleLog, FallbackReason, Phase } from './types';

/**
 * Where today sits in the cycle.
 *
 * `basis` is the honesty carrier: 'confirmed' means the engine saw the evidence
 * (a confirmed thermal shift), 'estimated' means this is arithmetic over past
 * cycles, and 'none' means the app is declining to place today at all.
 * A phase is never evidence of ovulation — only `basis: 'confirmed'` is.
 */
export interface PhaseResult {
  phase: Phase;
  basis: 'confirmed' | 'estimated' | 'none';
  copyKey: string;
}

/** The leading run of bleeding days from day 1. Spotting alone never counts (D3). */
export function menstrualThrough(logs: CycleLog[]): number {
  const byDay = new Map(logs.map((log) => [log.cycleDay, log]));
  let day = 0;
  while (true) {
    const log = byDay.get(day + 1);
    const bleeding = log?.flow === 'light' || log?.flow === 'medium' || log?.flow === 'heavy';
    if (!bleeding) return day;
    day += 1;
  }
}

export function resolvePhase(
  input: {
    assessment: CycleAssessment;
    todayCycleDay: number;
    logs: CycleLog[];
    expected: ExpectedOvulation | null;
    fallback: FallbackReason | null;
  },
  rules: CycleRules = CYCLE_RULES,
): PhaseResult {
  const { assessment, todayCycleDay, logs, expected, fallback } = input;

  // 1. Nothing honest to say about a phase.
  if (fallback) return { phase: 'unknown', basis: 'none', copyKey: `fallback.${fallback}` };

  // 2. Still bleeding, counting from day 1.
  if (todayCycleDay <= menstrualThrough(logs)) {
    return { phase: 'menstrual', basis: 'confirmed', copyKey: 'phase.menstrual' };
  }

  // 3. Ovulation actually confirmed, and today is after it.
  if (assessment.ovulationDay !== null && todayCycleDay > assessment.ovulationDay) {
    return { phase: 'luteal', basis: 'confirmed', copyKey: 'phase.luteal' };
  }

  // 4–5. No confirmation yet: place today against the estimate, clearly as an estimate.
  if (expected) {
    if (Math.abs(todayCycleDay - expected.day) <= rules.ovulatoryWindowDays) {
      return { phase: 'ovulatory', basis: 'estimated', copyKey: 'phase.ovulatory' };
    }
    if (todayCycleDay > expected.day + rules.ovulatoryWindowDays) {
      return { phase: 'luteal', basis: 'estimated', copyKey: 'phase.luteal' };
    }
  }

  // 6. Before all of that.
  return {
    phase: 'follicular',
    basis: expected ? 'estimated' : 'none',
    copyKey: 'phase.follicular',
  };
}
