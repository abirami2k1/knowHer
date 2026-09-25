/**
 * Month helpers for the calendar, in local calendar terms throughout — never a
 * UTC instant, for the same reason the rest of the app avoids them (D1).
 */

/** 'YYYY-MM' for the month containing a 'YYYY-MM-DD'. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

export function shiftMonth(month: string, months: number): string {
  const [year, monthIndex] = month.split('-').map(Number);
  const shifted = new Date(year, monthIndex - 1 + months, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(month: string): string {
  const [year, monthIndex] = month.split('-').map(Number);
  return new Date(year, monthIndex - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export interface MonthGrid {
  /** Leading blanks so day 1 lands under its weekday. */
  blanks: number;
  /** Every 'YYYY-MM-DD' in the month, in order. */
  days: string[];
}

/**
 * The month laid out for a Monday-first grid.
 * Weekday names come from the browser's locale; the layout does not.
 */
export function monthGrid(month: string): MonthGrid {
  const [year, monthIndex] = month.split('-').map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const total = new Date(year, monthIndex, 0).getDate();
  // getDay(): 0 = Sunday. Monday-first means Sunday sits at the end.
  const blanks = (first.getDay() + 6) % 7;

  const days = Array.from(
    { length: total },
    (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`,
  );
  return { blanks, days };
}

export const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
