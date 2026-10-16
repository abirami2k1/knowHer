import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { titleFor } from '@/lib/page-titles';

/**
 * Names the page on every route change. It wraps every route, including the
 * ones outside the shell (sign-in, onboarding), because a single-page app that
 * never changes its title leaves a screen-reader user with no signal that they
 * have moved — and gives the back button and the tab list nothing to tell apart.
 */
export function TitleSync() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = titleFor(pathname);
  }, [pathname]);
  return <Outlet />;
}
