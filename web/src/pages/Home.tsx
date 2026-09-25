import { Link } from 'react-router-dom';
import { ExpectedOvulation } from '@/components/home/ExpectedOvulation';
import { TodayCard } from '@/components/home/TodayCard';
import { useDashboard } from '@/hooks/useDashboard';
import { useMe } from '@/hooks/useMe';

const CARD =
  'block rounded-card bg-white p-4 ring-1 ring-primary/10 hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export default function Home() {
  const me = useMe();
  const dashboard = useDashboard();
  const name = me.data?.displayName;

  return (
    <section aria-labelledby="home-title" className="space-y-5">
      <header className="space-y-1">
        <p className="text-sm text-muted">{name ? `Hello, ${name}` : 'Welcome to'}</p>
        <h1 id="home-title" className="text-3xl font-semibold tracking-tight text-primary">
          knowHer
        </h1>
      </header>

      {dashboard.isPending && (
        <p className="rounded-card bg-white p-4 text-muted ring-1 ring-primary/10">
          Reading your cycle…
        </p>
      )}

      {dashboard.isError && (
        <p role="alert" className="rounded-card bg-white p-4 text-primary ring-1 ring-primary/10">
          Couldn't load today. Check your connection and try again.
        </p>
      )}

      {dashboard.data && (
        <>
          <TodayCard dashboard={dashboard.data} />
          <ExpectedOvulation expected={dashboard.data.expectedOvulation} />
        </>
      )}

      <nav aria-label="Shortcuts" className="space-y-3">
        <Link to="/log" className={CARD}>
          <h2 className="text-base font-medium text-ink">Log today</h2>
          <p className="mt-1 text-sm text-muted">
            Mood, energy, how you're feeling — and your temperature if you chart it.
          </p>
        </Link>
        <Link to="/cycle" className={CARD}>
          <h2 className="text-base font-medium text-ink">Your chart</h2>
          <p className="mt-1 text-sm text-muted">
            Temperatures, mucus and what they add up to — confirmed after the fact, never predicted.
          </p>
        </Link>
      </nav>
    </section>
  );
}
