import type { DashboardDto } from '@shared/types';

const PHASE_LABEL: Record<DashboardDto['phase'], string> = {
  menstrual: 'Menstrual phase',
  follicular: 'Follicular phase',
  ovulatory: 'Around ovulation',
  luteal: 'Luteal phase',
  unknown: 'Today',
};

/**
 * Where she is today. When the API declines to place her cycle (`basis: 'none'`),
 * this shows its words instead of a phase — it never fills the gap itself.
 */
export function TodayCard({ dashboard }: { dashboard: DashboardDto }) {
  const placed = dashboard.basis !== 'none';

  return (
    <section
      aria-labelledby="today-title"
      className="rounded-card bg-white p-5 shadow-sm ring-1 ring-primary/10"
    >
      {dashboard.cycleDay !== null && (
        <p className="text-sm font-medium text-primary">Cycle day {dashboard.cycleDay}</p>
      )}
      <h2 id="today-title" className="mt-1 text-xl font-semibold text-ink">
        {placed ? PHASE_LABEL[dashboard.phase] : 'Today'}
      </h2>

      {placed && dashboard.basis === 'estimated' && (
        <p className="mt-1 text-xs text-muted">
          Based on your past cycles — an estimate, not a confirmation.
        </p>
      )}

      <p className="mt-3 text-muted">{dashboard.phaseCopy}</p>
      {placed && <p className="mt-3 text-muted">{dashboard.insight}</p>}
    </section>
  );
}
