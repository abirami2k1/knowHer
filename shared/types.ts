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
