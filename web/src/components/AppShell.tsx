import { BottomNav } from './BottomNav';
import { PageTransition } from './PageTransition';

/**
 * Mobile-first shell: a single centered column (narrow on desktop too) with the
 * bottom nav pinned. Pages render through <PageTransition/>, which hosts the router outlet.
 */
export function AppShell() {
  return (
    <div className="min-h-dvh">
      <main className="mx-auto w-full max-w-md px-4 pt-6 pb-28">
        <PageTransition />
      </main>
      <BottomNav />
    </div>
  );
}
