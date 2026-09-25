import type { CycleAssessmentDto, CycleDto } from '@shared/types';
import { formatCalendarDate } from '@/lib/dates';

/**
 * The confirmed facts of the cycle. A value appears only once the engine has
 * confirmed it — nothing here is ever a forecast.
 */
export function CycleFacts({
  cycle,
  assessment,
}: {
  cycle: CycleDto;
  assessment: CycleAssessmentDto;
}) {
  const rows: [string, string][] = [['Started', formatCalendarDate(cycle.startDate)]];

  if (cycle.length !== null) rows.push(['Length', `${cycle.length} days`]);
  if (assessment.ovulationDay !== null) {
    rows.push([
      'Ovulation',
      `day ${assessment.ovulationDay} · confirmed on day ${assessment.shiftConfirmedOnDay}`,
    ]);
  }
  if (assessment.peakDay !== null) rows.push(['Peak day', `day ${assessment.peakDay}`]);
  if (assessment.coverlineF !== null) {
    rows.push(['Coverline', `${assessment.coverlineF.toFixed(2)} °F`]);
  }
  if (assessment.lutealLength !== null) {
    rows.push(['Luteal phase', `${assessment.lutealLength} days`]);
  } else if (assessment.lutealDayToday !== null) {
    rows.push(['Luteal phase', `day ${assessment.lutealDayToday} so far`]);
  }

  return (
    <dl className="divide-y divide-primary/10 rounded-card bg-white px-4 ring-1 ring-primary/10">
      {rows.map(([term, value]) => (
        <div key={term} className="flex justify-between gap-4 py-3">
          <dt className="text-sm text-muted">{term}</dt>
          <dd className="text-right text-sm font-medium text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
