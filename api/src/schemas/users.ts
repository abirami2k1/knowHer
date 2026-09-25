import { z } from 'zod';
import { daysBetween, isCalendarDate } from '../lib/dates';

/**
 * Input validation for the profile/onboarding routes (the only place it lives).
 * Enum members mirror the Prisma enums of the same name; /shared/types.ts carries
 * the matching string unions for the web client.
 */

export const AGE_BANDS = ['under18', 'b18_24', 'b25_34', 'b35_44', 'b45_plus'] as const;
export const CONDITIONS = ['pcod', 'pmdd', 'endo', 'none', 'unsure'] as const;
export const GOALS = [
  'understand_body',
  'track_period',
  'ovulation_awareness',
  'plan_life',
  'manage_condition',
  'learn',
] as const;

/** "none" and "unsure" are answers on their own — they can't be combined with a condition. */
const conditions = z
  .array(z.enum(CONDITIONS))
  .max(CONDITIONS.length)
  .refine((values) => new Set(values).size === values.length, 'Conditions must be unique')
  .refine(
    (values) => values.length <= 1 || !values.some((v) => v === 'none' || v === 'unsure'),
    '"none" and "unsure" cannot be combined with other conditions',
  );

const goals = z
  .array(z.enum(GOALS))
  .max(GOALS.length)
  .refine((values) => new Set(values).size === values.length, 'Goals must be unique');

/** A plain local calendar date chosen on the client (D1) — never a UTC instant. */
export const calendarDate = z
  .string()
  .refine(isCalendarDate, 'Use a real calendar date in YYYY-MM-DD form');

/** How far back onboarding will accept a remembered period start. */
export const MAX_LAST_PERIOD_AGE_DAYS = 365;

/** Self-reported at onboarding; wide bounds on purpose — irregular cycles are normal here. */
const avgCycleLength = z.int().min(15).max(90);
const avgPeriodLength = z.int().min(1).max(15);
const displayName = z.string().trim().min(1).max(40);

const profileFields = {
  displayName,
  ageBand: z.enum(AGE_BANDS),
  conditions,
  goals,
  trackingBBT: z.boolean(),
  trackingMucus: z.boolean(),
  avgCycleLength,
  avgPeriodLength,
};

/** PATCH /me — any subset of the profile, but never an empty request. */
export const updateProfileSchema = z
  .object(profileFields)
  .partial()
  .strict()
  .refine((body) => Object.keys(body).length > 0, 'Nothing to update');

/**
 * POST /onboarding — the single submit at the end of the flow. Name and age band
 * are the two things every path collects; everything else may be skipped, and every
 * "not sure" answer is expressed by leaving its field out.
 */
export const onboardingSchema = z
  .object({
    ...profileFields,
    conditions: conditions.default([]),
    goals: goals.default([]),
    trackingBBT: z.boolean().default(false),
    trackingMucus: z.boolean().default(false),
    avgCycleLength: avgCycleLength.optional(),
    avgPeriodLength: avgPeriodLength.optional(),
    /** Absent = "I'm not sure" — a valid answer, and no first cycle is created. */
    lastPeriodStart: calendarDate.optional(),
    /** The user's own today (D1). Required only to bound lastPeriodStart. */
    today: calendarDate.optional(),
  })
  .strict()
  .refine((body) => body.lastPeriodStart === undefined || body.today !== undefined, {
    error: 'today is required alongside lastPeriodStart',
    path: ['today'],
  })
  .refine(
    (body) =>
      body.lastPeriodStart === undefined ||
      body.today === undefined ||
      daysBetween(body.lastPeriodStart, body.today) >= 0,
    { error: 'A period start cannot be in the future', path: ['lastPeriodStart'] },
  )
  .refine(
    (body) =>
      body.lastPeriodStart === undefined ||
      body.today === undefined ||
      daysBetween(body.lastPeriodStart, body.today) <= MAX_LAST_PERIOD_AGE_DAYS,
    { error: 'That period start is too long ago to begin a cycle from', path: ['lastPeriodStart'] },
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
