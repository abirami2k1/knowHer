import type { ReactNode } from 'react';

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
    <section className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {intro && <p className="text-muted">{intro}</p>}
      </header>
      {children}
      {why && (
        <p className="rounded-card bg-white/70 p-3 text-sm text-muted ring-1 ring-primary/10">
          <span className="font-medium text-ink">Why we ask: </span>
          {why}
        </p>
      )}
    </section>
  );
}
