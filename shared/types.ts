/**
 * Types shared by /web and /api. Types only — no runtime logic lives here.
 *
 * Every API response uses this envelope. Routes call ok()/fail() in the api;
 * the web client narrows on `success`.
 */
export interface ApiError {
  code: string;
  message: string;
}

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: ApiError };

// ── Users ────────────────────────────────────────────────────────────────
// String unions mirror the Prisma enums of the same name (api/prisma/schema.prisma).

export type AgeBand = 'under18' | 'b18_24' | 'b25_34' | 'b35_44' | 'b45_plus';
export type Condition = 'pcod' | 'pmdd' | 'endo' | 'none' | 'unsure';
export type Goal =
  | 'understand_body'
  | 'track_period'
  | 'ovulation_awareness'
  | 'plan_life'
  | 'manage_condition'
  | 'learn';
export type Role = 'user' | 'author';

/** GET /me. Dates are ISO strings; never includes the Cognito subject. */
export interface UserProfile {
  id: string;
  displayName: string | null;
  ageBand: AgeBand | null;
  conditions: Condition[];
  goals: Goal[];
  trackingBBT: boolean;
  trackingMucus: boolean;
  avgCycleLength: number | null;
  avgPeriodLength: number | null;
  tempUnit: string;
  role: Role;
  /** null = onboarding not finished */
  onboardedAt: string | null;
  createdAt: string;
}

/**
 * POST /onboarding — the single submit at the end of the flow.
 * Every "not sure" answer is expressed by leaving its field out; `today` is the
 * user's own calendar day and travels with `lastPeriodStart` (D1).
 */
export interface OnboardingRequest {
  displayName: string;
  ageBand: AgeBand;
  conditions: Condition[];
  goals: Goal[];
  trackingBBT: boolean;
  trackingMucus: boolean;
  avgCycleLength?: number;
  avgPeriodLength?: number;
  /** 'YYYY-MM-DD' */
  lastPeriodStart?: string;
  /** 'YYYY-MM-DD' */
  today?: string;
}

// ── Daily logs ───────────────────────────────────────────────────────────

export type Flow = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export type CervicalMucus = 'dry' | 'sticky' | 'watery' | 'eggwhite';
export type CervixPosition = 'firm' | 'medium' | 'soft';

/**
 * One logged day. `date` is a plain calendar date (D1) and `bbtF` a plain number
 * (°F, two decimals) — never a Decimal or a UTC instant.
 */
export interface DailyLogDto {
  date: string;
  flow: Flow | null;
  bbtF: number | null;
  /** Local time of day, "HH:mm". */
  tempTakenAt: string | null;
  isDisturbed: boolean;
  disturbedReason: string | null;
  cervicalMucus: CervicalMucus | null;
  cervixPosition: CervixPosition | null;
  mood: string | null;
  energy: number | null;
  symptoms: string[];
}

// ── Cycles ───────────────────────────────────────────────────────────────

/**
 * A cycle interval. `endDate` is null while it is the current one. The assessment
 * fields are the snapshot written when it closed — null on a live cycle, whose
 * assessment is computed on read (D4).
 */
export interface CycleDto {
  id: string;
  startDate: string;
  endDate: string | null;
  length: number | null;
  coverlineF: number | null;
  ovulationDay: number | null;
  peakDay: number | null;
  lutealLength: number | null;
  isAnovulatory: boolean;
  confidence: string | null;
}

// ── Cycle assessment ─────────────────────────────────────────────────────
// These mirror the engine's output types (api/src/domain/cycle/types.ts). The
// engine itself stays API-only (D5); this is the shape it is served in.

export type Flag =
  | 'low_data'
  | 'no_temp_data'
  | 'no_mucus_data'
  | 'disturbed_excluded'
  | 'false_shift_invalidated'
  | 'shift_pending'
  | 'peak_pending'
  | 'signal_disagreement'
  | 'anovulatory';

export type Confidence = 'full' | 'reduced' | 'none';

/** One row of the chart, already resolved by the engine — the UI does no math. */
export interface ChartPoint {
  cycleDay: number;
  bbtF: number | null;
  isDisturbed: boolean;
  excludedFromRules: boolean;
  aboveCoverline: boolean | null;
  tempCount: number | null;
  lutealDay: number | null;
  peakCount: number | null;
  mucus: CervicalMucus | null;
  flow: Flow | null;
}

/**
 * Structural honesty: coverlineF, ovulationDay and peakDay are non-null only
 * once their confirmation day has actually been logged. There is no "likely"
 * field, because there is nothing honest to put in one.
 */
export interface CycleAssessmentDto {
  coverlineF: number | null;
  coverlineWindowDays: number[];
  dipDay: number | null;
  ovulationDay: number | null;
  shiftConfirmedOnDay: number | null;
  peakDay: number | null;
  peakConfirmedOnDay: number | null;
  lutealLength: number | null;
  lutealDayToday: number | null;
  isAnovulatory: boolean;
  confidence: Confidence;
  flags: Flag[];
  series: ChartPoint[];
}

/** GET /cycles/:id/assessment. `copy` carries the wording for the states reported. */
export interface AssessmentResponse {
  cycle: CycleDto;
  assessment: CycleAssessmentDto;
  copy: Record<string, string>;
}
