import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const copies = [
  ['src/astro', 'dist/astro'],
  ['src/styles', 'dist/styles'],
  ['src/theme/schemes', 'dist/theme/schemes'],
];

for (const [source, target] of copies) {
  if (!existsSync(source)) continue;
  rmSync(target, { recursive: true, force: true });
  mkdirSync(dirname(resolve(target)), { recursive: true });
  cpSync(source, target, { recursive: true });
}
