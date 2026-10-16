import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DateSwitcher } from '@/components/log/DateSwitcher';
import { DaySummary } from '@/components/log/DaySummary';
import { LogForm } from '@/components/log/LogForm';
import { PeriodStartPrompt } from '@/components/log/PeriodStartPrompt';
import { Button } from '@/components/ui/Button';
import { Card, Eyebrow } from '@/components/ui/Card';
import { Sheet } from '@/components/ui/Sheet';
import { Loading, SkeletonCard } from '@/components/ui/Skeleton';
import { cycleCovers, useCycles, useStartCycle } from '@/hooks/useCycles';
import { toBody, useLogDraft } from '@/hooks/useLogDraft';
import { useDayLog, useSaveLog } from '@/hooks/useLogs';
import { useMe } from '@/hooks/useMe';
import { formatCalendarDate, todayIsoDate } from '@/lib/dates';
import { friendlyError } from '@/lib/errors';
import { PERIOD_FLOWS } from '@/pages/log/copy';

export default function Log() {
  // ?date= lets the history calendar hand a specific day straight to the editor.
  const [searchParams] = useSearchParams();
  const requested = searchParams.get('date');
  const [date, setDate] = useState(
    requested && requested <= todayIsoDate() ? requested : todayIsoDate(),
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const me = useMe();
  const day = useDayLog(date);
  const cycles = useCycles();
  const save = useSaveLog();
  const startCycle = useStartCycle();
  const { draft, set, toggleSymptom } = useLogDraft(day.log, date);

  async function onSave() {
    try {
      const outcome = await save.mutateAsync(toBody(draft, date, todayIsoDate()));
      setSheetOpen(false);

      if (outcome.queued) {
        // Held on the device until there is a connection. Starting a cycle is a
        // boundary the server owns, so the period-start question waits too —
        // she is asked next time she opens this day online.
        toast.success("Saved on this device. It'll sync when you're back online.");
        return;
      }

      toast.success('Saved.');
      // Bleeding beyond spotting on a day no cycle covers → ask, never assume (D3).
      const { flow } = outcome.log;
      if (flow && PERIOD_FLOWS.includes(flow) && !cycleCovers(cycles.data, date)) {
        setPromptOpen(true);
      }
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }

  async function onConfirmPeriodStart() {
    try {
      await startCycle.mutateAsync({ startDate: date, today: todayIsoDate() });
      setPromptOpen(false);
      toast.success('New cycle started.');
    } catch (error) {
      toast.error(friendlyError(error));
    }
  }

  return (
    <section aria-labelledby="log-title" className="space-y-6">
      <header>
        <Eyebrow>Daily log</Eyebrow>
        <h1 id="log-title" className="mt-2 font-display text-display text-ink">
          How was today?
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          One entry a day. Past days are always open to fill in.
        </p>
      </header>

      <DateSwitcher date={date} onChange={setDate} />

      {day.isPending ? (
        <Loading label="Opening this day">
          <SkeletonCard lines={2} />
        </Loading>
      ) : day.isError ? (
        <Card className="p-5">
          <p role="alert" className="text-primary">
            Couldn't load this day. Check your connection and try again.
          </p>
        </Card>
      ) : (
        <DaySummary log={day.log} />
      )}

      <Button onClick={() => setSheetOpen(true)} disabled={day.isPending}>
        {day.log ? 'Edit this day' : 'Log this day'}
      </Button>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={date === todayIsoDate() ? 'Today' : formatCalendarDate(date)}
        footer={
          <Button onClick={onSave} loading={save.isPending}>
            Save
          </Button>
        }
      >
        <LogForm
          draft={draft}
          set={set}
          toggleSymptom={toggleSymptom}
          trackingBBT={me.data?.trackingBBT ?? false}
          trackingMucus={me.data?.trackingMucus ?? false}
        />
      </Sheet>

      <PeriodStartPrompt
        open={promptOpen}
        date={date}
        saving={startCycle.isPending}
        onConfirm={onConfirmPeriodStart}
        onDismiss={() => setPromptOpen(false)}
      />
    </section>
  );
}
