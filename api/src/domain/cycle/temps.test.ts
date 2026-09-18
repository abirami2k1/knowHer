import { describe, expect, it } from 'vitest';
import { fromHundredths, snapToGrid, toHundredths } from './temps';

describe('temperature integer math', () => {
  it('round-trips two-decimal readings exactly', () => {
    for (const f of [97, 97.1, 97.65, 97.96, 98.0, 99.9]) {
      expect(fromHundredths(toHundredths(f))).toBe(f);
    }
  });

  it('adds the 0.1 offset exactly, where floats drift', () => {
    expect(97.6 + 0.1).not.toBe(97.7); // 97.69999999999999 in IEEE floats
    expect(toHundredths(97.6) + toHundredths(0.1)).toBe(toHundredths(97.7));
    // A reading exactly on the line is therefore never "above" it.
    expect(toHundredths(97.7) > toHundredths(97.6) + toHundredths(0.1)).toBe(false);
  });

  it('snaps to the 0.1 grid, half up', () => {
    expect(snapToGrid(toHundredths(97.65))).toBe(toHundredths(97.7));
    expect(snapToGrid(toHundredths(97.64))).toBe(toHundredths(97.6));
    expect(snapToGrid(toHundredths(97.96))).toBe(toHundredths(98.0));
  });
});
