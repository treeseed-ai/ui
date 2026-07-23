import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const SURFACE_COMPONENTS = [
{
    uiPath: "src/astro/surface/Card.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/surface/Card.astro",
    category: "Surface",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/card",
  },
{
    uiPath: "src/astro/surface/EmptyState.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/surface/EmptyState.astro",
    category: "Surface",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/empty-state",
  },
{
    uiPath: "src/astro/surface/Panel.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/surface/Panel.astro",
    category: "Surface",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/panel",
  }
] as const satisfies readonly MarketComponentMapEntry[];
