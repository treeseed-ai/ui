import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const SUPPORT_COMPONENTS = [
{
    uiPath: "src/lib/app/deployment-action-status.ts",
    sourcePath: "/home/adrian/Projects/treeseed/market/src/components/app/controls/deployment-action-status.ts",
    category: "Support",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
  },
{
    uiPath: "src/lib/app/platform-operation-status.ts",
    sourcePath: "/home/adrian/Projects/treeseed/market/src/components/app/controls/platform-operation-status.ts",
    category: "Support",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
  },
{
    uiPath: "src/lib/app/related-content-creator.ts",
    sourcePath: "/home/adrian/Projects/treeseed/market/src/components/app/controls/related-content-creator.ts",
    category: "Support",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
  },
{
    uiPath: "src/lib/app/markdown-field.ts",
    sourcePath: "/home/adrian/Projects/treeseed/market/src/components/app/controls/markdown-field.ts",
    category: "Support",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
  }
] as const satisfies readonly MarketComponentMapEntry[];
