import { z } from 'zod';
import { ENERGY_MAX, ENERGY_MIN, MOODS, SYMPTOMS } from '../../../shared/vocab';
import { daysBetween } from '../lib/dates';
import { calendarDate } from './users';

/** How far back a day may be logged or edited. Backfilling is normal; 1900 is a typo. */
export const MAX_BACKFILL_DAYS = 365;

export const FLOWS = ['none', 'spotting', 'light', 'medium', 'heavy'] as const;
export const CERVICAL_MUCUS = ['dry', 'sticky', 'watery', 'eggwhite'] as const;
export const CERVIX_POSITIONS = ['firm', 'medium', 'soft'] as const;

/** Local time of day the temperature was taken — "HH:mm", never a UTC instant. */
const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a time like 06:30');

/**
 * Waking temperature in °F. The bounds are input sanity only — a plausibility
 * rule for charting is a cycle rule and belongs in CYCLE_RULES, not here.
 */
const bbtF = z
  .number()
  .min(90)
  .max(110)
  // The column is numeric(5,2). Compared with a tolerance because 97.65 * 100 is
  // 9764.999999999998 in binary floating point — an exact test rejects real readings.
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6, {
    error: 'Temperature is recorded to two decimal places',
  });

/**
 * PUT /logs — one entry per day, upserted on (userId, date).
 * Every field except the date is optional: a day with only a mood is a valid day.
 * `today` is the user's own calendar day (D1); the server never derives it.
 */
export const upsertLogSchema = z
  .object({
    date: calendarDate,
    today: calendarDate,
    flow: z.enum(FLOWS).nullish(),
    bbtF: bbtF.nullish(),
    tempTakenAt: timeOfDay.nullish(),
    isDisturbed: z.boolean().optional(),
    disturbedReason: z.string().trim().max(120).nullish(),
    cervicalMucus: z.enum(CERVICAL_MUCUS).nullish(),
    cervixPosition: z.enum(CERVIX_POSITIONS).nullish(),
    mood: z.enum(MOODS).nullish(),
    energy: z.int().min(ENERGY_MIN).max(ENERGY_MAX).nullish(),
    symptoms: z
      .array(z.enum(SYMPTOMS))
      .max(SYMPTOMS.length)
      .refine((values) => new Set(values).size === values.length, 'Symptoms must be unique')
      .optional(),
  })
  .strict()
  .refine((body) => daysBetween(body.date, body.today) >= 0, {
    error: 'That day has not happened yet',
    path: ['date'],
  })
  .refine((body) => daysBetween(body.date, body.today) <= MAX_BACKFILL_DAYS, {
    error: 'That day is too far back to log',
    path: ['date'],
  })
  // A reason without the flag would silently do nothing — the engine only ever
  // reads isDisturbed when deciding what to exclude.
  .refine((body) => !body.disturbedReason || body.isDisturbed === true, {
    error: 'Mark the reading as unusual to give a reason',
    path: ['isDisturbed'],
  });

/** GET /logs?from&to — an inclusive range of calendar days. */
export const logRangeSchema = z
  .object({ from: calendarDate, to: calendarDate })
  .strict()
  .refine((query) => daysBetween(query.from, query.to) >= 0, {
    error: 'The range ends before it starts',
    path: ['to'],
  });

export type UpsertLogInput = z.infer<typeof upsertLogSchema>;
export type LogRangeInput = z.infer<typeof logRangeSchema>;
