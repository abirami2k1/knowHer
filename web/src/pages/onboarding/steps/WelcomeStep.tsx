import { Card } from '@/components/ui/Card';
import { StepLayout } from './StepLayout';

export function WelcomeStep() {
  return (
    <StepLayout
      title="Welcome to knowHer"
      intro="A few short questions so the app fits your body — not a 28-day average of everyone else's."
    >
      <ul className="space-y-3">
        <li>
          <Card className="p-4 text-[15px] leading-relaxed text-ink-soft">
            You can answer <span className="font-medium text-ink">“I'm not sure”</span> anywhere. It
            is a real answer here, not a gap.
          </Card>
        </li>
        <li>
          <Card className="p-4 text-[15px] leading-relaxed text-ink-soft">
            Nothing is saved until the last step, and you can change any of it later.
          </Card>
        </li>
        <li>
          <Card className="p-4 text-[15px] leading-relaxed text-ink-soft">
            knowHer informs and keeps you company — it never diagnoses.
          </Card>
        </li>
      </ul>
    </StepLayout>
  );
}
