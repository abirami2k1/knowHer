import { describe, expect, it } from 'vitest';
import { logRangeSchema, upsertLogSchema } from './logs';

const TODAY = '2026-09-24';
const base = { date: TODAY, today: TODAY };

describe('upsertLogSchema', () => {
  it('accepts a day with nothing but a mood — a partial day is a real day', () => {
    expect(upsertLogSchema.safeParse({ ...base, mood: 'calm' }).success).toBe(true);
  });

  it('accepts a full tracker day', () => {
    const result = upsertLogSchema.safeParse({
      ...base,
      flow: 'light',
      bbtF: 97.65,
      tempTakenAt: '06:30',
      isDisturbed: false,
      cervicalMucus: 'eggwhite',
      cervixPosition: 'soft',
      mood: 'energised',
      energy: 4,
      symptoms: ['cramps', 'headache'],
    });
    expect(result.success).toBe(true);
  });

  it('keeps null (clear this field) distinct from absent (leave it alone)', () => {
    const parsed = upsertLogSchema.parse({ ...base, bbtF: null, mood: 'calm' });
    expect(parsed.bbtF).toBeNull();
    expect(parsed.energy).toBeUndefined();
  });

  it('rejects a day that has not happened yet', () => {
    expect(upsertLogSchema.safeParse({ date: '2026-09-25', today: TODAY }).success).toBe(false);
  });

  it('allows backfill up to a year, and refuses beyond it', () => {
    expect(upsertLogSchema.safeParse({ date: '2025-09-24', today: TODAY }).success).toBe(true);
    expect(upsertLogSchema.safeParse({ date: '2025-09-23', today: TODAY }).success).toBe(false);
  });

  it('accepts real two-decimal temperatures, including ones binary floats round badly', () => {
    for (const bbtF of [97.65, 98.2, 97.0, 99.99]) {
      expect(upsertLogSchema.safeParse({ ...base, bbtF }).success).toBe(true);
    }
  });

  it('rejects a third decimal place and implausible readings', () => {
    for (const bbtF of [97.655, 89, 111]) {
      expect(upsertLogSchema.safeParse({ ...base, bbtF }).success).toBe(false);
    }
  });

  it('rejects a temperature time that is not a local HH:mm', () => {
    for (const tempTakenAt of ['6:30', '24:00', '06:60', '2026-09-24T06:30:00Z']) {
      expect(upsertLogSchema.safeParse({ ...base, tempTakenAt }).success).toBe(false);
    }
  });

  it('rejects a disturbed reason without the flag, since the engine only reads the flag', () => {
    expect(upsertLogSchema.safeParse({ ...base, disturbedReason: 'slept badly' }).success).toBe(
      false,
    );
    expect(
      upsertLogSchema.safeParse({ ...base, disturbedReason: 'slept badly', isDisturbed: true })
        .success,
    ).toBe(true);
  });

  it('rejects words outside the controlled vocabulary', () => {
    expect(upsertLogSchema.safeParse({ ...base, mood: 'hangry' }).success).toBe(false);
    expect(upsertLogSchema.safeParse({ ...base, symptoms: ['cramps', 'vibes'] }).success).toBe(
      false,
    );
    expect(upsertLogSchema.safeParse({ ...base, flow: 'gushing' }).success).toBe(false);
  });

  it('rejects duplicate symptoms and out-of-range energy', () => {
    expect(upsertLogSchema.safeParse({ ...base, symptoms: ['cramps', 'cramps'] }).success).toBe(
      false,
    );
    expect(upsertLogSchema.safeParse({ ...base, energy: 0 }).success).toBe(false);
    expect(upsertLogSchema.safeParse({ ...base, energy: 6 }).success).toBe(false);
  });

  it('rejects unknown keys', () => {
    expect(upsertLogSchema.safeParse({ ...base, userId: 'someone-else' }).success).toBe(false);
  });
});

describe('logRangeSchema', () => {
  it('accepts a range and a single day', () => {
    expect(logRangeSchema.safeParse({ from: '2026-09-01', to: '2026-09-30' }).success).toBe(true);
    expect(logRangeSchema.safeParse({ from: TODAY, to: TODAY }).success).toBe(true);
  });

  it('rejects a backwards or malformed range', () => {
    expect(logRangeSchema.safeParse({ from: '2026-09-30', to: '2026-09-01' }).success).toBe(false);
    expect(logRangeSchema.safeParse({ from: 'last week', to: TODAY }).success).toBe(false);
  });
});
