import type { AgeBand } from '@shared/types';
import { ChoiceList } from '@/components/ui/ChoiceList';
import { Field } from '@/components/ui/Field';
import type { OnboardingDraft } from '@/hooks/useOnboarding';
import { AGE_BAND_OPTIONS, WHY } from '../copy';
import { StepLayout } from './StepLayout';

interface StepProps {
  draft: OnboardingDraft;
  set: (patch: Partial<OnboardingDraft>) => void;
}

export function ProfileStep({ draft, set }: StepProps) {
  return (
    <StepLayout title="First, what should we call you?" why={WHY.profile}>
      <Field
        label="Your name"
        name="displayName"
        autoComplete="given-name"
        maxLength={40}
        value={draft.displayName}
        onChange={(e) => set({ displayName: e.target.value })}
      />
      <ChoiceList<AgeBand>
        legend="Your age"
        options={AGE_BAND_OPTIONS}
        selected={draft.ageBand ? [draft.ageBand] : []}
        onSelect={(ageBand) => set({ ageBand })}
      />
    </StepLayout>
  );
}
