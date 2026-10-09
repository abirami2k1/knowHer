import { describe, expect, it } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('makes a readable, URL-safe address from a title', () => {
    expect(slugify('Cramps & what helps!')).toBe('cramps-and-what-helps');
    expect(slugify('  Your luteal phase, explained  ')).toBe('your-luteal-phase-explained');
    expect(slugify('Café notes — día 1')).toBe('cafe-notes-dia-1');
  });

  it('never returns an empty slug or a trailing dash', () => {
    expect(slugify('!!!')).toBe('post');
    expect(slugify('a'.repeat(79) + ' b')).not.toMatch(/-$/);
    expect(slugify('x'.repeat(200)).length).toBe(80);
  });
});
