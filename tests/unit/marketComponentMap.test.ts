import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { libraryNativeComponents, marketComponentMap } from '../fixtures/marketComponentMap';

describe('market component source map', () => {
  it('maps UI components to market or core source files', () => {
    expect(marketComponentMap.length).toBeGreaterThan(90);
    const sourceCheckoutAvailable = marketComponentMap.some((entry) => existsSync(entry.sourcePath));

    for (const entry of marketComponentMap) {
      expect(existsSync(entry.uiPath), `${entry.uiPath} should exist`).toBe(true);
      expect(entry.sourcePath, `${entry.uiPath} should map to the TreeSeed market checkout`).toContain('/treeseed/market/');
      if (sourceCheckoutAvailable) {
        expect(existsSync(entry.sourcePath), `${entry.sourcePath} should exist`).toBe(true);
      }
      expect(entry.parityMode).toBe('rendered-visual');
      expect(entry.allowedSourceDifferences.length).toBeGreaterThan(0);
    }
  });

  it('keeps mapped UI files independent of market, core, and sdk runtime imports', () => {
    const forbidden = /(\/home\/adrian\/Projects\/treeseed\/market|market\/src|packages\/core|packages\/sdk|CoreObjective)/;

    for (const entry of marketComponentMap) {
      const source = readFileSync(entry.uiPath, 'utf8');
      expect(source, `${entry.uiPath} should not import market/core/sdk runtime paths`).not.toMatch(forbidden);
    }
  });

  it('documents library-native components that intentionally have no market source', () => {
    expect(libraryNativeComponents).toContain('src/react/editors/RichMarkdownEditor.tsx');
    expect(libraryNativeComponents).toContain('src/react/charts/MonitoringChart.tsx');
    expect(libraryNativeComponents).toContain('src/react/charts/ProjectActivityChart.tsx');
    expect(libraryNativeComponents).toContain('src/react/pie-allocation/DynamicPieAllocationInput.tsx');
  });
});
