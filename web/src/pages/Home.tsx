import { ArrowRight, CalendarDays, LineChart, PenLine, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ExpectedOvulation } from '@/components/home/ExpectedOvulation';
import { TodayCard } from '@/components/home/TodayCard';
import { Card, Eyebrow } from '@/components/ui/Card';
import { Loading, Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { lastFetchedDashboard, useDashboard } from '@/hooks/useDashboard';
import { useMe } from '@/hooks/useMe';
import { formatCalendarDate, todayIsoDate } from '@/lib/dates';

const SHORTCUTS = [
  {
    to: '/log',
    icon: PenLine,
    title: 'Log today',
    body: "Mood, energy, how you're feeling — and your temperature if you chart it.",
  },
  {
    to: '/cycle',
    icon: LineChart,
    title: 'Your chart',
    body: 'Temperatures, mucus and what they add up to — read after the fact, never predicted.',
  },
  {
    to: '/history',
    icon: CalendarDays,
    title: 'Your history',
    body: 'A calendar of the days you logged. Only what happened — nothing forecast.',
  },
  {
    to: '/trends',
    icon: TrendingUp,
    title: 'Your patterns',
    body: 'Cycle length, energy and symptoms over time — what your own cycles have shown.',
  },
];

export default function Home() {
  const me = useMe();
  const dashboard = useDashboard();
  const name = me.data?.displayName;
  // Only reached for: the app opened with no connection. Shown dated, never as today's.
  const cached = dashboard.isError ? lastFetchedDashboard() : null;
  const shown = dashboard.data ?? cached?.data;

  return (
    <div className="space-y-6">
      <header>
        <Eyebrow>{formatCalendarDate(todayIsoDate())}</Eyebrow>
        <h1 className="mt-2 font-display text-display text-ink">
          {name ? `Hello, ${name}` : 'Hello'}
        </h1>
      </header>

      {dashboard.isPending && (
        <Loading label="Reading your cycle">
          <Card className="space-y-3 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </Card>
          <SkeletonCard lines={1} />
        </Loading>
      )}

      {dashboard.isError && !cached && (
        <Card className="p-5">
          <p role="alert" className="text-primary">
            Couldn't load today. Check your connection and try again.
          </p>
        </Card>
      )}

      {cached && (
        <Card tone="quiet" className="p-5">
          <p className="text-sm leading-relaxed text-ink-soft">
            Couldn't reach knowHer, so this is your last reading, as of{' '}
            {formatAsOf(cached.fetchedAt)}
            {cached.today !== todayIsoDate() && ` on ${formatCalendarDate(cached.today)}`}.
          </p>
        </Card>
      )}

      {shown && (
        <>
          <TodayCard dashboard={shown} />
          <ExpectedOvulation expected={shown.expectedOvulation} />
        </>
      )}

      <nav aria-label="Shortcuts" className="space-y-3">
        {SHORTCUTS.map(({ to, icon: Icon, title, body }) => (
          <Link key={to} to={to} className="block rounded-card focus-visible:outline-2">
            <Card className="flex items-center gap-4 p-5 transition-colors hover:bg-surface-sunken">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-surface-sunken text-primary">
                <Icon aria-hidden className="size-5" strokeWidth={1.8} />
              </span>
              <span className="flex-1">
                <span className="block font-medium text-ink">{title}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted">{body}</span>
              </span>
              <ArrowRight aria-hidden className="size-4 shrink-0 text-muted" />
            </Card>
          </Link>
        ))}
      </nav>
    </div>
  );
}

/** "14:32" or "14:32 yesterday" — enough to judge how stale a reading is. */
function formatAsOf(iso: string): string {
  const at = new Date(iso);
  return at.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
