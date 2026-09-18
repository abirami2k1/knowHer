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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <header className="mb-8 space-y-2">
        <p className="text-sm font-medium text-primary">knowHer</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted">{intro}</p>
      </header>
      {children}
    </main>
  );
}
