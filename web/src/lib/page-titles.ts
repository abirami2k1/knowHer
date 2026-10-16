/**
 * What each route is called. A single-page app that never changes its title
 * leaves a screen-reader user with no idea they have moved, and gives the
 * browser's history and tab list nothing to tell apart.
 */
const TITLES: Record<string, string> = {
  '/': 'Today',
  '/log': 'Daily log',
  '/cycle': 'Your chart',
  '/history': 'Your history',
  '/trends': 'Your patterns',
  '/learn': 'Learn',
  '/profile': 'Your account',
  '/admin': 'Posts',
  '/onboarding': 'Welcome',
  '/login': 'Sign in',
  '/signup': 'Create your account',
};

/** "Daily log · knowHer". Unknown paths fall back to the app's own name. */
export function titleFor(pathname: string): string {
  const name =
    TITLES[pathname] ??
    (pathname.startsWith('/learn/')
      ? 'Reading'
      : pathname.startsWith('/admin/')
        ? 'Editing'
        : null);
  return name ? `${name} · knowHer` : 'knowHer';
}
