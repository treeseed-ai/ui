import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const THEME_COMPONENTS = [
{
    uiPath: "src/astro/theme/ThemeMenu.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/theme/ThemeMenu.astro",
    category: "Theme",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/forms/theme-menu",
  },
{
    uiPath: "src/astro/theme/ThemePreviewSwatch.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/theme/ThemePreviewSwatch.astro",
    category: "Theme",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/theme-preview-swatch",
  },
{
    uiPath: "src/astro/theme/ThemeScript.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/theme/ThemeScript.astro",
    category: "Theme",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
  },
{
    uiPath: "src/astro/theme/ThemeSelector.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/theme/ThemeSelector.astro",
    category: "Theme",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/forms/theme-selector",
  }
] as const satisfies readonly MarketComponentMapEntry[];
