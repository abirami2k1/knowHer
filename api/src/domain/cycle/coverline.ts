import type { CycleRules } from './rules';
import { snapToGrid, toHundredths, type Reading } from './temps';
import type { CycleLog } from './types';

export interface CoverlineCandidate {
  /** Hundredths of °F. */
  lineH: number;
  /** Cycle days whose readings formed the window. */
  windowDays: number[];
  /** The window's readings, for dip detection. */
  window: Reading[];
}

/**
 * The window of readings before the anchor index `i` in `usable`, or null when the
 * window cannot be formed. Unit 'readings' needs exactly coverlineWindow prior usable
 * readings; unit 'calendar_days' takes whatever usable readings fall in the previous
 * coverlineWindow calendar days and needs at least three of them.
 */
export function windowBefore(usable: Reading[], i: number, rules: CycleRules): Reading[] | null {
  if (rules.coverlineWindowUnit === 'readings') {
    if (i < rules.coverlineWindow) return null;
    return usable.slice(i - rules.coverlineWindow, i);
  }
  const anchorDay = usable[i]!.cycleDay;
  const window = usable.filter(
    (r) => r.cycleDay < anchorDay && r.cycleDay >= anchorDay - rules.coverlineWindow,
  );
  return window.length >= 3 ? window : null;
}

/** line = (snapped) window max + offset. */
export function candidateFromWindow(window: Reading[], rules: CycleRules): CoverlineCandidate {
  const max = Math.max(...window.map((r) => r.tempH));
  const base = rules.coverlineOnGrid ? snapToGrid(max) : max;
  return {
    lineH: base + toHundredths(rules.coverlineOffsetF),
    windowDays: window.map((r) => r.cycleDay),
    window,
  };
}

/**
 * Sivi's "drop with the appearance of mucus": the day of the window's minimum reading,
 * only when that minimum is unique and the day logs egg-white or watery mucus.
 * A chart annotation, never an input to a rule.
 */
export function findDipDay(window: Reading[], logs: CycleLog[]): number | null {
  if (window.length === 0) return null;
  const min = Math.min(...window.map((r) => r.tempH));
  const atMin = window.filter((r) => r.tempH === min);
  if (atMin.length !== 1) return null;
  const day = atMin[0]!.cycleDay;
  const mucus = logs.find((l) => l.cycleDay === day)?.cervicalMucus;
  return mucus === 'eggwhite' || mucus === 'watery' ? day : null;
}
