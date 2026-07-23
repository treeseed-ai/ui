import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const LAYOUT_COMPONENTS = [
{
    uiPath: "src/astro/layout/PageHeader.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/layout/PageHeader.astro",
    category: "Layout",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/page-header",
  }
] as const satisfies readonly MarketComponentMapEntry[];
