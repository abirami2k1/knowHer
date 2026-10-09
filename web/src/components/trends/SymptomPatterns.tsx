import type { TrendsDto } from '@shared/types';
import { PHASE_STYLE } from '@/lib/phase';
import { SYMPTOM_LABELS } from '@/pages/log/copy';

type SymptomRow = TrendsDto['symptoms'][number];

/** Enough to see a pattern without turning the screen into a ledger. */
const MAX_SHOWN = 6;

/**
 * What she has noted most, and — when the API is willing to say — the phase it
 * tends to turn up in. The phase is named in words, not colour alone.
 */
export function SymptomPatterns({ rows }: { rows: SymptomRow[] }) {
  const shown = rows.slice(0, MAX_SHOWN);
  const most = shown[0]?.days ?? 1;

  return (
    <ul className="space-y-3.5">
      {shown.map((row) => {
        const phase = row.mostOften ? PHASE_STYLE[row.mostOften] : null;
        return (
          <li key={row.symptom}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-ink">
                {SYMPTOM_LABELS[row.symptom] ?? row.symptom}
              </span>
              <span className="text-sm text-muted tabular-nums">
                {row.days} {row.days === 1 ? 'day' : 'days'}
              </span>
            </div>
            <div aria-hidden className="mt-1.5 h-1.5 rounded-pill bg-surface-sunken">
              <div
                className="h-full rounded-pill bg-ink-soft/60"
                style={{ width: `${(row.days / most) * 100}%` }}
              />
            </div>
            {phase && (
              <p
                className={`mt-2 inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium ${phase.tint} ${phase.ink}`}
              >
                <span aria-hidden>{phase.mark}</span>
                Most often in your {phase.label.toLowerCase()} days
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
