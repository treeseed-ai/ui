import { readdirSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { componentCatalog, formComponents } from '../../sandbox/src/lib/component-catalog';
import { marketComponentMap } from '../fixtures/marketComponentMap';

function walkFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(root, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

describe('component catalog coverage', () => {
  it('catalogs every standalone source component with classification and package metadata', () => {
    const nonStandaloneComponents = new Set(['ThemeScript']);
    const catalogByName = new Map(componentCatalog.map((entry) => [entry.name, entry]));
    const sourceComponents = [
      ...walkFiles('src/astro').filter((file) => extname(file) === '.astro'),
      ...walkFiles('src/react').filter((file) => extname(file) === '.tsx'),
    ];

    for (const componentPath of sourceComponents) {
      const componentName = basename(componentPath, extname(componentPath));
      if (nonStandaloneComponents.has(componentName)) continue;
      const entry = catalogByName.get(componentName);
      expect(entry, `${componentName} should be in the sandbox catalog`).toBeDefined();
      expect(entry?.category, `${componentName} should have a category`).toBeTruthy();
      expect(entry?.route, `${componentName} should have a route`).toMatch(/^\/(forms|displays)\//);
      expect(entry?.packageEntry, `${componentName} should document its package entry`).toMatch(/^@treeseed\/ui\//);
      expect(entry?.configurableProps.length, `${componentName} should document configuration`).toBeGreaterThan(0);
    }
  });

  it('keeps form catalog entries ready for state and submission previews', () => {
    for (const entry of formComponents) {
      expect(entry.stateShape, `${entry.name} should expose state shape metadata`).toBeDefined();
      expect(entry.stateShape, `${entry.name} should include submitted state`).toHaveProperty('submitted');
      expect(entry.defaultProps, `${entry.name} should document defaults`).toBeTruthy();
    }
  });

  it('does not reintroduce narrow editor aliases when a generic editor exists', () => {
    const names = componentCatalog.map((entry) => entry.name);
    expect(names).toContain('RichMarkdownEditor');
    expect(names.some((name) => /CoreObjective/i.test(name))).toBe(false);
  });

  it('catalogs every mapped standalone market component route', () => {
    const routeIds = new Set(componentCatalog.map((entry) => entry.route));

    for (const entry of marketComponentMap) {
      if (!('sandboxRoute' in entry) || !entry.sandboxRoute) continue;
      expect(routeIds.has(entry.sandboxRoute), `${entry.uiPath} should be cataloged at ${entry.sandboxRoute}`).toBe(true);
    }
  });
});
