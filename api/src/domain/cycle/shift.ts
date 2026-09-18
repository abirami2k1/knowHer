import {
  candidateFromWindow,
  findDipDay,
  windowBefore,
  type CoverlineCandidate,
} from './coverline';
import { CYCLE_RULES, type CycleRules } from './rules';
import { fromHundredths, selectReadings, visibleLogs, type Reading } from './temps';
import type { CycleInput, CycleLog } from './types';

export type ShiftStatus =
  | 'confirmed' // three (consecutiveRises) usable readings strictly above the line
  | 'pending' // live cycle: a run was cut short by the end of the data, or no crossing yet
  | 'none' // closed cycle: no confirmed run
  | 'low_data' // fewer than minValidTemps usable readings
  | 'no_temp_data'; // no temperatures logged at all

export interface ShiftResult {
  status: ShiftStatus;
  /** Hundredths; non-null only when confirmed. */
  coverlineH: number | null;
  coverlineWindowDays: number[];
  /** Fewer window readings than coverlineWindow (calendar-day unit) → reduced confidence. */
  windowShort: boolean;
  dipDay: number | null;
  ovulationDay: number | null;
  shiftConfirmedOnDay: number | null;
  /** Cycle days of the confirming run, first high first. */
  runDays: number[];
  falseShiftSeen: boolean;
  /** A disturbed reading sat inside the window span or the run. */
  disturbedInvolved: boolean;
  usableCount: number;
}

const NO_SHIFT = (status: ShiftStatus, usableCount: number): ShiftResult => ({
  status,
  coverlineH: null,
  coverlineWindowDays: [],
  windowShort: false,
  dipDay: null,
  ovulationDay: null,
  shiftConfirmedOnDay: null,
  runDays: [],
  falseShiftSeen: false,
  disturbedInvolved: false,
  usableCount,
});

type RunOutcome =
  | { kind: 'confirmed'; runDays: number[] }
  | { kind: 'cut_short' }
  | { kind: 'failed' }
  | { kind: 'disturbed' };

/**
 * Examine the run of readings starting at usable[i]. Walks the full reading list
 * (not just usable) so a disturbed reading inside the run breaks it.
 */
function examineRun(
  readings: Reading[],
  usable: Reading[],
  i: number,
  lineH: number,
  rules: CycleRules,
): RunOutcome {
  const start = readings.findIndex((r) => r.cycleDay === usable[i]!.cycleDay);
  const runDays: number[] = [];
  for (let k = start; k < readings.length && runDays.length < rules.consecutiveRises; k++) {
    const reading = readings[k]!;
    if (reading.excludedFromRules) return { kind: 'disturbed' };
    if (reading.tempH <= lineH) return { kind: 'failed' };
    runDays.push(reading.cycleDay);
  }
  return runDays.length === rules.consecutiveRises
    ? { kind: 'confirmed', runDays }
    : { kind: 'cut_short' };
}

function anyDisturbedBetween(readings: Reading[], fromDay: number, toDay: number): boolean {
  return readings.some(
    (r) => r.isDisturbed && r.excludedFromRules && r.cycleDay >= fromDay && r.cycleDay <= toDay,
  );
}

/** The dip anchor: last egg-white day whose reading is lower than the previous usable reading. */
function dipAnchorIndex(usable: Reading[], logs: CycleLog[]): number | null {
  for (let i = usable.length - 1; i >= 1; i--) {
    const day = usable[i]!.cycleDay;
    const mucus = logs.find((l) => l.cycleDay === day)?.cervicalMucus;
    if (mucus === 'eggwhite' && usable[i]!.tempH < usable[i - 1]!.tempH) return i;
  }
  return null;
}

/**
 * Textbook 3-over-6, with the anchor and every number coming from `rules`:
 * scan each usable reading; when it sits strictly above the line drawn over the
 * window before it, the next readings must stay above for `consecutiveRises` in a
 * row. Only then is anything exposed. See cycle-engine-plan.md §6.3.
 */
export function detectThermalShift(
  input: CycleInput,
  rules: CycleRules = CYCLE_RULES,
): ShiftResult {
  const logs = visibleLogs(input);
  const { readings, usable } = selectReadings(logs, rules);
  const isLive = input.cycleLength === undefined;

  if (readings.length === 0) return NO_SHIFT('no_temp_data', 0);
  if (usable.length < rules.minValidTemps) return NO_SHIFT('low_data', usable.length);

  let falseShiftSeen = false;
  let fixedCandidate: CoverlineCandidate | null = null;
  let startIndex = 0;

  if (rules.coverlineAnchor === 'dip_with_fertile_mucus') {
    const d = dipAnchorIndex(usable, logs);
    if (d !== null) {
      const window = windowBefore(usable, d, rules);
      if (window) {
        fixedCandidate = candidateFromWindow(window, rules);
        startIndex = d + 1;
      }
    }
    // No usable dip → fall back to the first-high-temp anchor. The plan marks the
    // fallback by leaving coverlineWindowDays empty, so the chart can show it.
  }

  for (let i = startIndex; i < usable.length; i++) {
    const candidate =
      fixedCandidate ??
      (() => {
        const window = windowBefore(usable, i, rules);
        return window ? candidateFromWindow(window, rules) : null;
      })();
    if (!candidate) continue;
    if (usable[i]!.tempH <= candidate.lineH) continue;

    const outcome = examineRun(readings, usable, i, candidate.lineH, rules);
    if (outcome.kind === 'confirmed') {
      const windowDays =
        fixedCandidate === null && rules.coverlineAnchor === 'dip_with_fertile_mucus'
          ? []
          : candidate.windowDays;
      const firstHigh = outcome.runDays[0]!;
      const confirmedOn = outcome.runDays[outcome.runDays.length - 1]!;
      const spanStart = candidate.windowDays[0] ?? firstHigh;
      return {
        status: 'confirmed',
        coverlineH: candidate.lineH,
        coverlineWindowDays: windowDays,
        windowShort: candidate.window.length < rules.coverlineWindow,
        dipDay: findDipDay(candidate.window, logs),
        ovulationDay: firstHigh - 1,
        shiftConfirmedOnDay: confirmedOn,
        runDays: outcome.runDays,
        falseShiftSeen,
        disturbedInvolved: anyDisturbedBetween(readings, spanStart, confirmedOn),
        usableCount: usable.length,
      };
    }
    if (outcome.kind === 'cut_short') {
      return { ...NO_SHIFT(isLive ? 'pending' : 'none', usable.length), falseShiftSeen };
    }
    if (outcome.kind === 'failed') {
      if (!rules.invalidateFalseShift) break;
      falseShiftSeen = true;
    }
    // 'disturbed': the run was broken by an unusual reading; keep scanning.
  }

  return { ...NO_SHIFT(isLive ? 'pending' : 'none', usable.length), falseShiftSeen };
}

/** 4.2.1 public form: the confirmed coverline in °F with the days that formed it, or null. */
export function computeCoverline(
  input: CycleInput,
  rules: CycleRules = CYCLE_RULES,
): { coverlineF: number; windowDays: number[] } | null {
  const shift = detectThermalShift(input, rules);
  if (shift.status !== 'confirmed' || shift.coverlineH === null) return null;
  return { coverlineF: fromHundredths(shift.coverlineH), windowDays: shift.coverlineWindowDays };
}
