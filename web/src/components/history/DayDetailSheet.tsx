import { useNavigate } from 'react-router-dom';
import { DaySummary } from '@/components/log/DaySummary';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { useDayLog } from '@/hooks/useLogs';
import { formatCalendarDate } from '@/lib/dates';

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
        {day.isPending ? <p className="text-muted">Loading…</p> : <DaySummary log={day.log} />}
      </div>
    </Sheet>
  );
}
