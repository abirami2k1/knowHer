import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCalendarDate, formatShortDate } from '@/lib/dates';

export interface TrendPoint {
  startDate: string;
  value: number;
}

interface TrendLineProps {
  points: TrendPoint[];
  /** A CSS colour token, e.g. 'var(--color-primary)'. */
  color: string;
  /** Her typical value, drawn as a quiet dashed line. */
  typical?: number | null;
  /** Read aloud for each point, e.g. "32 days". */
  describe: (value: number) => string;
}

const AXIS_TICK = { fontSize: 11, fill: 'var(--color-muted)' };

/**
 * One measure over her cycles: one series, so no legend — the section heading
 * names it. Values are the API's; this only places them.
 */
export function TrendLine({ points, color, typical, describe }: TrendLineProps) {
  const values = points.map((p) => p.value);
  const domain: [number, number] = [Math.min(...values) - 3, Math.max(...values) + 3];

  return (
    <>
      <div aria-hidden className="-mx-1">
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={points} margin={{ top: 12, right: 12, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <XAxis
              dataKey="startDate"
              tickFormatter={formatShortDate}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-line)' }}
              padding={{ left: 16, right: 16 }}
            />
            <YAxis
              domain={domain}
              allowDecimals={false}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            {typical != null && (
              <ReferenceLine y={typical} stroke="var(--color-muted)" strokeDasharray="4 4" />
            )}
            <Tooltip
              cursor={{ stroke: 'var(--color-line)' }}
              labelFormatter={(label) => `Started ${formatCalendarDate(String(label))}`}
              formatter={(value) => [describe(Number(value)), '']}
              separator=""
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-line)',
                borderRadius: 12,
                fontSize: 13,
                color: 'var(--color-ink)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4, fill: color, stroke: 'var(--color-surface)', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* The same numbers as text, for screen readers. */}
      <ul className="sr-only">
        {points.map((p) => (
          <li key={p.startDate}>
            Cycle starting {formatCalendarDate(p.startDate)}: {describe(p.value)}
          </li>
        ))}
      </ul>
    </>
  );
}
