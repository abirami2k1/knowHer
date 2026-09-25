import { ChoiceList } from '@/components/ui/ChoiceList';
import { Field } from '@/components/ui/Field';
import type { OnboardingDraft } from '@/hooks/useOnboarding';
import { todayIsoDate } from '@/lib/dates';
import { CYCLE_LENGTH_HINT, PERIOD_LENGTH_HINT, WHY } from '../copy';
import { StepLayout } from './StepLayout';

interface StepProps {
  draft: OnboardingDraft;
  set: (patch: Partial<OnboardingDraft>) => void;
}

const KNOWS_OPTIONS = [
  { value: 'yes' as const, label: 'Yes, I can pick the date' },
  { value: 'not_sure' as const, label: "I'm not sure" },
];

export function HistoryStep({ draft, set }: StepProps) {
  return (
    <StepLayout
      title="When did your last period start?"
      intro="Just the first day of bleeding, as best you remember."
      why={WHY.history}
    >
      <ChoiceList
        legend="Do you know the date?"
        options={KNOWS_OPTIONS}
        selected={draft.knowsLastPeriod ? [draft.knowsLastPeriod] : []}
        onSelect={(knowsLastPeriod) =>
          set({ knowsLastPeriod, ...(knowsLastPeriod === 'not_sure' && { lastPeriodStart: '' }) })
        }
      />

      {draft.knowsLastPeriod === 'yes' && (
        <Field
          label="First day of your last period"
          type="date"
          name="lastPeriodStart"
          max={todayIsoDate()}
          value={draft.lastPeriodStart}
          onChange={(e) => set({ lastPeriodStart: e.target.value })}
        />
      )}

      {draft.knowsLastPeriod === 'not_sure' && (
        <p className="rounded-card bg-white p-4 text-muted ring-1 ring-primary/10">
          That's completely fine. We'll start your first cycle the day you log your next period —
          nothing is guessed in the meantime.
        </p>
      )}

      <div className="space-y-4">
        <Field
          label="Usual cycle length (optional)"
          type="number"
          inputMode="numeric"
          name="avgCycleLength"
          min={15}
          max={90}
          hint={CYCLE_LENGTH_HINT}
          value={draft.avgCycleLength}
          onChange={(e) => set({ avgCycleLength: e.target.value })}
        />
        <Field
          label="Usual period length (optional)"
          type="number"
          inputMode="numeric"
          name="avgPeriodLength"
          min={1}
          max={15}
          hint={PERIOD_LENGTH_HINT}
          value={draft.avgPeriodLength}
          onChange={(e) => set({ avgPeriodLength: e.target.value })}
        />
      </div>
    </StepLayout>
  );
}
