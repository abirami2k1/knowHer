import type { Condition } from '@shared/types';
import { ChoiceList } from '@/components/ui/ChoiceList';
import type { OnboardingDraft } from '@/hooks/useOnboarding';
import { CONDITION_OPTIONS, WHY } from '../copy';
import { StepLayout } from './StepLayout';

export function HealthStep({
  draft,
  toggleCondition,
}: {
  draft: OnboardingDraft;
  toggleCondition: (value: Condition) => void;
}) {
  return (
    <StepLayout
      title="Anything your cycle should be read alongside?"
      intro="Pick any that apply. knowHer uses this for context only — it never diagnoses."
      why={WHY.health}
    >
      <ChoiceList<Condition>
        legend="Conditions"
        options={CONDITION_OPTIONS}
        selected={draft.conditions}
        onSelect={toggleCondition}
        multiple
      />
    </StepLayout>
  );
}
