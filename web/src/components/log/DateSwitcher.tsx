import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCalendarDate, shiftDate, todayIsoDate } from '@/lib/dates';

/** Move between days to backfill. There is no tomorrow: future days cannot be logged. */
export function DateSwitcher({
  date,
  onChange,
}: {
  date: string;
  onChange: (date: string) => void;
}) {
  const today = todayIsoDate();
  const isToday = date === today;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(shiftDate(date, -1))}
        aria-label="Previous day"
        className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-surface text-ink ring-1 ring-line transition-colors hover:bg-surface-sunken"
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>

      <label className="flex-1 text-center">
        <span className="sr-only">Day to log</span>
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="min-h-11 w-full rounded-pill bg-surface px-3 text-center text-base font-medium text-ink ring-1 ring-line focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <span className="eyebrow mt-1.5 block text-muted">
          {isToday ? 'Today' : formatCalendarDate(date)}
        </span>
      </label>

      <button
        type="button"
        onClick={() => onChange(shiftDate(date, 1))}
        disabled={isToday}
        aria-label="Next day"
        className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-surface text-ink ring-1 ring-line transition-colors hover:bg-surface-sunken disabled:opacity-35"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </div>
  );
}
