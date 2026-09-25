import type { DashboardDto } from '@shared/types';
import { PHASE_STYLE } from '@/lib/phase';

/**
 * Where today sits in the cycle, as one quiet bar.
 *
 * It draws only what the API sent: her typical length for the track, today for
 * the marker, and an ovulation mark that is solid when the engine confirmed it
 * and hollow when it is only the estimate. Nothing is computed here.
 */
export function CycleRibbon({ dashboard }: { dashboard: DashboardDto }) {
  const { cycleDay, cycleLengthTypical, confirmedOvulationDay, expectedOvulation } = dashboard;
  if (cycleDay === null || !cycleLengthTypical) return null;

  // A cycle running past her usual length simply extends the track.
  const total = Math.max(cycleLengthTypical, cycleDay);
  const at = (day: number) => `${Math.min(100, (day / total) * 100)}%`;
  const ovulation = confirmedOvulationDay ?? expectedOvulation?.cycleDay ?? null;
  const confirmed = confirmedOvulationDay !== null;
  const style = PHASE_STYLE[dashboard.phase];

  return (
    <div className="pt-1">
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-3.5 h-1 rounded-pill bg-surface-sunken" />
        <div
          className={`absolute top-3.5 left-0 h-1 rounded-pill ${style.fill} opacity-70`}
          style={{ width: at(cycleDay) }}
        />

        {ovulation !== null && (
          <span
            className="absolute top-1.5 -ml-2 flex size-4 items-center justify-center"
            style={{ left: at(ovulation) }}
          >
            <span
              className={`size-2.5 rounded-full border-2 border-ovulatory ${
                confirmed ? 'bg-ovulatory' : 'bg-paper'
              }`}
            />
          </span>
        )}

        <span
          className={`absolute top-0.5 -ml-2.5 size-5 rounded-full border-[3px] border-paper ${style.fill} shadow-sm`}
          style={{ left: at(cycleDay) }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-muted">
        <span>Day 1</span>
        <span>
          {confirmed ? 'Ovulation confirmed' : ovulation !== null ? 'Ovulation estimate' : ''}
        </span>
        <span>~{cycleLengthTypical}</span>
      </div>
    </div>
  );
}
