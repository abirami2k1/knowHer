/**
 * Luteal counting, Sivi's way: the first reading above the coverline is luteal day 1,
 * so lutealDay(d) = d − ovulationDay. All null without a confirmed shift.
 */
export function lutealDayFor(cycleDay: number, ovulationDay: number | null): number | null {
  if (ovulationDay === null || cycleDay <= ovulationDay) return null;
  return cycleDay - ovulationDay;
}

/** Closed cycles only. */
export function computeLutealLength(
  cycleLength: number | undefined,
  ovulationDay: number | null,
): number | null {
  if (cycleLength === undefined || ovulationDay === null) return null;
  return cycleLength - ovulationDay;
}

/** Live cycles only. */
export function lutealDayToday(
  todayCycleDay: number | undefined,
  ovulationDay: number | null,
): number | null {
  if (todayCycleDay === undefined) return null;
  return lutealDayFor(todayCycleDay, ovulationDay);
}
