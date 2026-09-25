import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMe } from '@/hooks/useMe';

/**
 * Route guard. Anonymous → /login (remembering where they were headed).
 * While the stored session is being restored, render nothing rather than flashing the login screen.
 * Signed in but not yet onboarded → /onboarding (the flow itself sends finished users back).
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  const me = useMe();

  if (status === 'loading') return null;
  if (status !== 'authed') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // Wait for the profile before deciding, so nobody is bounced on a slow first load.
  if (me.isPending) return null;
  if (me.data && !me.data.onboardedAt && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}
