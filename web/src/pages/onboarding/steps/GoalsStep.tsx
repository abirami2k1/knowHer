import type { Goal } from '@shared/types';
import { ChoiceList } from '@/components/ui/ChoiceList';
import type { OnboardingDraft } from '@/hooks/useOnboarding';
import { GOAL_OPTIONS, WHY } from '../copy';
import { StepLayout } from './StepLayout';

export function GoalsStep({
  draft,
  toggleGoal,
}: {
  draft: OnboardingDraft;
  toggleGoal: (value: Goal) => void;
}) {
  return (
    <StepLayout
      title="What would you like knowHer to help with?"
      intro="Choose as many as you like."
      why={WHY.goals}
    >
      <ChoiceList<Goal>
        legend="Your goals"
        options={GOAL_OPTIONS}
        selected={draft.goals}
        onSelect={toggleGoal}
        multiple
      />
    </StepLayout>
  );
}
