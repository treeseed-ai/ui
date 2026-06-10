import { readFileSync, readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

function walkFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(root, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

describe('component inventory boundaries', () => {
  it('does not depend on market, core, sdk, or Starlight internals', () => {
    const files = [
      ...walkFiles('src/astro').filter((file) => ['.astro', '.ts'].includes(extname(file))),
      ...walkFiles('src/react').filter((file) => ['.tsx', '.ts'].includes(extname(file))),
      ...walkFiles('src/lib/app').filter((file) => extname(file) === '.ts'),
    ];
    const forbidden = /(packages\/core|packages\/sdk|market\/src|@astrojs\/starlight|virtual:starlight|astro:env\/client|CoreObjective)/;

    for (const file of files) {
      expect(readFileSync(file, 'utf8'), `${file} should stay UI-package local`).not.toMatch(forbidden);
    }
  });

  it('keeps component filenames reusable instead of single-record aliases', () => {
    const componentNames = [
      ...walkFiles('src/astro').filter((file) => extname(file) === '.astro'),
      ...walkFiles('src/react').filter((file) => extname(file) === '.tsx'),
    ].map((file) => basename(file, extname(file)));

    expect(componentNames).not.toContain('CoreObjectiveMdxEditor');
    expect(componentNames).toContain('RichMarkdownEditor');
    expect(componentNames).toContain('AppLayout');
    expect(componentNames).toContain('PublicLayout');
    expect(componentNames).toContain('ProductCard');
  });
});
