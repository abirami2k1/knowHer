import type { ReactNode } from 'react';

/** Centered narrow column for the sign-in / sign-up screens (no bottom nav). */
export function AuthLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="grain mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <div aria-hidden className="grain-after" />
      <header className="mb-9">
        <p className="eyebrow text-primary">knowHer</p>
        <h1 className="mt-3 font-display text-display text-ink">{title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{intro}</p>
      </header>
      {children}
    </main>
  );
}
