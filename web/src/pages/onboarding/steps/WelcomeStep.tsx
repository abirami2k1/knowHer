import { StepLayout } from './StepLayout';

export function WelcomeStep() {
  return (
    <StepLayout
      title="Welcome to knowHer"
      intro="A few short questions so the app fits your body — not a 28-day average of everyone else's."
    >
      <ul className="space-y-3 text-muted">
        <li className="rounded-card bg-white p-4 ring-1 ring-primary/10">
          You can answer <span className="font-medium text-ink">“I'm not sure”</span> anywhere. It
          is a real answer here, not a gap.
        </li>
        <li className="rounded-card bg-white p-4 ring-1 ring-primary/10">
          Nothing is saved until the last step, and you can change any of it later.
        </li>
        <li className="rounded-card bg-white p-4 ring-1 ring-primary/10">
          knowHer informs and keeps you company — it never diagnoses.
        </li>
      </ul>
    </StepLayout>
  );
}
