import type { DashboardDto } from '@shared/types';
import { formatCalendarDate } from '@/lib/dates';

/**
 * The expected-ovulation estimate, always labelled as one.
 *
 * knowHer confirms ovulation only after it has happened; this is arithmetic over
 * past cycles and says so. It is never a fertile-window or "safe day" signal, and
 * the API withholds it entirely when it cannot place her cycle honestly.
 */
export function ExpectedOvulation({ expected }: { expected: DashboardDto['expectedOvulation'] }) {
  if (!expected) return null;

  return (
    <section
      aria-labelledby="expected-title"
      className="rounded-card bg-white p-4 ring-1 ring-primary/10"
    >
      <h2 id="expected-title" className="text-sm font-medium text-muted">
        Ovulation estimate
      </h2>
      <p className="mt-1 text-lg font-medium text-ink">{formatCalendarDate(expected.date)}</p>
      <p className="mt-1 text-sm text-muted">
        Around cycle day {expected.cycleDay}, worked out from{' '}
        {expected.basis === 'history' ? 'your past cycles' : 'the cycle length you told us'}. An
        estimate — knowHer can only confirm ovulation a few days after it happens.
      </p>
    </section>
  );
}
