import type { TrendsDto } from '@shared/types';
import { EnergyByPhase } from '@/components/trends/EnergyByPhase';
import { SymptomPatterns } from '@/components/trends/SymptomPatterns';
import { TrendLine } from '@/components/trends/TrendLine';
import { TrendSection } from '@/components/trends/TrendSection';
import { Card, Eyebrow } from '@/components/ui/Card';
import { useTrends } from '@/hooks/useTrends';
import { formatCalendarDate } from '@/lib/dates';

const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;

/**
 * Patterns over her cycles. Every number and every sentence about her cycle
 * comes from the API; this screen lays them out and computes nothing.
 */
export default function Trends() {
  const trends = useTrends();

  return (
    <div className="space-y-5">
      <header>
        <Eyebrow>Your patterns</Eyebrow>
        <h1 className="mt-2 font-display text-display text-ink">Over time</h1>
        {trends.data?.recent.since && (
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Energy and symptoms from your last {trends.data.recent.cycles}{' '}
            {trends.data.recent.cycles === 1 ? 'cycle' : 'cycles'}, since{' '}
            {formatCalendarDate(trends.data.recent.since)}.
          </p>
        )}
      </header>

      {trends.isPending && (
        <Card tone="quiet" className="p-5">
          <p className="text-muted">Gathering your patterns…</p>
        </Card>
      )}

      {trends.isError && (
        <Card className="p-5">
          <p role="alert" className="text-primary">
            Couldn't load your patterns. Check your connection and try again.
          </p>
        </Card>
      )}

      {trends.data && <TrendsBody data={trends.data} />}
    </div>
  );
}

function TrendsBody({ data }: { data: TrendsDto }) {
  const { lengths, notes } = data;
  const luteal = data.cycles.flatMap((c) =>
    c.lutealLength === null ? [] : [{ startDate: c.startDate, value: c.lutealLength }],
  );

  return (
    <>
      <TrendSection
        id="trend-length"
        eyebrow="Cycle length"
        title="How long your cycles run"
        note={notes.lengths}
      >
        {lengths.typical !== null && (
          <dl className="flex gap-6">
            <div>
              <dt className="eyebrow text-muted">Typical</dt>
              <dd className="mt-1 font-display text-title text-ink">{days(lengths.typical)}</dd>
            </div>
            {lengths.shortest !== lengths.longest && (
              <div>
                <dt className="eyebrow text-muted">Range</dt>
                <dd className="mt-1 font-display text-title text-ink">
                  {lengths.shortest}–{lengths.longest}
                </dd>
              </div>
            )}
          </dl>
        )}
        {data.cycles.length > 0 && (
          <TrendLine
            points={data.cycles.map((c) => ({ startDate: c.startDate, value: c.length }))}
            color="var(--color-primary)"
            typical={lengths.typical}
            describe={days}
          />
        )}
      </TrendSection>

      <TrendSection
        id="trend-luteal"
        eyebrow="Luteal phase"
        title="After ovulation"
        note={notes.luteal}
      >
        {luteal.length > 0 && (
          <TrendLine points={luteal} color="var(--color-luteal)" describe={days} />
        )}
      </TrendSection>

      <TrendSection
        id="trend-energy"
        eyebrow="Energy"
        title="Your energy, phase by phase"
        note={notes.energy}
      >
        {data.energyByPhase.some((row) => row.days > 0) && (
          <EnergyByPhase rows={data.energyByPhase} />
        )}
        {notes.energyEstimated && (
          <p className="text-sm leading-relaxed text-muted">{notes.energyEstimated}</p>
        )}
      </TrendSection>

      <TrendSection
        id="trend-symptoms"
        eyebrow="Symptoms"
        title="What you've noticed"
        note={notes.symptoms}
      >
        {data.symptoms.length > 0 && <SymptomPatterns rows={data.symptoms} />}
      </TrendSection>
    </>
  );
}
