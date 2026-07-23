import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const SENSITIVE_DATA_COMPONENTS = [
{
    uiPath: "src/astro/app/sensitive/SensitiveDataUnlock.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/src/components/app/sensitive/SensitiveDataUnlock.astro",
    category: "Sensitive Data",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/sensitive-data-unlock",
  }
] as const satisfies readonly MarketComponentMapEntry[];
