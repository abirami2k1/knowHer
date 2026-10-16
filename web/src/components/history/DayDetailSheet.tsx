import { useNavigate } from 'react-router-dom';
import { DaySummary } from '@/components/log/DaySummary';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { useDayLog } from '@/hooks/useLogs';
import { formatCalendarDate } from '@/lib/dates';
import { Loading, Skeleton } from '@/components/ui/Skeleton';

/**
 * A logged day, read-only, with one way through to editing it. Reuses the log's
 * own summary so a day reads identically wherever she meets it.
 */
export function DayDetailSheet({ date, onClose }: { date: string | null; onClose: () => void }) {
  const navigate = useNavigate();
  const day = useDayLog(date ?? '');

  return (
    <Sheet
      open={date !== null}
      onClose={onClose}
      title={date ? formatCalendarDate(date) : ''}
      footer={
        <Button variant="secondary" onClick={() => navigate(`/log?date=${date}`)}>
          Edit this day
        </Button>
      }
    >
      <div className="py-2">
        {day.isPending ? (
          <Loading label="Opening this day">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </Loading>
        ) : (
          <DaySummary log={day.log} />
        )}
      </div>
    </Sheet>
  );
}
