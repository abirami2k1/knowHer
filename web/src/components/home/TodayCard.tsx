import type { DashboardDto } from '@shared/types';
import { Card, Eyebrow } from '@/components/ui/Card';
import { PHASE_STYLE } from '@/lib/phase';
import { CycleRibbon } from './CycleRibbon';

/**
 * The hero. It carries the one thing a calendar cannot tell her: where she is
 * today, in her own cycle's colour.
 *
 * When the API declines to place her (`basis: 'none'`), the card shows its words
 * instead of a phase and drops the colour — it never fills the gap itself.
 */
export function TodayCard({ dashboard }: { dashboard: DashboardDto }) {
  const placed = dashboard.basis !== 'none';
  const style = PHASE_STYLE[dashboard.phase];

  return (
    <Card className="overflow-hidden">
      <div className={`px-5 pt-5 pb-6 ${placed ? style.tint : 'bg-surface-sunken'}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Eyebrow className={placed ? style.ink : 'text-muted'}>
              {dashboard.cycleDay !== null ? `Cycle day ${dashboard.cycleDay}` : 'No cycle yet'}
            </Eyebrow>
            <h2 className="mt-1.5 font-display text-display text-ink">
              {placed ? style.label : 'Today'}
            </h2>
          </div>
          <span aria-hidden className={`text-3xl leading-none ${style.ink}`}>
            {style.mark}
          </span>
        </div>

        {placed && (
          <p className="mt-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-pill bg-surface/70 px-3 py-1 text-xs font-medium ${style.ink}`}
            >
              {dashboard.basis === 'confirmed' ? 'Confirmed from your readings' : 'Estimated'}
            </span>
          </p>
        )}

        <CycleRibbon dashboard={dashboard} />
      </div>

      <div className="space-y-3 px-5 py-5">
        <p className="text-[15px] leading-relaxed text-ink-soft">{dashboard.phaseCopy}</p>
        {placed && (
          <p className="border-l-2 border-line pl-4 text-[15px] leading-relaxed text-muted italic">
            {dashboard.insight}
          </p>
        )}
      </div>
    </Card>
  );
}
