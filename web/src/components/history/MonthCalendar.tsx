import type { HistoryDayDto } from '@shared/types';
import { monthGrid, WEEKDAYS } from '@/lib/month';

/** Bleeding days carry weight; spotting is a dot. Nothing else colours a day. */
const FLOW_STYLE: Record<string, string> = {
  spotting: 'bg-menstrual-tint text-menstrual',
  light: 'bg-menstrual/25 text-menstrual',
  medium: 'bg-menstrual/55 text-paper',
  heavy: 'bg-menstrual text-paper',
};

interface MonthCalendarProps {
  month: string;
  days: HistoryDayDto[];
  today: string;
  onSelect: (date: string) => void;
}

/**
 * A month of logged days.
 *
 * Every mark here is something she recorded. There is deliberately no shading
 * for an expected period or a predicted phase: on a calendar, a guess reads as a
 * fact, and this app does not do that.
 */
export function MonthCalendar({ month, days, today, onSelect }: MonthCalendarProps) {
  const { blanks, days: dates } = monthGrid(month);
  const byDate = new Map(days.map((day) => [day.date, day]));

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((weekday, i) => (
          <div key={i} className="eyebrow py-1 text-center text-muted">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: blanks }, (_, i) => (
          <div key={`blank-${i}`} aria-hidden />
        ))}

        {dates.map((date) => {
          const day = byDate.get(date);
          const dayNumber = Number(date.slice(-2));
          const isToday = date === today;
          const isFuture = date > today;
          const flowStyle = day?.flow && day.flow !== 'none' ? FLOW_STYLE[day.flow] : null;

          return (
            <button
              key={date}
              type="button"
              disabled={!day}
              onClick={() => onSelect(date)}
              aria-label={labelFor(date, day)}
              aria-current={isToday ? 'date' : undefined}
              className={`relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-2xl text-sm transition-colors ${
                flowStyle ?? (day ? 'bg-surface-sunken text-ink' : 'text-muted/50')
              } ${isFuture ? 'opacity-40' : ''} ${
                isToday ? 'ring-2 ring-ink ring-offset-1 ring-offset-paper' : ''
              } ${day ? 'cursor-pointer hover:brightness-95' : 'cursor-default'}`}
            >
              <span className={day?.isCycleStart ? 'font-semibold' : undefined}>{dayNumber}</span>

              <span aria-hidden className="mt-0.5 flex h-1.5 items-center gap-0.5">
                {day?.hasTemp && <span className="size-1.5 rounded-full bg-calm" />}
                {day && day.symptomCount > 0 && (
                  <span className="size-1.5 rounded-full bg-current opacity-50" />
                )}
              </span>

              {day?.isCycleStart && (
                <span
                  aria-hidden
                  className="absolute top-1 right-1 size-1.5 rounded-full bg-menstrual"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function labelFor(date: string, day: HistoryDayDto | undefined): string {
  const readable = new Date(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
  ).toLocaleDateString(undefined, { day: 'numeric', month: 'long' });

  if (!day) return `${readable}: nothing logged`;

  const parts = [
    day.isCycleStart ? 'period started' : null,
    day.flow && day.flow !== 'none' ? `${day.flow} flow` : null,
    day.hasTemp ? 'temperature logged' : null,
    day.symptomCount > 0 ? `${day.symptomCount} symptoms` : null,
  ].filter(Boolean);

  return `${readable}: ${parts.length ? parts.join(', ') : 'logged'}`;
}
