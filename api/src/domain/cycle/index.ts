/**
 * Public surface of the cycle rule engine. Everything outside this folder
 * imports from here and never from the internals.
 */
export { assessCycle } from './assess';
export { CYCLE_COPY } from './copy';
export type { CopyKey, TrendNote } from './copy';
export { cycleStats, expectedOvulationDay, isFallback } from './estimate';
export type { CycleStats, ExpectedOvulation } from './estimate';
export { computeLutealLength, lutealDayFor } from './luteal';
export { resolvePhase } from './phase';
export type { PhaseResult } from './phase';
export { detectPeakDay } from './peak';
export type { PeakResult, PeakStatus } from './peak';
export { CYCLE_RULES, withRules } from './rules';
export {
  TREND_PHASES,
  dayPlacer,
  energyByPhase,
  lengthNote,
  mergeCycleHistory,
  symptomPatterns,
} from './trends';
export type {
  CompletedCycle,
  DayPlacement,
  EnergyByPhase,
  SymptomPattern,
  TrendDay,
  TrendPhase,
} from './trends';
export { computeCoverline, detectThermalShift } from './shift';
export type { ShiftResult, ShiftStatus } from './shift';
export type { CycleRules } from './rules';
export type {
  ChartPoint,
  Confidence,
  CycleAssessment,
  CycleInput,
  CycleLog,
  FallbackReason,
  Flag,
  FlowLevel,
  Mucus,
  Phase,
} from './types';
