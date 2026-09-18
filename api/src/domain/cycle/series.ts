import { lutealDayFor } from './luteal';
import type { PeakResult } from './peak';
import type { CycleRules } from './rules';
import { fromHundredths, selectReadings, visibleLogs } from './temps';
import type { ShiftResult } from './shift';
import type { ChartPoint, CycleInput } from './types';

/**
 * One ChartPoint per cycle day, carrying Sivi's chart rows ("Temp Count & Luteal
 * Phase", "Peak Day Count") so Task 7 renders and never computes.
 */
export function toChartSeries(
  input: CycleInput,
  shift: ShiftResult,
  peak: PeakResult,
  rules: CycleRules,
): ChartPoint[] {
  const logs = visibleLogs(input);
  const { readings } = selectReadings(logs, rules);
  const readingByDay = new Map(readings.map((r) => [r.cycleDay, r]));
  const logByDay = new Map(logs.map((l) => [l.cycleDay, l]));
  const lastLogged = logs.length > 0 ? logs[logs.length - 1]!.cycleDay : 0;
  const lastDay = Math.max(lastLogged, input.todayCycleDay ?? 0, input.cycleLength ?? 0);

  const series: ChartPoint[] = [];
  for (let day = 1; day <= lastDay; day++) {
    const log = logByDay.get(day);
    const reading = readingByDay.get(day);
    const runIndex = shift.runDays.indexOf(day);
    const peakIndex = peak.confirmDays.indexOf(day);
    series.push({
      cycleDay: day,
      bbtF: reading ? fromHundredths(reading.tempH) : null,
      isDisturbed: reading?.isDisturbed ?? false,
      excludedFromRules: reading?.excludedFromRules ?? false,
      aboveCoverline:
        shift.coverlineH !== null && reading ? reading.tempH > shift.coverlineH : null,
      tempCount: runIndex >= 0 ? runIndex + 1 : null,
      lutealDay: lutealDayFor(day, shift.ovulationDay),
      peakCount: peakIndex >= 0 ? peakIndex + 1 : null,
      mucus: log?.cervicalMucus ?? null,
      flow: log?.flow ?? null,
    });
  }
  return series;
}
