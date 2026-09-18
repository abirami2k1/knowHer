import { computeLutealLength, lutealDayToday } from './luteal';
import { detectPeakDay } from './peak';
import { CYCLE_RULES, type CycleRules } from './rules';
import { toChartSeries } from './series';
import { detectThermalShift } from './shift';
import { fromHundredths } from './temps';
import type { Confidence, CycleAssessment, CycleInput, Flag } from './types';

/**
 * The whole engine in one call: (logs, rules) → assessment. Temperatures confirm,
 * mucus corroborates; nothing is exposed before its confirmation day.
 * See cycle-engine-plan.md §6.7–6.9 for the flag and confidence rules.
 */
export function assessCycle(input: CycleInput, rules: CycleRules = CYCLE_RULES): CycleAssessment {
  const isLive = input.cycleLength === undefined;
  const shift = detectThermalShift(input, rules);
  const peak = detectPeakDay(input, rules);
  const confirmed = shift.status === 'confirmed';

  const flags: Flag[] = [];
  if (shift.status === 'no_temp_data') flags.push('no_temp_data');
  if (shift.status === 'low_data') flags.push('low_data');
  if (confirmed && shift.disturbedInvolved) flags.push('disturbed_excluded');
  if (shift.falseShiftSeen) flags.push('false_shift_invalidated');
  if (isLive && shift.status === 'pending') flags.push('shift_pending');
  if (peak.status === 'no_mucus_data') flags.push('no_mucus_data');
  if (isLive && peak.status === 'pending') flags.push('peak_pending');

  const disagreement =
    confirmed &&
    peak.status === 'confirmed' &&
    Math.abs(peak.peakDay! - shift.ovulationDay!) > rules.disagreementToleranceDays;
  if (disagreement) flags.push('signal_disagreement');

  const isAnovulatory = !isLive && shift.status === 'none';
  if (isAnovulatory) flags.push('anovulatory');

  const confidence = resolveConfidence({
    confirmed,
    peakConfirmed: peak.status === 'confirmed',
    disagreement,
    disturbedInvolved: shift.disturbedInvolved,
    windowShort: shift.windowShort,
  });

  return {
    coverlineF: shift.coverlineH === null ? null : fromHundredths(shift.coverlineH),
    coverlineWindowDays: shift.coverlineWindowDays,
    dipDay: shift.dipDay,
    ovulationDay: shift.ovulationDay,
    shiftConfirmedOnDay: shift.shiftConfirmedOnDay,
    peakDay: peak.peakDay,
    peakConfirmedOnDay: peak.peakConfirmedOnDay,
    lutealLength: computeLutealLength(input.cycleLength, shift.ovulationDay),
    lutealDayToday: isLive ? lutealDayToday(input.todayCycleDay, shift.ovulationDay) : null,
    isAnovulatory,
    confidence,
    flags,
    series: toChartSeries(input, shift, peak, rules),
  };
}

function resolveConfidence(s: {
  confirmed: boolean;
  peakConfirmed: boolean;
  disagreement: boolean;
  disturbedInvolved: boolean;
  windowShort: boolean;
}): Confidence {
  if (!s.confirmed) return 'none';
  if (!s.peakConfirmed || s.disagreement || s.disturbedInvolved || s.windowShort) return 'reduced';
  return 'full';
}
