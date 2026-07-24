export type MarketComponentMapEntry = {
  uiPath: string;
  sourcePath: string;
  category: string;
  parityMode: "rendered-visual";
  allowedSourceDifferences: string[];
  sandboxRoute?: string;
};

import { AUTH_COMPONENTS } from './market-component-map/accounts/auth.ts';
import { APP_CONTROLS_COMPONENTS } from './market-component-map/application/app-controls.ts';
import { OPERATIONS_COMPONENTS } from './market-component-map/operations/operations.ts';
import { SENSITIVE_DATA_COMPONENTS } from './market-component-map/application/sensitive-data.ts';
import { MARKET_COMPONENTS } from './market-component-map/content/market.ts';
import { LAYOUTS_COMPONENTS } from './market-component-map/layout/layouts.ts';
import { SUPPORT_COMPONENTS } from './market-component-map/foundation/support.ts';
import { DATA_COMPONENTS } from './market-component-map/content/data.ts';
import { FORMS_COMPONENTS } from './market-component-map/application/forms.ts';
import { LAYOUT_COMPONENTS } from './market-component-map/layout/layout.ts';
import { SHELL_COMPONENTS } from './market-component-map/layout/shell.ts';
import { SURFACE_COMPONENTS } from './market-component-map/layout/surface.ts';
import { THEME_COMPONENTS } from './market-component-map/foundation/theme.ts';
import { CORE_COMPONENTS } from './market-component-map/foundation/core.ts';
import { CONTENT_COMPONENTS } from './market-component-map/content/content.ts';
import { DOCS_COMPONENTS } from './market-component-map/content/docs.ts';
import { SITE_COMPONENTS } from './market-component-map/content/site.ts';

export const marketComponentMap = [...AUTH_COMPONENTS, ...APP_CONTROLS_COMPONENTS, ...OPERATIONS_COMPONENTS, ...SENSITIVE_DATA_COMPONENTS, ...MARKET_COMPONENTS, ...LAYOUTS_COMPONENTS, ...SUPPORT_COMPONENTS, ...DATA_COMPONENTS, ...FORMS_COMPONENTS, ...LAYOUT_COMPONENTS, ...SHELL_COMPONENTS, ...SURFACE_COMPONENTS, ...THEME_COMPONENTS, ...CORE_COMPONENTS, ...CONTENT_COMPONENTS, ...DOCS_COMPONENTS, ...SITE_COMPONENTS] as const satisfies readonly MarketComponentMapEntry[];

export const libraryNativeComponents = [
  "src/react/editors/RichMarkdownEditor.tsx",
  "src/react/charts/MonitoringChart.tsx",
  "src/react/charts/ProjectActivityChart.tsx",
  "src/react/pie-allocation/DynamicPieAllocationInput.tsx",
  "src/react/form-controls/CheckboxField.tsx",
  "src/react/form-controls/SelectField.tsx",
  "src/react/form-controls/TextField.tsx",
] as const;
