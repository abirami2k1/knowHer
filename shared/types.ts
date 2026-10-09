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

// ── Dashboard ────────────────────────────────────────────────────────────

export type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown';
export type FallbackReason = 'irregular' | 'long' | 'no_history';

/**
 * GET /dashboard?today=YYYY-MM-DD.
 *
 * `basis` says where the phase came from: 'confirmed' means the engine saw the
 * evidence, 'estimated' means arithmetic over past cycles, 'none' means the app
 * is declining to place today. `expectedOvulation` is always an estimate and is
 * withheld entirely whenever `fallback` is set.
 */
export interface DashboardDto {
  cycleDay: number | null;
  phase: Phase;
  basis: 'confirmed' | 'estimated' | 'none';
  phaseCopy: string;
  insight: string;
  expectedOvulation: {
    date: string;
    cycleDay: number;
    basis: 'history' | 'self_reported';
  } | null;
  /** Confirmed by the engine, not estimated — null until the shift is confirmed. */
  confirmedOvulationDay: number | null;
  /** Her typical length, for drawing where today sits. Null with nothing to go on. */
  cycleLengthTypical: number | null;
  fallback: FallbackReason | null;
}

// ── History ──────────────────────────────────────────────────────────────

/**
 * One logged day on the calendar. Only facts: what she recorded, and whether she
 * marked a period start. No prediction reaches this screen by design.
 */
export interface HistoryDayDto {
  date: string;
  flow: Flow | null;
  hasTemp: boolean;
  symptomCount: number;
  isCycleStart: boolean;
}

// ── Trends ───────────────────────────────────────────────────────────────

export type TrendPhase = Exclude<Phase, 'unknown'>;

/** One closed cycle. `lutealLength` exists only when ovulation was confirmed. */
export interface CycleTrendPoint {
  startDate: string;
  length: number;
  lutealLength: number | null;
  isAnovulatory: boolean;
}

/**
 * GET /trends?today=YYYY-MM-DD.
 *
 * Lengths come from every closed cycle (Cycle rows, or CycleSummary once a cycle's
 * raw logs are pruned). Energy and symptoms come from the recent cycles' daily logs.
 * Every sentence in `notes` is from the API's copy map; the screen adds none.
 */
export interface TrendsDto {
  /** Oldest first. */
  cycles: CycleTrendPoint[];
  lengths: { typical: number | null; shortest: number | null; longest: number | null };
  energyByPhase: {
    phase: TrendPhase;
    /** Null when there are too few days to call it a pattern. */
    average: number | null;
    days: number;
    estimatedDays: number;
  }[];
  symptoms: {
    symptom: string;
    days: number;
    byPhase: Record<TrendPhase, number>;
    mostOften: TrendPhase | null;
  }[];
  recent: { cycles: number; loggedDays: number; since: string | null };
  notes: {
    lengths: string;
    luteal: string;
    energy: string;
    /** Present only when some days were placed by estimate. */
    energyEstimated: string | null;
    symptoms: string;
  };
}

// ── Knowledge & blog ─────────────────────────────────────────────────────

/** Who a post is written for. 'both' appears in both the reader and supporter sections. */
export type Audience = 'user' | 'supporter' | 'both';
export type KnowledgeCategory = 'basics' | 'cycle' | 'supporters';

/** GET /knowledge. Articles are short, so the list carries their bodies. */
export interface KnowledgeArticleDto {
  slug: string;
  title: string;
  category: KnowledgeCategory;
  bodyMarkdown: string;
}

/** GET /blog — published posts only. */
export interface BlogPostSummary {
  slug: string;
  title: string;
  audience: Audience;
  /** ISO instant of first publication. */
  publishedAt: string;
  authorName: string | null;
}

/** GET /blog/:slug. */
export interface BlogPostDto extends BlogPostSummary {
  bodyMarkdown: string;
}

/** What an author sends to create or edit a post. */
export interface BlogPostInput {
  title: string;
  bodyMarkdown: string;
  audience: Audience;
}

/** Author-only view, drafts included (GET /admin/posts and every write). */
export interface AdminPostDto {
  id: string;
  slug: string;
  title: string;
  audience: Audience;
  bodyMarkdown: string;
  isPublished: boolean;
  publishedAt: string | null;
  updatedAt: string;
  authorName: string | null;
}
