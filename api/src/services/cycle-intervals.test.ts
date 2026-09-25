import { describe, expect, it } from 'vitest';
import type { AppError } from '../lib/errors';
import { planEditStart, planStart, type Interval } from './cycle-intervals';

const interval = (id: string, startDate: string, endDate: string | null = null): Interval => ({
  id,
  startDate,
  endDate,
});

function codeOf(fn: () => unknown): string {
  try {
    fn();
    return 'no error';
  } catch (error) {
    return (error as AppError).code;
  }
}

describe('planStart — her first ever period', () => {
  it('opens a cycle and closes nothing', () => {
    const plan = planStart([], '2026-09-01');
    expect(plan.close).toBeNull();
    expect(plan.create).toEqual({ startDate: '2026-09-01', endDate: null, length: null });
  });
});

describe('planStart — the ordinary case', () => {
  const existing = [interval('a', '2026-08-04')];

  it('closes the open cycle the day before, and leaves the new one open', () => {
    const plan = planStart(existing, '2026-09-01');
    expect(plan.close).toEqual({ id: 'a', endDate: '2026-08-31', length: 28 });
    expect(plan.create).toEqual({ startDate: '2026-09-01', endDate: null, length: null });
  });

  it('counts length inclusively — a 28-day cycle is start through the day before the next', () => {
    expect(planStart([interval('a', '2026-01-01')], '2026-01-29').close?.length).toBe(28);
  });

  it('handles back-to-back periods: a start the very next day is a one-day cycle', () => {
    const plan = planStart([interval('a', '2026-09-01')], '2026-09-02');
    expect(plan.close).toEqual({ id: 'a', endDate: '2026-09-01', length: 1 });
  });

  it('closes the latest cycle, not the oldest, when several exist', () => {
    const history = [
      interval('a', '2026-07-01', '2026-07-28'),
      interval('b', '2026-07-29', '2026-08-25'),
      interval('c', '2026-08-26'),
    ];
    expect(planStart(history, '2026-09-22').close?.id).toBe('c');
  });
});

describe('planStart — backfilling a forgotten period', () => {
  // She remembers a period that started mid-way through a cycle she already has.
  const history = [interval('a', '2026-07-01', '2026-08-25'), interval('b', '2026-08-26')];

  it('splits the cycle it lands inside rather than rejecting it', () => {
    const plan = planStart(history, '2026-07-29');
    expect(plan.close).toEqual({ id: 'a', endDate: '2026-07-28', length: 28 });
    // The new cycle is not left open in the middle of history.
    expect(plan.create).toEqual({ startDate: '2026-07-29', endDate: '2026-08-25', length: 28 });
  });

  it('gives the new cycle an end when a later cycle already exists', () => {
    const plan = planStart([interval('b', '2026-08-26')], '2026-07-29');
    expect(plan.close).toBeNull();
    expect(plan.create.endDate).toBe('2026-08-25');
    expect(plan.create.length).toBe(28);
  });

  it('leaves no gap and no overlap between the split halves', () => {
    const plan = planStart(history, '2026-07-29');
    expect(plan.close?.endDate).toBe('2026-07-28');
    expect(plan.create.startDate).toBe('2026-07-29');
    expect(plan.close!.length + plan.create.length!).toBe(56); // the original interval, intact
  });
});

describe('planStart — what it refuses', () => {
  it('rejects only a true duplicate start date', () => {
    expect(codeOf(() => planStart([interval('a', '2026-09-01')], '2026-09-01'))).toBe(
      'cycle_exists',
    );
    expect(codeOf(() => planStart([interval('a', '2026-09-01')], '2026-09-02'))).toBe('no error');
  });

  it('accepts a start inside a closed cycle — that is a backfill, not a clash', () => {
    expect(codeOf(() => planStart([interval('a', '2026-09-01', '2026-09-28')], '2026-09-15'))).toBe(
      'no error',
    );
  });
});

describe('planEditStart', () => {
  const history = [
    interval('a', '2026-07-01', '2026-07-28'),
    interval('b', '2026-07-29', '2026-08-25'),
    interval('c', '2026-08-26'),
  ];

  it('moves the boundary with the cycle before it, and rewrites both lengths', () => {
    const plan = planEditStart(history, 'b', '2026-07-31');
    expect(plan.close).toEqual({ id: 'a', endDate: '2026-07-30', length: 30 });
    expect(plan.update).toEqual({ id: 'b', startDate: '2026-07-31', length: 26 });
  });

  it('moves an earlier start back, extending the edited cycle', () => {
    const plan = planEditStart(history, 'b', '2026-07-27');
    expect(plan.close).toEqual({ id: 'a', endDate: '2026-07-26', length: 26 });
    expect(plan.update.length).toBe(30);
  });

  it('leaves an open cycle without a length', () => {
    expect(planEditStart(history, 'c', '2026-08-28').update.length).toBeNull();
  });

  it('touches nothing before the first cycle', () => {
    expect(planEditStart(history, 'a', '2026-06-28').close).toBeNull();
  });

  it('refuses a date that crosses a neighbour or its own end', () => {
    expect(codeOf(() => planEditStart(history, 'b', '2026-08-26'))).toBe('cycle_exists');
    expect(codeOf(() => planEditStart(history, 'b', '2026-08-27'))).toBe('invalid_input');
    expect(codeOf(() => planEditStart(history, 'b', '2026-07-01'))).toBe('cycle_exists');
  });

  it('refuses an unknown cycle', () => {
    expect(codeOf(() => planEditStart(history, 'nope', '2026-07-31'))).toBe('not_found');
  });

  it('is unaffected by the order the intervals arrive in', () => {
    const shuffled = [history[2], history[0], history[1]];
    expect(planEditStart(shuffled, 'b', '2026-07-31')).toEqual(
      planEditStart(history, 'b', '2026-07-31'),
    );
  });
});
