/**
 * The user's own calendar day, read from her device's local clock and sent as
 * 'YYYY-MM-DD'. The API never derives "today" itself (D1), so every date-dependent
 * request carries it from here.
 */
export function todayIsoDate(date = new Date()): string {
  return toLocalIsoDate(date);
}

function toLocalIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Shifts 'YYYY-MM-DD' by whole days, staying in local calendar terms throughout. */
export function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return toLocalIsoDate(new Date(year, month - 1, day + days));
}

/** Formats 'YYYY-MM-DD' for reading, e.g. "1 September 2026". Never re-parses as UTC. */
export function formatCalendarDate(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
