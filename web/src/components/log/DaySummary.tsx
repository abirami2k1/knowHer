import type { DailyLogDto } from '@shared/types';
import {
  CERVIX_OPTIONS,
  ENERGY_LABELS,
  FLOW_OPTIONS,
  MOOD_OPTIONS,
  MUCUS_OPTIONS,
  SYMPTOM_OPTIONS,
} from '@/pages/log/copy';

function labelOf<T extends string>(options: { value: T; label: string }[], value: T | null) {
  return options.find((o) => o.value === value)?.label ?? null;
}

/** What is already recorded for a day. Empty is stated warmly, not as a warning. */
export function DaySummary({ log }: { log: DailyLogDto | null }) {
  if (!log) {
    return (
      <p className="rounded-card bg-white p-4 text-muted ring-1 ring-primary/10">
        Nothing recorded for this day yet.
      </p>
    );
  }

  const rows: [string, string | null][] = [
    ['Bleeding', labelOf(FLOW_OPTIONS, log.flow)],
    ['Mood', labelOf(MOOD_OPTIONS, log.mood as never)],
    ['Energy', log.energy ? `${log.energy} · ${ENERGY_LABELS[log.energy - 1]}` : null],
    [
      'Feeling',
      log.symptoms.length
        ? log.symptoms.map((s) => labelOf(SYMPTOM_OPTIONS, s as never) ?? s).join(', ')
        : null,
    ],
    [
      'Temperature',
      log.bbtF
        ? `${log.bbtF.toFixed(2)} °F${log.tempTakenAt ? ` at ${log.tempTakenAt}` : ''}${
            log.isDisturbed ? ' · flagged as unusual' : ''
          }`
        : null,
    ],
    ['Mucus', labelOf(MUCUS_OPTIONS, log.cervicalMucus)],
    ['Cervix', labelOf(CERVIX_OPTIONS, log.cervixPosition)],
  ];
  const recorded = rows.filter(([, value]) => value !== null);

  if (recorded.length === 0) {
    return (
      <p className="rounded-card bg-white p-4 text-muted ring-1 ring-primary/10">
        Nothing recorded for this day yet.
      </p>
    );
  }

  return (
    <dl className="divide-y divide-primary/10 rounded-card bg-white px-4 ring-1 ring-primary/10">
      {recorded.map(([term, value]) => (
        <div key={term} className="flex justify-between gap-4 py-3">
          <dt className="text-sm text-muted">{term}</dt>
          <dd className="max-w-[62%] text-right text-sm font-medium text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
