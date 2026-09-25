import type { OnboardingDraft } from '@/hooks/useOnboarding';
import { formatCalendarDate } from '@/lib/dates';
import { AGE_BAND_OPTIONS, CONDITION_OPTIONS, GOAL_OPTIONS } from '../copy';
import { StepLayout } from './StepLayout';

function labelsFor<T extends string>(
  options: { value: T; label: string }[],
  selected: T[],
): string {
  const labels = options.filter((o) => selected.includes(o.value)).map((o) => o.label);
  return labels.length > 0 ? labels.join(', ') : 'Not set';
}

/** Last step: what we understood, in her words, before anything is written. */
export function ConfirmStep({ draft }: { draft: OnboardingDraft }) {
  const tracking = [draft.trackingBBT && 'temperature', draft.trackingMucus && 'mucus'].filter(
    Boolean,
  );

  const rows: { term: string; value: string }[] = [
    { term: 'Name', value: draft.displayName.trim() || 'Not set' },
    { term: 'Age', value: labelsFor(AGE_BAND_OPTIONS, draft.ageBand ? [draft.ageBand] : []) },
    {
      term: 'Last period started',
      value: draft.lastPeriodStart
        ? formatCalendarDate(draft.lastPeriodStart)
        : "Not sure — we'll begin with your next one",
    },
    {
      term: 'Usual cycle length',
      value: draft.avgCycleLength ? `${draft.avgCycleLength} days` : 'Not sure',
    },
    {
      term: 'Usual period length',
      value: draft.avgPeriodLength ? `${draft.avgPeriodLength} days` : 'Not sure',
    },
    { term: 'Health context', value: labelsFor(CONDITION_OPTIONS, draft.conditions) },
    { term: 'Goals', value: labelsFor(GOAL_OPTIONS, draft.goals) },
    { term: 'Charting', value: tracking.length > 0 ? tracking.join(' and ') : 'Not for now' },
  ];

  return (
    <StepLayout
      title={
        draft.displayName.trim()
          ? `That's everything, ${draft.displayName.trim()}`
          : "That's everything"
      }
      intro="Have a quick look. Use Back to change anything — nothing has been saved yet."
    >
      <dl className="divide-y divide-primary/10 rounded-card bg-white px-4 ring-1 ring-primary/10">
        {rows.map((row) => (
          <div key={row.term} className="flex justify-between gap-4 py-3">
            <dt className="text-sm text-muted">{row.term}</dt>
            <dd className="max-w-[60%] text-right text-sm font-medium text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </StepLayout>
  );
}
