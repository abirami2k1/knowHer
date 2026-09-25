import { describe, expect, it } from 'vitest';
import { resolvePhase } from './phase';
import { withRules } from './rules';
import type { CycleAssessment, CycleLog } from './types';

const EMPTY_ASSESSMENT: CycleAssessment = {
  coverlineF: null,
  coverlineWindowDays: [],
  dipDay: null,
  ovulationDay: null,
  shiftConfirmedOnDay: null,
  peakDay: null,
  peakConfirmedOnDay: null,
  lutealLength: null,
  lutealDayToday: null,
  isAnovulatory: false,
  confidence: 'none',
  flags: [],
  series: [],
};

const log = (cycleDay: number, flow?: CycleLog['flow']): CycleLog => ({
  cycleDay,
  date: '2026-09-01',
  isDisturbed: false,
  ...(flow && { flow }),
});

const PERIOD = [log(1, 'medium'), log(2, 'medium'), log(3, 'light'), log(4, 'none')];
const EXPECTED = { day: 14, basis: 'history' } as const;

describe('resolvePhase — the fallback comes first', () => {
  it('declines to name a phase, whatever else is true', () => {
    expect(
      resolvePhase({
        assessment: { ...EMPTY_ASSESSMENT, ovulationDay: 14 },
        todayCycleDay: 20,
        logs: PERIOD,
        expected: EXPECTED,
        fallback: 'irregular',
      }),
    ).toEqual({ phase: 'unknown', basis: 'none', copyKey: 'fallback.irregular' });
  });
});

describe('resolvePhase — menstrual', () => {
  it('holds while today is inside the leading run of bleeding days', () => {
    for (const day of [1, 2, 3]) {
      expect(resolvePhase({ ...base(day) }).phase).toBe('menstrual');
    }
    expect(resolvePhase({ ...base(4) }).phase).not.toBe('menstrual');
  });

  it('never starts from spotting alone (D3)', () => {
    const spotting = [log(1, 'spotting'), log(2, 'spotting')];
    expect(resolvePhase({ ...base(1), logs: spotting }).phase).toBe('follicular');
  });

  it('ignores bleeding later in the cycle — only the run from day 1 counts', () => {
    const midCycleBleed = [...PERIOD, log(18, 'medium')];
    expect(resolvePhase({ ...base(18), logs: midCycleBleed }).phase).not.toBe('menstrual');
  });

  it('is not disturbed by a gap in logging before day 1 of bleeding ends', () => {
    const gappy = [log(1, 'medium'), log(3, 'medium')];
    expect(resolvePhase({ ...base(3), logs: gappy }).phase).not.toBe('menstrual');
  });
});

describe('resolvePhase — luteal from confirmed evidence', () => {
  it('is confirmed once the shift is confirmed and today is past ovulation', () => {
    expect(
      resolvePhase({
        ...base(18),
        assessment: { ...EMPTY_ASSESSMENT, ovulationDay: 14, shiftConfirmedOnDay: 17 },
      }),
    ).toEqual({ phase: 'luteal', basis: 'confirmed', copyKey: 'phase.luteal' });
  });

  it('outranks the estimate: a confirmed shift on an unexpected day still wins', () => {
    const result = resolvePhase({
      ...base(13),
      assessment: { ...EMPTY_ASSESSMENT, ovulationDay: 10, shiftConfirmedOnDay: 13 },
    });
    expect(result).toEqual({ phase: 'luteal', basis: 'confirmed', copyKey: 'phase.luteal' });
  });
});

describe('resolvePhase — estimated placement', () => {
  it('calls the days around the expected day ovulatory, marked as an estimate', () => {
    for (const day of [12, 14, 16]) {
      expect(resolvePhase({ ...base(day) })).toEqual({
        phase: 'ovulatory',
        basis: 'estimated',
        copyKey: 'phase.ovulatory',
      });
    }
  });

  it('is follicular before that window and luteal after it, never confirmed', () => {
    expect(resolvePhase({ ...base(11) }).phase).toBe('follicular');
    expect(resolvePhase({ ...base(17) })).toEqual({
      phase: 'luteal',
      basis: 'estimated',
      copyKey: 'phase.luteal',
    });
  });

  it('widens with the configured ovulatory window', () => {
    expect(resolvePhase({ ...base(11) }, withRules({ ovulatoryWindowDays: 3 })).phase).toBe(
      'ovulatory',
    );
  });

  it('stays follicular with no estimate at all, and claims nothing', () => {
    expect(resolvePhase({ ...base(20), expected: null })).toEqual({
      phase: 'follicular',
      basis: 'none',
      copyKey: 'phase.follicular',
    });
  });
});

function base(todayCycleDay: number) {
  return {
    assessment: EMPTY_ASSESSMENT,
    todayCycleDay,
    logs: PERIOD,
    expected: EXPECTED as { day: number; basis: 'history' | 'self_reported' } | null,
    fallback: null,
  };
}
