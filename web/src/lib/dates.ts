/**
 * The user's own calendar day, read from her device's local clock and sent as
 * 'YYYY-MM-DD'. The API never derives "today" itself (D1), so every date-dependent
 * request carries it from here.
 */
export function todayIsoDate(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
