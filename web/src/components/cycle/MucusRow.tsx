import type { ChartPoint } from '@shared/types';

/**
 * Sivi's mucus row, aligned under the chart by cycle day. A plain flex row rather
 * than a Recharts layer, so the symbols stay legible at phone width.
 */
const SYMBOL: Record<string, { mark: string; label: string }> = {
  dry: { mark: '·', label: 'Dry' },
  sticky: { mark: '▪', label: 'Sticky' },
  watery: { mark: '◆', label: 'Watery' },
  eggwhite: { mark: '✳', label: 'Egg-white' },
};

export function MucusRow({ series }: { series: ChartPoint[] }) {
  if (!series.some((p) => p.mucus !== null)) return null;

  return (
    <div className="rounded-card bg-white p-3 ring-1 ring-primary/10">
      <h3 className="mb-2 text-sm font-medium text-muted">Mucus by cycle day</h3>
      <ul className="flex gap-0.5 overflow-x-auto pb-1">
        {series.map((point) => {
          const symbol = point.mucus ? SYMBOL[point.mucus] : null;
          return (
            <li key={point.cycleDay} className="min-w-6 shrink-0 text-center">
              <span
                className={`block text-base ${point.mucus === 'eggwhite' ? 'text-accent' : 'text-ink'}`}
                title={symbol ? `Day ${point.cycleDay}: ${symbol.label}` : undefined}
              >
                {symbol ? symbol.mark : '–'}
                <span className="sr-only">
                  {symbol
                    ? `Day ${point.cycleDay}: ${symbol.label}`
                    : `Day ${point.cycleDay}: not logged`}
                </span>
              </span>
              <span aria-hidden className="block text-[10px] text-muted">
                {point.cycleDay}
              </span>
            </li>
          );
        })}
      </ul>
      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {Object.values(SYMBOL).map((s) => (
          <div key={s.label} className="flex items-center gap-1">
            <dt aria-hidden>{s.mark}</dt>
            <dd>{s.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
