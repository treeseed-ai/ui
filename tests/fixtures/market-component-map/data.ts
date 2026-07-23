import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const DATA_COMPONENTS = [
{
    uiPath: "src/astro/data/ActionList.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/ActionList.astro",
    category: "Data",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/action-list",
  },
{
    uiPath: "src/astro/data/Badge.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/Badge.astro",
    category: "Data",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/badge",
  },
{
    uiPath: "src/astro/data/DataTable.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/DataTable.astro",
    category: "Data",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/data-table",
  },
{
    uiPath: "src/astro/data/KeyValueList.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/KeyValueList.astro",
    category: "Data",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/key-value-list",
  },
{
    uiPath: "src/astro/data/MetricCard.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/MetricCard.astro",
    category: "Data",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/metric-card",
  },
{
    uiPath: "src/astro/data/MetricGrid.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/MetricGrid.astro",
    category: "Data",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/metric-grid",
  },
{
    uiPath: "src/astro/data/StatusPill.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/data/StatusPill.astro",
    category: "Data",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/status-pill",
  }
] as const satisfies readonly MarketComponentMapEntry[];
