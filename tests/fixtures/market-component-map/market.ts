import type { MarketComponentMapEntry } from '../marketComponentMap.ts';

export const MARKET_COMPONENTS = [
{
    uiPath: "src/astro/market/ProductCard.astro",
    sourcePath: "/home/adrian/Projects/treeseed/market/src/components/market/MarketProductCard.astro",
    category: "Market",
    parityMode: "rendered-visual",
    allowedSourceDifferences: ["import-paths", "package-safe-types", "structural-props", "route-base-props", "generic-component-names"],
    sandboxRoute: "/displays/product-card",
  }
] as const satisfies readonly MarketComponentMapEntry[];
