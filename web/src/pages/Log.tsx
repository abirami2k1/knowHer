import { useState } from 'react';
import { toast } from 'sonner';
import { DateSwitcher } from '@/components/log/DateSwitcher';
import { DaySummary } from '@/components/log/DaySummary';
import { LogForm } from '@/components/log/LogForm';
import { PeriodStartPrompt } from '@/components/log/PeriodStartPrompt';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { cycleCovers, useCycles, useStartCycle } from '@/hooks/useCycles';
import { toBody, useLogDraft } from '@/hooks/useLogDraft';
import { useDayLog, useSaveLog } from '@/hooks/useLogs';
import { useMe } from '@/hooks/useMe';
import { todayIsoDate } from '@/lib/dates';
import { PERIOD_FLOWS } from '@/pages/log/copy';

export default function Log() {
  const [date, setDate] = useState(todayIsoDate());
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
      const saved = await save.mutateAsync(toBody(draft, date, todayIsoDate()));
      setSheetOpen(false);
      toast.success('Saved.');
      // Bleeding beyond spotting on a day no cycle covers → ask, never assume (D3).
      if (saved.flow && PERIOD_FLOWS.includes(saved.flow) && !cycleCovers(cycles.data, date)) {
        setPromptOpen(true);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function onConfirmPeriodStart() {
    try {
      await startCycle.mutateAsync({ startDate: date, today: todayIsoDate() });
      setPromptOpen(false);
      toast.success('New cycle started.');
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <section aria-labelledby="log-title" className="space-y-5">
      <header className="space-y-1">
        <h1 id="log-title" className="text-2xl font-semibold tracking-tight">
          Daily log
        </h1>
        <p className="text-muted">One entry a day. Past days are always open to fill in.</p>
      </header>

      <DateSwitcher date={date} onChange={setDate} />

      {day.isPending ? (
        <p className="rounded-card bg-white p-4 text-muted ring-1 ring-primary/10">Loading…</p>
      ) : day.isError ? (
        <p role="alert" className="rounded-card bg-white p-4 text-primary ring-1 ring-primary/10">
          Couldn't load this day. Check your connection and try again.
        </p>
      ) : (
        <DaySummary log={day.log} />
      )}

      <Button onClick={() => setSheetOpen(true)} disabled={day.isPending}>
        {day.log ? 'Edit this day' : 'Log this day'}
      </Button>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={date === todayIsoDate() ? 'Today' : date}
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
