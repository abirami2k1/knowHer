import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useMe } from '@/hooks/useMe';

export default function Profile() {
  const { email, signOut } = useAuth();
  const me = useMe();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  function onSignOut() {
    signOut();
    queryClient.clear(); // nothing of this user's stays in memory for the next one
    toast('Signed out. Take care.');
    navigate('/login', { replace: true });
  }

  return (
    <section aria-labelledby="profile-title" className="space-y-6">
      <header className="space-y-1">
        <h1 id="profile-title" className="text-2xl font-semibold tracking-tight">
          Profile
        </h1>
        <p className="text-muted">
          Your account, preferences and privacy controls arrive in Tasks 5 and 12.
        </p>
      </header>

      <dl className="rounded-card bg-white p-4 ring-1 ring-primary/5">
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-sm text-muted">Signed in as</dt>
          <dd className="truncate text-sm font-medium">{email ?? '—'}</dd>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-sm text-muted">Display name</dt>
          <dd className="text-sm font-medium">
            {me.isPending
              ? 'Loading…'
              : me.isError
                ? 'Unavailable'
                : (me.data.displayName ?? 'Not set yet')}
          </dd>
        </div>
        <div className="flex justify-between gap-4 py-1.5">
          <dt className="text-sm text-muted">Role</dt>
          <dd className="text-sm font-medium">{me.data?.role ?? '—'}</dd>
        </div>
      </dl>

      <Button variant="secondary" onClick={onSignOut}>
        Sign out
      </Button>
    </section>
  );
}
