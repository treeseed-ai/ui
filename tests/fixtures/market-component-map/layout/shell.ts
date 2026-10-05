import type { MarketComponentMapEntry } from '../../marketComponentMap.ts';

export const SHELL_COMPONENTS = [
{
    uiPath: "src/astro/shell/layout/ProductShell.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/ProductShell.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/product-shell",
  },
{
    uiPath: "src/astro/shell/navigation/BottomNav.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/BottomNav.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/bottom-nav",
  },
{
    uiPath: "src/astro/shell/chrome/ProjectHeader.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/ProjectHeader.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/project-header",
  },
{
    uiPath: "src/astro/shell/chrome/PublicFooter.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/PublicFooter.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/public-footer",
  },
{
    uiPath: "src/astro/shell/layout/PublicShell.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/PublicShell.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/public-shell",
  },
{
    uiPath: "src/astro/shell/navigation/RailNav.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/RailNav.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/rail-nav",
  },
{
    uiPath: "src/astro/shell/navigation/ShellIconLink.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/ShellIconLink.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/shell-icon-link",
  },
{
    uiPath: "src/astro/shell/navigation/TopBar.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/TopBar.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/top-bar",
  }
] as const satisfies readonly MarketComponentMapEntry[];
