import { useState } from 'react';
import { BbtChart } from '@/components/cycle/BbtChart';
import { CycleFacts } from '@/components/cycle/CycleFacts';
import { CycleNotes } from '@/components/cycle/CycleNotes';
import { MucusRow } from '@/components/cycle/MucusRow';
import { Card, Eyebrow } from '@/components/ui/Card';
import { useAssessment } from '@/hooks/useAssessment';
import { useCycles } from '@/hooks/useCycles';
import { formatCalendarDate } from '@/lib/dates';

/**
 * The cycle chart. Every value shown is decided by the API's rule engine —
 * this screen contains no cycle math of its own.
 */
export default function Cycle() {
  const cycles = useCycles();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cycleId = selectedId ?? cycles.data?.[0]?.id;
  const assessment = useAssessment(cycleId);

  if (cycles.isPending) {
    return (
      <Card tone="quiet" className="p-5">
        <p className="text-muted">Loading…</p>
      </Card>
    );
  }

  if (!cycles.data?.length) {
    return (
      <section aria-labelledby="cycle-title" className="space-y-5">
        <header>
          <Eyebrow>Your chart</Eyebrow>
          <h1 id="cycle-title" className="mt-2 font-display text-display text-ink">
            Not started yet
          </h1>
        </header>
        <Card tone="quiet" className="p-5">
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Your chart begins with your first period start. Log one from the daily log and it will
            appear here.
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section aria-labelledby="cycle-title" className="space-y-5">
      <header>
        <Eyebrow>Your chart</Eyebrow>
        <h1 id="cycle-title" className="mt-2 font-display text-display text-ink">
          Reading the pattern
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Ovulation is only ever confirmed after it has happened — never predicted.
        </p>
      </header>

      <label className="block">
        <span className="eyebrow mb-2 block text-muted">Cycle</span>
        <select
          value={cycleId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="min-h-12 w-full rounded-pill bg-surface px-4 text-base text-ink ring-1 ring-line focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {cycles.data.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {formatCalendarDate(cycle.startDate)}
              {cycle.endDate ? '' : ' · current'}
            </option>
          ))}
        </select>
      </label>

      {assessment.isPending && (
        <Card tone="quiet" className="p-5">
          <p className="text-muted">Reading your chart…</p>
        </Card>
      )}

      {assessment.isError && (
        <Card className="p-5">
          <p role="alert" className="text-primary">
            Couldn't load this cycle. Check your connection and try again.
          </p>
        </Card>
      )}

      {assessment.data && (
        <>
          <BbtChart assessment={assessment.data.assessment} />
          <MucusRow series={assessment.data.assessment.series} />
          <CycleFacts cycle={assessment.data.cycle} assessment={assessment.data.assessment} />
          <CycleNotes {...assessment.data} />
        </>
      )}
    </section>
  );
}
