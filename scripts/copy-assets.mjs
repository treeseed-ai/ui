import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const copies = [
  ['src/astro', 'dist/astro', false],
  ['src/lib', 'dist/lib', false],
  ['src/styles', 'dist/styles', true],
  ['src/utils', 'dist/utils', true],
  ['src/types', 'dist/types', true],
  ['src/theme', 'dist/theme', false],
  ['src/theme/schemes', 'dist/theme/schemes', true],
];

for (const [source, target, clean] of copies) {
  if (!existsSync(source)) continue;
  if (clean) rmSync(target, { recursive: true, force: true });
  mkdirSync(dirname(resolve(target)), { recursive: true });
  cpSync(source, target, { recursive: true });
}
