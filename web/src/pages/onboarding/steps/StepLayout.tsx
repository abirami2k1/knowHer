import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

/** Shared frame for every step: heading, the reason we ask, then the controls. */
export function StepLayout({
  title,
  intro,
  why,
  children,
}: {
  title: string;
  intro?: string;
  why?: string;
  children?: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-title text-ink">{title}</h1>
        {intro && <p className="text-[15px] leading-relaxed text-muted">{intro}</p>}
      </header>
      {children}
      {why && (
        <Card tone="quiet" className="p-4">
          <p className="text-sm leading-relaxed text-ink-soft">
            <span className="font-medium text-ink">Why we ask: </span>
            {why}
          </p>
        </Card>
      )}
    </section>
  );
}
