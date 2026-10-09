import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '@/hooks/useMe';

/**
 * Hides the admin panel from anyone who is not an author. This is a courtesy, not
 * the security boundary — every author route is also checked by the API (D7).
 */
export function RequireAuthor() {
  const me = useMe();
  if (me.isPending) return null;
  if (me.data?.role !== 'author') return <Navigate to="/" replace />;
  return <Outlet />;
}
