import { useState } from 'react';
import { BbtChart } from '@/components/cycle/BbtChart';
import { CycleFacts } from '@/components/cycle/CycleFacts';
import { CycleNotes } from '@/components/cycle/CycleNotes';
import { MucusRow } from '@/components/cycle/MucusRow';
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
    return <p className="rounded-card bg-white p-4 text-muted ring-1 ring-primary/10">Loading…</p>;
  }

  if (!cycles.data?.length) {
    return (
      <section aria-labelledby="cycle-title" className="space-y-4">
        <h1 id="cycle-title" className="text-2xl font-semibold tracking-tight">
          Your chart
        </h1>
        <p className="rounded-card bg-white p-4 text-muted ring-1 ring-primary/10">
          Your chart begins with your first period start. Log one from the daily log and it will
          appear here.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="cycle-title" className="space-y-5">
      <header className="space-y-1">
        <h1 id="cycle-title" className="text-2xl font-semibold tracking-tight">
          Your chart
        </h1>
        <p className="text-muted">
          Ovulation is only ever confirmed after it has happened — never predicted.
        </p>
      </header>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink">Cycle</span>
        <select
          value={cycleId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="min-h-12 w-full rounded-card bg-white px-3 text-base text-ink ring-1 ring-primary/20 focus:ring-2 focus:ring-primary focus:outline-none"
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
        <p className="rounded-card bg-white p-4 text-muted ring-1 ring-primary/10">
          Reading your chart…
        </p>
      )}

      {assessment.isError && (
        <p role="alert" className="rounded-card bg-white p-4 text-primary ring-1 ring-primary/10">
          Couldn't load this cycle. Check your connection and try again.
        </p>
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
