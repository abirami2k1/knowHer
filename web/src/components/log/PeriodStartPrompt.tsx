import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { formatCalendarDate } from '@/lib/dates';

/**
 * A period start is always her decision, never inferred from a flow log (D3).
 * Declining leaves the bleeding day exactly as logged; it simply does not begin
 * a cycle.
 */
export function PeriodStartPrompt({
  open,
  date,
  saving,
  onConfirm,
  onDismiss,
}: {
  open: boolean;
  date: string;
  saving: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  return (
    <Sheet open={open} onClose={onDismiss} title="Is this the start of your period?">
      <p className="text-muted">
        You logged bleeding on {formatCalendarDate(date)}. If that was the first day of your period,
        knowHer will start a new cycle from it.
      </p>
      <p className="mt-3 text-sm text-muted">
        If you're not sure, leave it for now — the day stays logged either way, and you can say so
        later.
      </p>
      <div className="mt-6 space-y-3">
        <Button onClick={onConfirm} loading={saving}>
          Yes, my period started
        </Button>
        <Button variant="secondary" onClick={onDismiss} disabled={saving}>
          Not the start
        </Button>
      </div>
    </Sheet>
  );
}
