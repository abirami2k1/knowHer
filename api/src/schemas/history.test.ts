import { describe, expect, it } from 'vitest';
import { historyQuerySchema } from './history';

describe('historyQuerySchema', () => {
  it('accepts a real month', () => {
    for (const month of ['2026-01', '2026-09', '2026-12']) {
      expect(historyQuerySchema.safeParse({ month }).success).toBe(true);
    }
  });

  it('rejects a month that does not exist or is the wrong shape', () => {
    for (const month of ['2026-00', '2026-13', '2026-9', '09-2026', '2026', '2026-09-01']) {
      expect(historyQuerySchema.safeParse({ month }).success).toBe(false);
    }
  });

  it('rejects extra query params, so nothing else can be filtered on', () => {
    expect(historyQuerySchema.safeParse({ month: '2026-09', flow: 'heavy' }).success).toBe(false);
  });
});
