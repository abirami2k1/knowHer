import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DayDetailSheet } from '@/components/history/DayDetailSheet';
import { MonthCalendar } from '@/components/history/MonthCalendar';
import { Card, Eyebrow } from '@/components/ui/Card';
import { useHistory } from '@/hooks/useHistory';
import { todayIsoDate } from '@/lib/dates';
import { monthLabel, monthOf, shiftMonth } from '@/lib/month';
import { EmptyState } from '@/components/ui/EmptyState';

const NAV_BUTTON =
  'flex size-11 shrink-0 items-center justify-center rounded-pill bg-surface text-ink ring-1 ring-line transition-colors hover:bg-surface-sunken disabled:opacity-35';

/**
 * The calendar of what actually happened. It shows logged days only — the API
 * sends nothing forward-looking, and this screen invents nothing.
 */
export default function History() {
  const today = todayIsoDate();
  const [month, setMonth] = useState(monthOf(today));
  const [selected, setSelected] = useState<string | null>(null);
  const history = useHistory(month);

  const isCurrentMonth = month === monthOf(today);

  return (
    <section aria-labelledby="history-title" className="space-y-6">
      <header>
        <Eyebrow>Your history</Eyebrow>
        <h1 id="history-title" className="mt-2 font-display text-display text-ink">
          What you logged
        </h1>
      </header>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, -1))}
          aria-label="Previous month"
          className={NAV_BUTTON}
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <h2 aria-live="polite" className="flex-1 text-center font-display text-title text-ink">
          {monthLabel(month)}
        </h2>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, 1))}
          disabled={isCurrentMonth}
          aria-label="Next month"
          className={NAV_BUTTON}
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>

      <Card className="p-4">
        {history.isError ? (
          <p role="alert" className="text-primary">
            Couldn't load this month. Check your connection and try again.
          </p>
        ) : (
          <MonthCalendar
            month={month}
            days={history.data ?? []}
            today={today}
            onSelect={setSelected}
          />
        )}
      </Card>

      {history.data?.length === 0 && !history.isPending && (
        <EmptyState
          icon={CalendarDays}
          title={`Nothing logged in ${monthLabel(month)}`}
          body="Days you fill in will show up here — only what you actually recorded, never a guess about what is coming."
        />
      )}

      <Card tone="quiet" className="p-4">
        <Eyebrow className="mb-2">What the marks mean</Eyebrow>
        <ul className="space-y-1.5 text-sm text-ink-soft">
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-full bg-menstrual" /> Bleeding — deeper
            means heavier
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-full bg-calm" /> Temperature logged
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="size-3 rounded-full bg-ink/40" /> Symptoms noted
          </li>
        </ul>
      </Card>

      <DayDetailSheet date={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
