import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const CONTENT_COMPONENTS = [
{
    uiPath: "src/astro/content/ContentStatusLegend.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/content/ContentStatusLegend.astro",
    category: "Content",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/content-status-legend",
  },
{
    uiPath: "src/astro/content/StatusBadge.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/content/StatusBadge.astro",
    category: "Content",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/status-badge",
  }
] as const satisfies readonly MarketComponentMapEntry[];
