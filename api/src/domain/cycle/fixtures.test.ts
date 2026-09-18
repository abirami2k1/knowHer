import { describe, expect, it } from 'vitest';
import { assessCycle } from './assess';
import { FIXTURES } from './fixtures';
import { withRules } from './rules';

describe('fixtures', () => {
  for (const fixture of FIXTURES) {
    it(fixture.name, () => {
      const result = assessCycle(fixture.input, withRules(fixture.rules ?? {}));
      expect(result).toMatchObject(fixture.expected);
    });
  }
});
