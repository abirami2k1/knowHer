import { describe, expect, it } from 'vitest';
import { cycleStats, expectedOvulationDay, isFallback } from './estimate';
import { withRules } from './rules';

describe('cycleStats', () => {
  it('is empty for no cycles', () => {
    expect(cycleStats([])).toEqual({ n: 0, mean: 0, stdev: 0, cv: 0 });
  });

  it('has no spread to report from a single cycle', () => {
    expect(cycleStats([28])).toEqual({ n: 1, mean: 28, stdev: 0, cv: 0 });
  });

  it('reports mean and sample stdev', () => {
    const stats = cycleStats([27, 28, 29]);
    expect(stats.mean).toBe(28);
    expect(stats.stdev).toBeCloseTo(1, 10);
    expect(stats.cv).toBeCloseTo(1 / 28, 10);
  });

  it('gives a wildly varying history a high cv', () => {
    expect(cycleStats([24, 45, 31, 60]).cv).toBeGreaterThan(0.18);
  });
});

describe('expectedOvulationDay', () => {
  it('uses her own history once there is enough of it', () => {
    expect(expectedOvulationDay({ stats: cycleStats([30, 30]) })).toEqual({
      day: 16,
      basis: 'history',
    });
  });

  it('falls back to the average she gave at onboarding, and says so', () => {
    expect(expectedOvulationDay({ stats: cycleStats([30]), selfReportedAvg: 28 })).toEqual({
      day: 14,
      basis: 'self_reported',
    });
  });

  it('returns nothing when there is neither history nor a self-reported average', () => {
    expect(expectedOvulationDay({ stats: cycleStats([]) })).toBeNull();
    expect(expectedOvulationDay({ stats: cycleStats([]), selfReportedAvg: null })).toBeNull();
  });

  it('never estimates a day earlier than the follicular floor', () => {
    // A 20-day average would put ovulation on day 6; the floor keeps it at 8.
    expect(expectedOvulationDay({ stats: cycleStats([20, 20]) })?.day).toBe(8);
  });

  it('moves when the luteal assumption is retuned — the whole point of the config', () => {
    const stats = cycleStats([30, 30]);
    expect(expectedOvulationDay({ stats }, withRules({ defaultLutealAssumption: 13 }))?.day).toBe(
      17,
    );
  });
});

describe('isFallback', () => {
  const regular = cycleStats([28, 29, 28]);

  it('says nothing when a regular history places today normally', () => {
    expect(isFallback({ stats: regular, todayCycleDay: 12, hasCurrentCycle: true })).toBeNull();
  });

  it('declines to guess when there is no cycle at all', () => {
    expect(isFallback({ stats: cycleStats([]), hasCurrentCycle: false })).toBe('no_history');
  });

  it('does not call a first cycle "no history" — day 2 of a first period is still a phase', () => {
    expect(
      isFallback({ stats: cycleStats([]), todayCycleDay: 2, hasCurrentCycle: true }),
    ).toBeNull();
  });

  it('declines to guess when her cycles vary too much', () => {
    expect(isFallback({ stats: cycleStats([24, 45, 31, 60]), todayCycleDay: 10 })).toBe(
      'irregular',
    );
  });

  it('notices a cycle running past what is usual for her', () => {
    expect(isFallback({ stats: regular, todayCycleDay: 40 })).toBe('long');
  });

  it('reports irregularity ahead of length when both are true', () => {
    expect(isFallback({ stats: cycleStats([24, 45, 31, 60]), todayCycleDay: 90 })).toBe(
      'irregular',
    );
  });

  it('will not call a cycle long off a single prior cycle', () => {
    expect(isFallback({ stats: cycleStats([28]), todayCycleDay: 60 })).toBeNull();
  });

  it('respects a retuned irregularity threshold', () => {
    const stats = cycleStats([26, 30]);
    expect(isFallback({ stats, todayCycleDay: 5 })).toBeNull();
    expect(isFallback({ stats, todayCycleDay: 5 }, withRules({ irregularCvThreshold: 0.05 }))).toBe(
      'irregular',
    );
  });
});
