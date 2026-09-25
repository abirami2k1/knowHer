import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { AppError } from './errors';
import { parseBody } from './validate';

const schema = z.object({ displayName: z.string(), avgCycleLength: z.int() }).strict();

describe('parseBody', () => {
  it('returns the parsed value on success', () => {
    expect(parseBody(schema, { displayName: 'Abi', avgCycleLength: 30 })).toEqual({
      displayName: 'Abi',
      avgCycleLength: 30,
    });
  });

  it('throws a 400 invalid_input AppError naming the offending fields', () => {
    try {
      parseBody(schema, { displayName: 'Abi' });
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      const appError = error as AppError;
      expect(appError.status).toBe(400);
      expect(appError.code).toBe('invalid_input');
      expect(appError.message).toContain('avgCycleLength');
    }
  });

  it('never repeats the submitted values back (they may be health data)', () => {
    try {
      parseBody(schema, { displayName: 'Abi', avgCycleLength: 'thirty-one' });
      expect.unreachable('should have thrown');
    } catch (error) {
      expect((error as AppError).message).not.toContain('thirty-one');
    }
  });
});
