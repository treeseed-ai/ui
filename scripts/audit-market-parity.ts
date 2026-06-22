#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { basename, relative } from 'node:path';

const mapSource = readFileSync('tests/fixtures/marketComponentMap.ts', 'utf8');
const match = mapSource.match(/export const marketComponentMap = (\[[\s\S]*?\]) as const/);
if (!match) {
  throw new Error('Unable to read marketComponentMap fixture.');
}

const entries = JSON.parse(match[1]);
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const catalogText = readFileSync('sandbox/src/lib/component-catalog.ts', 'utf8');
const failures = [];
const warnings = [];
const sourceCheckoutAvailable = entries.some((entry) => existsSync(entry.sourcePath));

function exportPathFor(uiPath) {
  if (uiPath.startsWith('src/astro/')) {
    return `./components/astro/${relative('src/astro', uiPath)}`;
  }
  if (uiPath.startsWith('src/lib/app/')) {
    return `./lib/app/${basename(uiPath, '.ts')}`;
  }
  return null;
}

function staticClasses(source) {
  const classes = new Set();
  const matcher = /class(?::list)?=\{?(["'`])([^"'`}]+)\1/g;
  for (const match of source.matchAll(matcher)) {
    for (const token of match[2].split(/\s+/)) {
      if (token && !/[{}$]/.test(token)) classes.add(token);
    }
  }
  return classes;
}

for (const entry of entries) {
  if (!existsSync(entry.uiPath)) failures.push(`Missing UI file: ${entry.uiPath}`);
  if (sourceCheckoutAvailable && !existsSync(entry.sourcePath)) failures.push(`Missing source file: ${entry.sourcePath}`);

  const exportPath = exportPathFor(entry.uiPath);
  if (exportPath && !packageJson.exports?.[exportPath]) {
    failures.push(`Missing package export ${exportPath} for ${entry.uiPath}`);
  }

  const routeId = entry.sandboxRoute?.split('/').filter(Boolean).at(-1);
  if (routeId && !catalogText.includes(`'${routeId}'`)) {
    failures.push(`Missing sandbox route ${entry.sandboxRoute} for ${entry.uiPath}`);
  }

  if (!existsSync(entry.uiPath)) continue;

  const uiText = readFileSync(entry.uiPath, 'utf8');
  if (/\/home\/adrian\/Projects\/treeseed\/market|market\/src|packages\/core|packages\/sdk/.test(uiText)) {
    failures.push(`Forbidden market/core/sdk import reference in ${entry.uiPath}`);
  }

  if (sourceCheckoutAvailable && entry.uiPath.endsWith('.astro')) {
    const sourceClasses = staticClasses(readFileSync(entry.sourcePath, 'utf8'));
    const uiClasses = staticClasses(uiText);
    const missingClasses = [...sourceClasses].filter((name) => !uiClasses.has(name));
    if (missingClasses.length > 0) {
      warnings.push(
        `Class coverage warning for ${entry.uiPath}: missing static source classes ${missingClasses.join(', ')}`
      );
    }
  }
}

for (const warning of warnings) console.warn('[market-parity]', warning);

if (failures.length > 0) {
  for (const failure of failures) console.error('[market-parity]', failure);
  process.exit(1);
}

const sourceStatus = sourceCheckoutAvailable ? 'source checkout available' : 'source checkout unavailable; skipped source existence and class coverage';
console.log(`[market-parity] Checked ${entries.length} mapped files with ${warnings.length} class coverage warning(s) (${sourceStatus}).`);
