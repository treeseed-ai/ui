import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const AUTH_COMPONENTS = [
{
    uiPath: "src/astro/auth/AuthCard.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/src/components/app/auth/AuthCard.astro",
    category: "Auth",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/auth-card",
  },
{
    uiPath: "src/astro/auth/AuthDivider.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/src/components/app/auth/AuthDivider.astro",
    category: "Auth",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/auth-divider",
  },
{
    uiPath: "src/astro/auth/AuthShell.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/src/components/app/auth/AuthShell.astro",
    category: "Auth",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/auth-shell",
  },
{
    uiPath: "src/astro/auth/ProviderButtonList.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/src/components/app/auth/ProviderButtonList.astro",
    category: "Auth",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/provider-button-list",
  }
] as const satisfies readonly MarketComponentMapEntry[];
