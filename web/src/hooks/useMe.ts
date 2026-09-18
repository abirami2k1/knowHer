import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/lib/api/me';
import { useAuth } from './useAuth';

/** The signed-in user's profile from GET /me. Only runs once auth has a session. */
export function useMe() {
  const { status } = useAuth();
  return useQuery({ queryKey: ['me'], queryFn: getMe, enabled: status === 'authed' });
}
