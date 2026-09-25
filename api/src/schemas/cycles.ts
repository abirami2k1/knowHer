import { z } from 'zod';
import { daysBetween } from '../lib/dates';
import { calendarDate, MAX_LAST_PERIOD_AGE_DAYS } from './users';

/**
 * A period start is always an explicit action (D3), so it carries the date the
 * user chose plus her own today — the server never derives either.
 */
export const startCycleSchema = z
  .object({ startDate: calendarDate, today: calendarDate })
  .strict()
  .refine((body) => daysBetween(body.startDate, body.today) >= 0, {
    error: 'A period cannot start in the future',
    path: ['startDate'],
  })
  .refine((body) => daysBetween(body.startDate, body.today) <= MAX_LAST_PERIOD_AGE_DAYS, {
    error: 'That start date is too far back',
    path: ['startDate'],
  });

/**
 * Correcting a start date that was logged a day or two off. A cycle's *end* is
 * not set here: a cycle ends when the next one begins (D3).
 */
export const editCycleSchema = startCycleSchema;

export type StartCycleInput = z.infer<typeof startCycleSchema>;
