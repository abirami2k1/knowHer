import { BottomNav } from './BottomNav';
import { PageTransition } from './PageTransition';

/**
 * Mobile-first shell: a single centered column (narrow on desktop too) with the
 * bottom nav pinned. The grain layer keeps the warm page from reading as flat.
 */
export function AppShell() {
  return (
    <div className="grain min-h-dvh">
      <div aria-hidden className="grain-after" />
      <main className="mx-auto w-full max-w-md px-5 pt-8 pb-32">
        <PageTransition />
      </main>
      <BottomNav />
    </div>
  );
}
