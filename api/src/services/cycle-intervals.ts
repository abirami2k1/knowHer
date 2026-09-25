import { addDays, daysBetween, type CalendarDate } from '../lib/dates';
import { AppError } from '../lib/errors';

/**
 * The arithmetic of cycle boundaries, kept pure so every edge case can be tested
 * without a database. `services/cycles.ts` decides what to persist; this decides
 * what *should* happen.
 *
 * A cycle owns [startDate, endDate]. The last cycle is open (endDate null) and
 * closes only when the next period start is recorded (D3). Logs are never part
 * of the calculation — membership is derived from these intervals (D2).
 */

export interface Interval {
  id: string;
  startDate: CalendarDate;
  endDate: CalendarDate | null;
}

export interface Close {
  id: string;
  endDate: CalendarDate;
  length: number;
}

export interface StartPlan {
  /** The cycle before the new start, re-closed the day before it. */
  close: Close | null;
  /** The new cycle. It gets an endDate only when a later cycle already exists. */
  create: { startDate: CalendarDate; endDate: CalendarDate | null; length: number | null };
}

export interface EditPlan {
  close: Close | null;
  update: { id: string; startDate: CalendarDate; length: number | null };
}

const DUPLICATE = () =>
  new AppError(409, 'cycle_exists', 'A period is already recorded as starting that day');

function lengthOf(startDate: CalendarDate, endDate: CalendarDate): number {
  return daysBetween(startDate, endDate) + 1;
}

/** Ascending by start date. daysBetween(a, b) is b − a, hence the argument order. */
const byStartDate = (a: Interval, b: Interval) => daysBetween(b.startDate, a.startDate);

/** Latest interval starting strictly before `date`. */
function previousOf(existing: Interval[], date: CalendarDate, exceptId?: string): Interval | null {
  return (
    existing
      .filter((i) => i.id !== exceptId && daysBetween(i.startDate, date) > 0)
      .sort(byStartDate)
      .at(-1) ?? null
  );
}

/** Earliest interval starting strictly after `date`. */
function nextOf(existing: Interval[], date: CalendarDate, exceptId?: string): Interval | null {
  return (
    existing
      .filter((i) => i.id !== exceptId && daysBetween(date, i.startDate) > 0)
      .sort(byStartDate)
      .at(0) ?? null
  );
}

/**
 * Recording a period start.
 *
 * Back-to-back periods, a first-ever cycle, and a start backfilled into the
 * middle of history are all the same operation: close whatever came before at
 * the day before, and give the new cycle an end only if something already
 * follows it. A start on a date that is already a start is the one true
 * duplicate and is refused.
 */
export function planStart(existing: Interval[], startDate: CalendarDate): StartPlan {
  if (existing.some((i) => i.startDate === startDate)) throw DUPLICATE();

  const previous = previousOf(existing, startDate);
  const next = nextOf(existing, startDate);
  const endDate = next ? addDays(next.startDate, -1) : null;

  return {
    close: previous
      ? {
          id: previous.id,
          endDate: addDays(startDate, -1),
          length: lengthOf(previous.startDate, addDays(startDate, -1)),
        }
      : null,
    create: {
      startDate,
      endDate,
      length: endDate ? lengthOf(startDate, endDate) : null,
    },
  };
}

/**
 * Correcting a start date. The cycle keeps its own end; only the boundary with
 * the cycle before it moves. A correction that would cross a neighbouring start
 * — or its own end — is refused rather than silently reordering her history.
 */
export function planEditStart(
  existing: Interval[],
  cycleId: string,
  startDate: CalendarDate,
): EditPlan {
  const cycle = existing.find((i) => i.id === cycleId);
  if (!cycle) throw new AppError(404, 'not_found', 'That cycle could not be found');
  if (existing.some((i) => i.id !== cycleId && i.startDate === startDate)) throw DUPLICATE();

  if (cycle.endDate && daysBetween(startDate, cycle.endDate) < 0) {
    throw new AppError(400, 'invalid_input', 'A cycle cannot start after it ended');
  }

  const previous = previousOf(existing, startDate, cycleId);
  const next = nextOf(existing, startDate, cycleId);
  // Moving past a neighbour would reorder her history; that is an edit of the
  // other cycle, not this one.
  if (next && cycle.endDate && daysBetween(next.startDate, cycle.endDate) >= 0) {
    throw new AppError(400, 'invalid_input', 'That start date crosses the cycle after it');
  }

  return {
    close: previous
      ? {
          id: previous.id,
          endDate: addDays(startDate, -1),
          length: lengthOf(previous.startDate, addDays(startDate, -1)),
        }
      : null,
    update: {
      id: cycleId,
      startDate,
      length: cycle.endDate ? lengthOf(startDate, cycle.endDate) : null,
    },
  };
}
