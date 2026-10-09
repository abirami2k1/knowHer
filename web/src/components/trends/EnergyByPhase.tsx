import type { TrendsDto } from '@shared/types';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { PHASE_STYLE } from '@/lib/phase';
import { ENERGY_LABELS } from '@/pages/log/copy';

type EnergyRow = TrendsDto['energyByPhase'][number];

/** The word she picked from, nearest to the average — kinder than "2.8 / 5". */
function energyWord(average: number): string {
  return ENERGY_LABELS[Math.min(Math.max(Math.round(average), 1), ENERGY_LABELS.length) - 1];
}

/**
 * Average energy per phase. Phases are named on the axis and in the list, so
 * colour is never the only thing telling them apart. A phase with too few days
 * gets no bar — the API withheld its average rather than guess.
 */
export function EnergyByPhase({ rows }: { rows: EnergyRow[] }) {
  const data = rows.map((row) => ({ ...row, label: PHASE_STYLE[row.phase].label }));

  return (
    <>
      <div aria-hidden className="-mx-1">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -28 }} barSize={36}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--color-ink-soft)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-line)' }}
            />
            <YAxis
              domain={[0, ENERGY_LABELS.length]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
              tickLine={false}
              axisLine={false}
            />
            <Bar dataKey="average" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {data.map((row) => (
                <Cell key={row.phase} fill={`var(--color-${row.phase})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="divide-y divide-line">
        {rows.map((row) => {
          const style = PHASE_STYLE[row.phase];
          return (
            <li key={row.phase} className="flex items-center gap-3 py-2.5 text-sm">
              <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${style.fill}`} />
              <span className="flex-1 font-medium text-ink">{style.label}</span>
              <span className="text-ink-soft">
                {row.average === null ? 'Not enough days yet' : energyWord(row.average)}
              </span>
              <span className="w-16 text-right text-muted tabular-nums">
                {row.days} {row.days === 1 ? 'day' : 'days'}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
