import { describe, expect, it } from 'vitest';
import { cycleStats } from './estimate';
import { withRules } from './rules';
import {
  dayPlacer,
  energyByPhase,
  lengthNote,
  mergeCycleHistory,
  symptomPatterns,
  type CompletedCycle,
  type TrendDay,
  type TrendPhase,
} from './trends';
import type { CycleLog } from './types';

const log = (cycleDay: number, flow?: CycleLog['flow']): CycleLog => ({
  cycleDay,
  date: '2026-09-01',
  isDisturbed: false,
  ...(flow && { flow }),
});

const PERIOD = [log(1, 'heavy'), log(2, 'medium'), log(3, 'light'), log(4, 'spotting')];

describe('dayPlacer — confirmed ovulation', () => {
  const place = dayPlacer({
    logs: PERIOD,
    ovulationDay: 15,
    isAnovulatory: false,
    cycleLength: 29,
  });

  it('places bleeding days as menstrual, spotting excluded', () => {
    expect(place(3)).toEqual({ phase: 'menstrual', basis: 'confirmed' });
    expect(place(4)).toEqual({ phase: 'follicular', basis: 'confirmed' });
  });

  it('runs ovulatory from the window before ovulation to the day itself, then luteal', () => {
    expect(place(12)?.phase).toBe('follicular');
    expect(place(13)?.phase).toBe('ovulatory');
    expect(place(15)?.phase).toBe('ovulatory');
    expect(place(16)).toEqual({ phase: 'luteal', basis: 'confirmed' });
  });
});

describe('dayPlacer — no confirmed shift', () => {
  it('counts back from a closed cycle, labelled estimated', () => {
    const place = dayPlacer({
      logs: PERIOD,
      ovulationDay: null,
      isAnovulatory: false,
      cycleLength: 30,
    });
    // 30 − 14 = day 16
    expect(place(13)).toEqual({ phase: 'follicular', basis: 'estimated' });
    expect(place(14)).toEqual({ phase: 'ovulatory', basis: 'estimated' });
    expect(place(18)).toEqual({ phase: 'ovulatory', basis: 'estimated' });
    expect(place(19)).toEqual({ phase: 'luteal', basis: 'estimated' });
  });

  it('never places a luteal day in a cycle that ran without ovulation', () => {
    const place = dayPlacer({
      logs: PERIOD,
      ovulationDay: null,
      isAnovulatory: true,
      cycleLength: 30,
    });
    expect(place(2)?.phase).toBe('menstrual');
    expect(place(25)).toBeNull();
  });

  it('places nothing past the bleed in a live cycle — no forecasting', () => {
    const place = dayPlacer({ logs: PERIOD, ovulationDay: null, isAnovulatory: false });
    expect(place(1)?.phase).toBe('menstrual');
    expect(place(10)).toBeNull();
  });

  it('follows the luteal assumption in CYCLE_RULES', () => {
    const place = dayPlacer(
      { logs: PERIOD, ovulationDay: null, isAnovulatory: false, cycleLength: 30 },
      withRules({ defaultLutealAssumption: 12 }),
    );
    expect(place(19)?.phase).toBe('ovulatory'); // anchor moves to day 18
  });
});

const day = (
  phase: TrendPhase,
  energy: number | null,
  symptoms: string[] = [],
  basis: 'confirmed' | 'estimated' = 'confirmed',
): TrendDay => ({ placement: { phase, basis }, energy, symptoms });

describe('energyByPhase', () => {
  it('averages per phase to one decimal and counts estimated days', () => {
    const result = energyByPhase([
      day('menstrual', 2),
      day('menstrual', 2),
      day('menstrual', 3, [], 'estimated'),
      day('luteal', 4),
    ]);
    expect(result.find((r) => r.phase === 'menstrual')).toEqual({
      phase: 'menstrual',
      average: 2.3,
      days: 3,
      estimatedDays: 1,
    });
  });

  it('withholds an average built on too few days', () => {
    const luteal = energyByPhase([day('luteal', 4), day('luteal', 5)]).find(
      (r) => r.phase === 'luteal',
    );
    expect(luteal).toMatchObject({ average: null, days: 2 });
  });

  it('ignores unplaced days and days without an energy reading', () => {
    const result = energyByPhase([
      { placement: null, energy: 5, symptoms: [] },
      day('follicular', null),
    ]);
    expect(result.every((r) => r.days === 0)).toBe(true);
  });

  it('follows trendMinDaysPerPhase', () => {
    const [menstrual] = energyByPhase(
      [day('menstrual', 2)],
      withRules({ trendMinDaysPerPhase: 1 }),
    );
    expect(menstrual.average).toBe(2);
  });
});

describe('symptomPatterns', () => {
  it('sorts by days noted and finds the phase relative to days logged there', () => {
    const days = [
      day('menstrual', null, ['cramps']),
      day('menstrual', null, ['cramps']),
      day('menstrual', null, []),
      // Four follicular days with cramps on one: more follicular days, lower rate.
      day('follicular', null, ['cramps', 'acne']),
      day('follicular', null, []),
      day('follicular', null, []),
      day('follicular', null, []),
    ];
    const [cramps, acne] = symptomPatterns(days);
    expect(cramps).toMatchObject({ symptom: 'cramps', days: 3, mostOften: 'menstrual' });
    expect(cramps.byPhase).toEqual({ menstrual: 2, follicular: 1, ovulatory: 0, luteal: 0 });
    expect(acne).toMatchObject({ symptom: 'acne', days: 1, mostOften: null }); // too rare to say
  });

  it('declines to name a phase on a tie', () => {
    const days = [
      day('menstrual', null, ['headache']),
      day('luteal', null, ['headache']),
      day('luteal', null, []),
      day('menstrual', null, []),
      { placement: null, energy: null, symptoms: ['headache'] },
    ];
    expect(symptomPatterns(days)[0]).toMatchObject({ days: 3, mostOften: null });
  });
});

const cycle = (startDate: string, length: number, source: CompletedCycle['source']) => ({
  startDate,
  length,
  lutealLength: null,
  isAnovulatory: false,
  source,
});

describe('mergeCycleHistory (D4 precedence)', () => {
  it('lets a Cycle row win over a summary of the same cycle, and never double-counts', () => {
    const merged = mergeCycleHistory(
      [cycle('2026-08-01', 29, 'cycle'), cycle('2026-06-30', 32, 'cycle')],
      [cycle('2026-06-30', 31, 'summary'), cycle('2026-05-30', 31, 'summary')],
    );
    expect(merged.map((c) => [c.startDate, c.length, c.source])).toEqual([
      ['2026-05-30', 31, 'summary'],
      ['2026-06-30', 32, 'cycle'],
      ['2026-08-01', 29, 'cycle'],
    ]);
  });
});

describe('lengthNote', () => {
  it('describes, never grades', () => {
    expect(lengthNote(cycleStats([]))).toBe('lengths.none');
    expect(lengthNote(cycleStats([29]))).toBe('lengths.few');
    expect(lengthNote(cycleStats([28, 29, 30]))).toBe('lengths.steady');
    expect(lengthNote(cycleStats([24, 38, 30]))).toBe('lengths.varied');
  });
});
