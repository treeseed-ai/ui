import { readdirSync, readFileSync } from 'node:fs';
import { basename, extname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { componentCatalog } from '../../sandbox/src/lib/component-catalog';
import * as Ui from '../../src/index';

function walkFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(root, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

describe('package exports', () => {
  it('exports public component and style entrypoints', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { exports: Record<string, unknown> };
    expect(packageJson.exports['./theme']).toBeDefined();
    expect(packageJson.exports['./styles/theme.css']).toBeDefined();
    expect(packageJson.exports['./theme/schemes/*.yaml']).toBeDefined();

    const astroComponents = walkFiles('src/astro').filter((file) => extname(file) === '.astro');
    for (const componentPath of astroComponents) {
      const exportPath = `./components/astro/${relative('src/astro', componentPath)}`;
      expect(packageJson.exports[exportPath], exportPath).toBeDefined();
    }

    const reactComponents = walkFiles('src/react').filter((file) => extname(file) === '.tsx');
    for (const componentPath of reactComponents) {
      const componentName = basename(componentPath, '.tsx');
      const exportPath = `./components/react/${componentName}`;
      expect(packageJson.exports[exportPath], exportPath).toBeDefined();
    }
  });

  it('exports React and runtime components through the root index', () => {
    expect(Ui.DynamicPieAllocationInput).toBeDefined();
    expect(Ui.MonitoringChart).toBeDefined();
    expect(Ui.ProjectActivityChart).toBeDefined();
    expect(Ui.RichMarkdownEditor).toBeDefined();
    expect(Ui.CheckboxField).toBeDefined();
    expect(Ui.SelectField).toBeDefined();
    expect(Ui.TextField).toBeDefined();
    expect(Ui.normalizeAllocations).toBeDefined();
    expect(Ui.defineTreeseedTheme).toBeDefined();
  });

  it('catalogs every standalone public component page', () => {
    const catalogNames = new Set(componentCatalog.map((entry) => entry.name));
    const nonStandaloneComponents = new Set(['ThemeScript']);
    const sourceComponents = [
      ...walkFiles('src/astro').filter((file) => extname(file) === '.astro'),
      ...walkFiles('src/react').filter((file) => extname(file) === '.tsx'),
    ];

    for (const componentPath of sourceComponents) {
      const componentName = basename(componentPath, extname(componentPath));
      if (nonStandaloneComponents.has(componentName)) continue;
      expect(catalogNames.has(componentName), `${componentName} should have a sandbox catalog page`).toBe(true);
    }
  });
});
