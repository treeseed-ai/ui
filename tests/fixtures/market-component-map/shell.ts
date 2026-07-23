import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const SHELL_COMPONENTS = [
{
    uiPath: "src/astro/shell/ProductShell.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/ProductShell.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/product-shell",
  },
{
    uiPath: "src/astro/shell/BottomNav.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/BottomNav.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/bottom-nav",
  },
{
    uiPath: "src/astro/shell/ProjectHeader.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/ProjectHeader.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/project-header",
  },
{
    uiPath: "src/astro/shell/PublicFooter.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/PublicFooter.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/public-footer",
  },
{
    uiPath: "src/astro/shell/PublicShell.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/PublicShell.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/public-shell",
  },
{
    uiPath: "src/astro/shell/RailNav.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/RailNav.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/rail-nav",
  },
{
    uiPath: "src/astro/shell/ShellIconLink.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/ShellIconLink.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/shell-icon-link",
  },
{
    uiPath: "src/astro/shell/TopBar.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/packages/core/src/components/ui/shell/TopBar.astro",
    category: "Shell",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/top-bar",
  }
] as const satisfies readonly MarketComponentMapEntry[];
