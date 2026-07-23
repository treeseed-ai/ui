import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const CORE_COMPONENTS = [
{
    uiPath: "src/astro/core/DevWatchReload.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/DevWatchReload.astro",
    category: "Core",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/dev-watch-reload",
  },
{
    uiPath: "src/astro/core/SiteTitle.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/SiteTitle.astro",
    category: "Core",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/site-title",
  }
] as const satisfies readonly MarketComponentMapEntry[];
