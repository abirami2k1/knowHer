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
        className="flex size-11 shrink-0 items-center justify-center rounded-card bg-white text-ink ring-1 ring-primary/20 hover:bg-bg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
          className="min-h-11 w-full rounded-card bg-white px-3 text-center text-base font-medium text-ink ring-1 ring-primary/20 focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <span className="mt-1 block text-sm text-muted">
          {isToday ? 'Today' : formatCalendarDate(date)}
        </span>
      </label>

      <button
        type="button"
        onClick={() => onChange(shiftDate(date, 1))}
        disabled={isToday}
        aria-label="Next day"
        className="flex size-11 shrink-0 items-center justify-center rounded-card bg-white text-ink ring-1 ring-primary/20 hover:bg-bg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40"
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </div>
  );
}
