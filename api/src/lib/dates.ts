/**
 * Plain local calendar dates (D1). A `CalendarDate` is the string 'YYYY-MM-DD'
 * the client picked from the user's own day — never a UTC instant, and never
 * derived from the server's clock.
 *
 * Postgres `date` columns hold no timezone, so a JS Date is only ever used as a
 * carrier for one: UTC midnight in, UTC getters out. That round-trips exactly and
 * cannot drift a day the way local-midnight construction does.
 */

export type CalendarDate = string;

const SHAPE = /^\d{4}-\d{2}-\d{2}$/;

/** True only for a well-formed date that actually exists (rejects 2026-02-30). */
export function isCalendarDate(value: string): boolean {
  if (!SHAPE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  // An out-of-range month/day gives an Invalid Date; a rolled-over one (2026-02-30
  // → March 2) comes back as a different string than it went in as.
  if (Number.isNaN(parsed.getTime())) return false;
  return toIsoDate(parsed) === value;
}

/** 'YYYY-MM-DD' → the Date to hand Prisma for an @db.Date column. */
export function toDbDate(date: CalendarDate): Date {
  return new Date(`${date}T00:00:00Z`);
}

/** A Date read back from an @db.Date column → 'YYYY-MM-DD'. */
export function toIsoDate(date: Date): CalendarDate {
  return date.toISOString().slice(0, 10);
}

/** Calendar days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  const ms = toDbDate(to).getTime() - toDbDate(from).getTime();
  return Math.round(ms / 86_400_000);
}

/** `date` shifted by whole calendar days. */
export function addDays(date: CalendarDate, days: number): CalendarDate {
  return toIsoDate(new Date(toDbDate(date).getTime() + days * 86_400_000));
}
