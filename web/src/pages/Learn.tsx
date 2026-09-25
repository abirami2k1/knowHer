import { Card, Eyebrow } from '@/components/ui/Card';

export default function Learn() {
  return (
    <section aria-labelledby="learn-title" className="space-y-5">
      <header>
        <Eyebrow>Learn</Eyebrow>
        <h1 id="learn-title" className="mt-2 font-display text-display text-ink">
          Worth knowing
        </h1>
      </header>
      <Card tone="quiet" className="p-5">
        <p className="text-[15px] leading-relaxed text-ink-soft">
          Period basics, notes from Sivi, and guidance for the people around you arrive in Task 11.
        </p>
      </Card>
    </section>
  );
}
