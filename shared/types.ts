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
