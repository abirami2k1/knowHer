import { ChoiceList } from '@/components/ui/ChoiceList';
import type { OnboardingDraft } from '@/hooks/useOnboarding';
import { WHY } from '../copy';
import { StepLayout } from './StepLayout';

const TRACKING_OPTIONS = [
  {
    value: 'bbt' as const,
    label: 'Waking temperature (BBT)',
    hint: 'One reading before you get out of bed, in °F.',
  },
  {
    value: 'mucus' as const,
    label: 'Cervical mucus',
    hint: 'Dry → sticky → watery → egg-white.',
  },
];

export function TrackingStep({
  draft,
  set,
}: {
  draft: OnboardingDraft;
  set: (patch: Partial<OnboardingDraft>) => void;
}) {
  const selected = [
    ...(draft.trackingBBT ? (['bbt'] as const) : []),
    ...(draft.trackingMucus ? (['mucus'] as const) : []),
  ];

  return (
    <StepLayout
      title="Would you like to chart ovulation?"
      intro="Both are optional, and you can start either one later. Skipping this changes nothing else."
      why={WHY.tracking}
    >
      <ChoiceList
        legend="What you'd like to track"
        options={TRACKING_OPTIONS}
        selected={selected}
        onSelect={(value) =>
          set(
            value === 'bbt'
              ? { trackingBBT: !draft.trackingBBT }
              : { trackingMucus: !draft.trackingMucus },
          )
        }
        multiple
      />
      <p className="rounded-card bg-white p-4 text-sm text-muted ring-1 ring-primary/10">
        knowHer confirms ovulation a few days <span className="font-medium text-ink">after</span> it
        happens, from your own readings. It will never tell you in advance that you are ovulating.
      </p>
    </StepLayout>
  );
}
