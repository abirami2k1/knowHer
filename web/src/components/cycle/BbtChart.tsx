import type { CycleAssessmentDto } from '@shared/types';
import {
  CartesianGrid,
  Dot,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

/** Padding around the readings: the whole point is to make a ~0.4°F shift visible. */
function domainFor(temps: number[]): [number, number] {
  if (temps.length === 0) return [97, 99];
  return [Math.min(...temps) - 0.2, Math.max(...temps) + 0.3];
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: { isDisturbed: boolean; excludedFromRules: boolean };
}

/** A flagged or excluded reading is drawn hollow — plotted, but visibly not counted. */
function ReadingDot({ cx, cy, payload }: DotProps) {
  if (cx === undefined || cy === undefined || !payload) return null;
  const excluded = payload.isDisturbed || payload.excludedFromRules;
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={excluded ? 4 : 3.5}
      fill={excluded ? 'var(--color-bg-soft)' : 'var(--color-primary)'}
      stroke="var(--color-primary)"
      strokeWidth={excluded ? 1.5 : 1}
      strokeDasharray={excluded ? '2 2' : undefined}
    />
  );
}

/**
 * The BBT chart. Every line and marker it draws was decided by the engine —
 * this component only places them.
 */
export function BbtChart({ assessment }: { assessment: CycleAssessmentDto }) {
  const points = assessment.series.filter((p) => p.bbtF !== null);
  const temps = points.map((p) => p.bbtF as number);
  const lastDay = assessment.series.at(-1)?.cycleDay ?? 1;

  if (points.length === 0) return null;

  return (
    <div className="rounded-card bg-white p-3 ring-1 ring-primary/10">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 4, left: -18 }}>
          <CartesianGrid stroke="var(--color-primary)" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="cycleDay"
            type="number"
            domain={[1, lastDay]}
            tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-primary)', strokeOpacity: 0.2 }}
          />
          <YAxis
            domain={domainFor(temps)}
            tickFormatter={(value: number) => value.toFixed(1)}
            tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
            tickLine={false}
            axisLine={false}
            width={44}
          />

          {/* The luteal stretch: only ever drawn once ovulation is confirmed. */}
          {assessment.ovulationDay !== null && (
            <ReferenceArea
              x1={assessment.ovulationDay}
              x2={lastDay}
              fill="var(--color-calm)"
              fillOpacity={0.08}
            />
          )}

          {assessment.coverlineF !== null && (
            <ReferenceLine
              y={assessment.coverlineF}
              stroke="var(--color-calm)"
              strokeDasharray="5 4"
              label={{
                value: `Coverline ${assessment.coverlineF.toFixed(2)}°F`,
                position: 'insideTopLeft',
                fill: 'var(--color-calm)',
                fontSize: 11,
              }}
            />
          )}

          {assessment.ovulationDay !== null && (
            <ReferenceLine
              x={assessment.ovulationDay}
              stroke="var(--color-primary)"
              strokeOpacity={0.5}
              label={{
                value: 'Ovulation',
                position: 'top',
                fill: 'var(--color-primary)',
                fontSize: 11,
              }}
            />
          )}

          {assessment.peakDay !== null && (
            <ReferenceLine
              x={assessment.peakDay}
              stroke="var(--color-accent)"
              strokeOpacity={0.6}
              strokeDasharray="3 3"
              label={{
                value: 'Peak',
                position: 'top',
                fill: 'var(--color-accent)',
                fontSize: 11,
              }}
            />
          )}

          <Line
            type="monotone"
            dataKey="bbtF"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={<ReadingDot />}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
