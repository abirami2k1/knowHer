import type { DashboardDto } from '@shared/types';
import { Card, Eyebrow } from '@/components/ui/Card';
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
    <Card as="section" aria-labelledby="expected-title" className="p-5">
      <Eyebrow className="text-ovulatory">Ovulation estimate</Eyebrow>
      <h2 id="expected-title" className="mt-1.5 font-display text-title text-ink">
        {formatCalendarDate(expected.date)}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Around cycle day {expected.cycleDay}, worked out from{' '}
        {expected.basis === 'history' ? 'your past cycles' : 'the cycle length you told us'}. An
        estimate — knowHer can only confirm ovulation a few days after it happens.
      </p>
    </Card>
  );
}
