import type { CycleRules } from './rules';
import type { CycleInput, CycleLog } from './types';

/**
 * Temperatures are integers (hundredths of °F) inside the engine so that a reading
 * exactly on the line compares correctly. 97.7 + 0.1 !== 97.8 in floating point.
 */
export function toHundredths(f: number): number {
  return Math.round(f * 100);
}

export function fromHundredths(h: number): number {
  return h / 100;
}

/** Snap to the nearest tenth (half up): 9765 → 9770. Sivi plots on 0.1 grid lines. */
export function snapToGrid(h: number): number {
  return Math.round(h / 10) * 10;
}

export interface Reading {
  cycleDay: number;
  tempH: number;
  isDisturbed: boolean;
  /** Disturbed (when excludeDisturbed) or early-cycle exclusion. */
  excludedFromRules: boolean;
}

/** Logs the engine may look at: sorted by day, and never beyond "today" for a live cycle. */
export function visibleLogs(input: CycleInput): CycleLog[] {
  const limit = input.todayCycleDay;
  return input.logs
    .filter((log) => limit === undefined || log.cycleDay <= limit)
    .slice()
    .sort((a, b) => a.cycleDay - b.cycleDay);
}

export interface ReadingSet {
  /** Every logged temperature, in day order (includes excluded ones, for the chart). */
  readings: Reading[];
  /** Readings the rules may use. */
  usable: Reading[];
}

export function selectReadings(logs: CycleLog[], rules: CycleRules): ReadingSet {
  const readings: Reading[] = [];
  for (const log of logs) {
    if (log.bbtF === undefined) continue;
    const excludedFromRules =
      (log.isDisturbed && rules.excludeDisturbed) || log.cycleDay <= rules.excludeEarlyCycleDays;
    readings.push({
      cycleDay: log.cycleDay,
      tempH: toHundredths(log.bbtF),
      isDisturbed: log.isDisturbed,
      excludedFromRules,
    });
  }
  return { readings, usable: readings.filter((r) => !r.excludedFromRules) };
}
