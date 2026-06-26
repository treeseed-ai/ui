import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';

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

function walkFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = resolve(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function rewriteDeclarationSpecifiers(contents: string, filePath: string): string {
  return contents.replace(/(['"])(\.{1,2}\/[^'"]+)\.ts\1/g, (match, quote: string, specifier: string) => {
    const targetBase = resolve(dirname(filePath), specifier);
    if (existsSync(`${targetBase}.js`)) return `${quote}${specifier}.js${quote}`;
    return `${quote}${specifier}${quote}`;
  });
}

function rewriteRuntimeSpecifiers(contents: string, filePath: string): string {
  return contents.replace(/(['"])(\.{1,2}\/[^'"]+)\.ts\1/g, (match, quote: string, specifier: string) => {
    const targetBase = resolve(dirname(filePath), specifier);
    if (existsSync(`${targetBase}.js`)) return `${quote}${specifier}.js${quote}`;
    return match;
  });
}

for (const filePath of walkFiles(resolve('dist'))) {
  if (filePath.endsWith('.d.ts')) {
    writeFileSync(filePath, rewriteDeclarationSpecifiers(readFileSync(filePath, 'utf8'), filePath), 'utf8');
    continue;
  }
  if (filePath.endsWith('.astro') || filePath.endsWith('.js')) {
    writeFileSync(filePath, rewriteRuntimeSpecifiers(readFileSync(filePath, 'utf8'), filePath), 'utf8');
    continue;
  }
  if (extname(filePath) !== '.ts') continue;
  writeFileSync(filePath, rewriteRuntimeSpecifiers(readFileSync(filePath, 'utf8'), filePath), 'utf8');
  const withoutExtension = filePath.slice(0, -3);
  const hasDeclaration = existsSync(`${withoutExtension}.d.ts`);
  const hasRuntime = existsSync(`${withoutExtension}.js`);
  const isThemeTypeSource = filePath.includes('/dist/theme/');
  if ((hasRuntime || isThemeTypeSource) && hasDeclaration && statSync(filePath).isFile()) {
    unlinkSync(filePath);
  }
}
