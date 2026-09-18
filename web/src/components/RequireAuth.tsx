import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Route guard. Anonymous → /login (remembering where they were headed).
 * While the stored session is being restored, render nothing rather than flashing the login screen.
 * (Task 5 adds: signed in but not onboarded → /onboarding.)
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return null;
  if (status !== 'authed') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
