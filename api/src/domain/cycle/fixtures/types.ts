import type { CycleRules } from '../rules';
import type { CycleAssessment, CycleInput, CycleLog, FlowLevel, Mucus } from '../types';

/**
 * A fixture is one cycle plus what the engine must say about it. Comments in the
 * fixture files record who approved which expectation ("Sivi, 2026-…") and why.
 */
export interface Fixture {
  name: string;
  /** Rule overrides this fixture proves (4.4.3 flips consecutiveRises here). */
  rules?: Partial<CycleRules>;
  input: CycleInput;
  /** Partial: `series` is asserted by dedicated tests, not by every fixture. */
  expected: Partial<Omit<CycleAssessment, 'series'>>;
}

/** Compact row: [day, °F | null, mucus?, flow?, disturbed?]. */
export type Row = [number, number | null, Mucus?, FlowLevel?, boolean?];

/** Builds CycleLogs from compact rows; the date is synthetic and never parsed by the engine. */
export function logsFrom(rows: Row[]): CycleLog[] {
  return rows.map(([cycleDay, bbtF, cervicalMucus, flow, isDisturbed]) => ({
    cycleDay,
    date: `2026-01-${String(cycleDay).padStart(2, '0')}`,
    ...(bbtF === null ? {} : { bbtF }),
    isDisturbed: isDisturbed ?? false,
    ...(cervicalMucus ? { cervicalMucus } : {}),
    ...(flow ? { flow } : {}),
  }));
}
