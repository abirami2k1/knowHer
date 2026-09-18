import { CYCLE_RULES, type CycleRules } from './rules';
import { visibleLogs } from './temps';
import type { CycleInput } from './types';

export type PeakStatus =
  | 'confirmed'
  | 'pending' // egg-white seen, not enough logged non-egg-white days after it yet
  | 'none' // mucus logged, but never egg-white
  | 'no_mucus_data';

export interface PeakResult {
  status: PeakStatus;
  peakDay: number | null;
  peakConfirmedOnDay: number | null;
  /** Cycle days of the logged non-egg-white days that confirmed the peak, in order. */
  confirmDays: number[];
}

/**
 * Peak day = the last egg-white day, confirmed once `peakConfirmDays` later
 * *logged* mucus days are all non-egg-white. A later egg-white day moves the
 * peak by construction. See cycle-engine-plan.md §6.5.
 */
export function detectPeakDay(input: CycleInput, rules: CycleRules = CYCLE_RULES): PeakResult {
  const mucusLogs = visibleLogs(input).filter((l) => l.cervicalMucus !== undefined);
  if (mucusLogs.length === 0) {
    return { status: 'no_mucus_data', peakDay: null, peakConfirmedOnDay: null, confirmDays: [] };
  }
  const lastEggWhite = [...mucusLogs].reverse().find((l) => l.cervicalMucus === 'eggwhite');
  if (!lastEggWhite)
    return { status: 'none', peakDay: null, peakConfirmedOnDay: null, confirmDays: [] };

  const after = mucusLogs.filter((l) => l.cycleDay > lastEggWhite.cycleDay);
  if (after.length < rules.peakConfirmDays) {
    return { status: 'pending', peakDay: null, peakConfirmedOnDay: null, confirmDays: [] };
  }
  const confirmDays = after.slice(0, rules.peakConfirmDays).map((l) => l.cycleDay);
  return {
    status: 'confirmed',
    peakDay: lastEggWhite.cycleDay,
    peakConfirmedOnDay: confirmDays[confirmDays.length - 1]!,
    confirmDays,
  };
}
