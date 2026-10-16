import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { YourData } from '@/components/profile/YourData';
import { Button } from '@/components/ui/Button';
import { Card, Eyebrow } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useMe } from '@/hooks/useMe';

export default function Profile() {
  const { email, signOut } = useAuth();
  const me = useMe();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  function leave(message: string) {
    signOut();
    queryClient.clear(); // nothing of this user's stays in memory for the next one
    toast(message);
    navigate('/login', { replace: true });
  }
  const onSignOut = () => leave('Signed out. Take care.');
  const onDeleted = () => leave('Your account and all your data have been deleted. Take care.');

  const rows: [string, string][] = [
    ['Signed in as', email ?? '—'],
    [
      'Name',
      me.isPending
        ? 'Loading…'
        : me.isError
          ? 'Unavailable'
          : (me.data.displayName ?? 'Not set yet'),
    ],
    ['Charting', trackingLabel(me.data?.trackingBBT, me.data?.trackingMucus)],
    ['Role', me.data?.role ?? '—'],
  ];

  return (
    <section aria-labelledby="profile-title" className="space-y-6">
      <header>
        <Eyebrow>Your account</Eyebrow>
        <h1 id="profile-title" className="mt-2 font-display text-display text-ink">
          {me.data?.displayName ?? 'You'}
        </h1>
      </header>

      <Card>
        <dl className="divide-y divide-line px-5">
          {rows.map(([term, value]) => (
            <div key={term} className="flex justify-between gap-4 py-3.5">
              <dt className="text-sm text-muted">{term}</dt>
              <dd className="max-w-[60%] truncate text-right text-sm font-medium text-ink">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      {me.data?.role === 'author' && (
        <Link
          to="/admin"
          className="flex min-h-12 items-center justify-center rounded-pill bg-surface px-5 font-medium text-primary ring-1 ring-line hover:bg-surface-sunken"
        >
          Write and publish posts
        </Link>
      )}

      <YourData onDeleted={onDeleted} />

      <Button variant="secondary" onClick={onSignOut}>
        Sign out
      </Button>
    </section>
  );
}

function trackingLabel(bbt?: boolean, mucus?: boolean): string {
  const signals = [bbt && 'temperature', mucus && 'mucus'].filter(Boolean);
  return signals.length ? signals.join(' and ') : 'Not charting';
}
