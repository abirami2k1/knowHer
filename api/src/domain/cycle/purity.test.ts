import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guard rail: the engine must stay pure. No clock, no database, no HTTP —
 * anywhere in this folder's non-test sources.
 */
const DIR = __dirname;
const FORBIDDEN = ['Date.now', 'new Date(', 'prisma', 'express'];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? [path] : [];
  });
}

/** Strips line and block comments so apostrophes in prose don't look like string literals. */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

/** The contents of every string literal in the source, found by walking the text. */
function stringLiterals(code: string): string[] {
  const literals: string[] = [];
  for (let i = 0; i < code.length; i++) {
    const quote = code[i];
    if (quote !== "'" && quote !== '"' && quote !== '`') continue;
    let j = i + 1;
    while (j < code.length && code[j] !== quote) j += code[j] === '\\' ? 2 : 1;
    literals.push(code.slice(i + 1, j));
    i = j;
  }
  return literals;
}

describe('domain/cycle purity', () => {
  it('keeps user-facing sentences out of the logic files (copy.ts is the only home)', () => {
    for (const name of [
      'assess.ts',
      'shift.ts',
      'peak.ts',
      'luteal.ts',
      'series.ts',
      'coverline.ts',
    ]) {
      const code = withoutComments(readFileSync(join(DIR, name), 'utf8'));
      const sentences = stringLiterals(code).filter((text) => /\s/.test(text));
      expect(sentences, `${name} contains inline prose: ${sentences.join(' | ')}`).toEqual([]);
    }
  });

  it('contains no clock, database or HTTP references', () => {
    for (const file of sourceFiles(DIR)) {
      const text = readFileSync(file, 'utf8');
      for (const token of FORBIDDEN) {
        expect(text, `${file} mentions ${token}`).not.toContain(token);
      }
    }
  });
});
