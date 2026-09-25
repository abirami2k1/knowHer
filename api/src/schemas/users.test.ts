import { describe, expect, it } from 'vitest';
import { onboardingSchema, updateProfileSchema } from './users';

const VALID_ONBOARDING = { displayName: 'Abi', ageBand: 'b25_34' };

describe('onboardingSchema', () => {
  it('accepts the minimum every path collects, and defaults the rest', () => {
    const parsed = onboardingSchema.parse(VALID_ONBOARDING);
    expect(parsed).toEqual({
      displayName: 'Abi',
      ageBand: 'b25_34',
      conditions: [],
      goals: [],
      trackingBBT: false,
      trackingMucus: false,
    });
  });

  it('treats absent cycle lengths as "not sure" rather than an error', () => {
    const parsed = onboardingSchema.parse(VALID_ONBOARDING);
    expect(parsed.avgCycleLength).toBeUndefined();
    expect(parsed.avgPeriodLength).toBeUndefined();
  });

  it('trims the display name and rejects a blank one', () => {
    expect(
      onboardingSchema.parse({ ...VALID_ONBOARDING, displayName: '  Abi  ' }).displayName,
    ).toBe('Abi');
    expect(onboardingSchema.safeParse({ ...VALID_ONBOARDING, displayName: '   ' }).success).toBe(
      false,
    );
  });

  it('requires a display name and an age band', () => {
    expect(onboardingSchema.safeParse({ ageBand: 'b25_34' }).success).toBe(false);
    expect(onboardingSchema.safeParse({ displayName: 'Abi' }).success).toBe(false);
  });

  it('rejects unknown enum members and unknown keys', () => {
    expect(onboardingSchema.safeParse({ ...VALID_ONBOARDING, ageBand: 'b99' }).success).toBe(false);
    expect(onboardingSchema.safeParse({ ...VALID_ONBOARDING, role: 'author' }).success).toBe(false);
  });

  it('accepts multiple real conditions together', () => {
    const parsed = onboardingSchema.parse({ ...VALID_ONBOARDING, conditions: ['pcod', 'endo'] });
    expect(parsed.conditions).toEqual(['pcod', 'endo']);
  });

  it('rejects "none" or "unsure" combined with a condition', () => {
    for (const exclusive of ['none', 'unsure']) {
      expect(
        onboardingSchema.safeParse({ ...VALID_ONBOARDING, conditions: ['pcod', exclusive] })
          .success,
      ).toBe(false);
      expect(
        onboardingSchema.safeParse({ ...VALID_ONBOARDING, conditions: [exclusive] }).success,
      ).toBe(true);
    }
  });

  it('rejects duplicate conditions and goals', () => {
    expect(
      onboardingSchema.safeParse({ ...VALID_ONBOARDING, conditions: ['pcod', 'pcod'] }).success,
    ).toBe(false);
    expect(
      onboardingSchema.safeParse({ ...VALID_ONBOARDING, goals: ['learn', 'learn'] }).success,
    ).toBe(false);
  });

  it('bounds the self-reported averages but stays wide enough for irregular cycles', () => {
    for (const avgCycleLength of [15, 45, 90]) {
      expect(onboardingSchema.safeParse({ ...VALID_ONBOARDING, avgCycleLength }).success).toBe(
        true,
      );
    }
    for (const avgCycleLength of [14, 91, 28.5]) {
      expect(onboardingSchema.safeParse({ ...VALID_ONBOARDING, avgCycleLength }).success).toBe(
        false,
      );
    }
    expect(onboardingSchema.safeParse({ ...VALID_ONBOARDING, avgPeriodLength: 16 }).success).toBe(
      false,
    );
  });
});

describe('onboardingSchema — the last-period date (5.1.2)', () => {
  const TODAY = '2026-09-24';

  it("accepts a remembered start with the client's today", () => {
    const parsed = onboardingSchema.parse({
      ...VALID_ONBOARDING,
      lastPeriodStart: '2026-09-01',
      today: TODAY,
    });
    expect(parsed.lastPeriodStart).toBe('2026-09-01');
  });

  it('treats an absent date as "not sure" — valid, and no today needed', () => {
    const parsed = onboardingSchema.parse(VALID_ONBOARDING);
    expect(parsed.lastPeriodStart).toBeUndefined();
    expect(parsed.today).toBeUndefined();
  });

  it('accepts today itself as the start (a period starting this morning)', () => {
    expect(
      onboardingSchema.safeParse({ ...VALID_ONBOARDING, lastPeriodStart: TODAY, today: TODAY })
        .success,
    ).toBe(true);
  });

  it('requires today alongside a date, since the server must not invent one (D1)', () => {
    const result = onboardingSchema.safeParse({
      ...VALID_ONBOARDING,
      lastPeriodStart: '2026-09-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a future start date', () => {
    expect(
      onboardingSchema.safeParse({
        ...VALID_ONBOARDING,
        lastPeriodStart: '2026-09-25',
        today: TODAY,
      }).success,
    ).toBe(false);
  });

  it('rejects a start more than a year back, and accepts one just inside', () => {
    expect(
      onboardingSchema.safeParse({
        ...VALID_ONBOARDING,
        lastPeriodStart: '2025-09-23',
        today: TODAY,
      }).success,
    ).toBe(false);
    expect(
      onboardingSchema.safeParse({
        ...VALID_ONBOARDING,
        lastPeriodStart: '2025-09-24',
        today: TODAY,
      }).success,
    ).toBe(true);
  });

  it('rejects a malformed or impossible date', () => {
    for (const lastPeriodStart of ['01-09-2026', '2026-9-1', '2026-02-30', 'yesterday']) {
      expect(
        onboardingSchema.safeParse({ ...VALID_ONBOARDING, lastPeriodStart, today: TODAY }).success,
      ).toBe(false);
    }
  });
});

describe('updateProfileSchema', () => {
  it('accepts a single field', () => {
    expect(updateProfileSchema.parse({ trackingBBT: true })).toEqual({ trackingBBT: true });
  });

  it('applies no defaults — an absent field stays absent', () => {
    expect(updateProfileSchema.parse({ displayName: 'Abi' })).toEqual({ displayName: 'Abi' });
  });

  it('rejects an empty body', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(false);
  });

  it('rejects fields the client must not set', () => {
    expect(updateProfileSchema.safeParse({ onboardedAt: new Date().toISOString() }).success).toBe(
      false,
    );
    expect(updateProfileSchema.safeParse({ role: 'author' }).success).toBe(false);
    expect(updateProfileSchema.safeParse({ id: 'someone-else' }).success).toBe(false);
  });

  it('keeps the condition exclusivity rule', () => {
    expect(updateProfileSchema.safeParse({ conditions: ['none', 'pcod'] }).success).toBe(false);
  });
});
