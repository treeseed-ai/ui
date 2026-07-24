import type { ComponentCatalogEntry } from './component-kind.ts';
import { formsComponents } from './forms.ts';
import { appControlsComponents } from './app-controls.ts';
import { operationsComponents } from './operations.ts';
import { authAndSensitiveDataComponents } from './auth-and-sensitive-data.ts';
import { contentAndDataComponents } from './content-and-data.ts';
import { shellAndLayoutComponents } from './shell-and-layout.ts';
import { publicAndTemplatesComponents } from './public-and-templates.ts';
import { helpAndFeedbackComponents } from './help-and-feedback.ts';
import { themeAndChartsComponents } from './theme-and-charts.ts';
import { componentCatalogOrder } from './catalog-order.ts';

const componentCatalogContributions: ComponentCatalogEntry[] = [
  ...formsComponents,
  ...appControlsComponents,
  ...operationsComponents,
  ...authAndSensitiveDataComponents,
  ...contentAndDataComponents,
  ...shellAndLayoutComponents,
  ...publicAndTemplatesComponents,
  ...helpAndFeedbackComponents,
  ...themeAndChartsComponents,
];

const componentCatalogById = new Map(
  componentCatalogContributions.map((component) => [component.id, component]),
);

export const componentCatalog: ComponentCatalogEntry[] = componentCatalogOrder.map((id) => {
  const component = componentCatalogById.get(id);
  if (!component) {
    throw new Error(`Component catalog order references unknown component "${id}".`);
  }
  return component;
});

if (componentCatalog.length !== componentCatalogContributions.length) {
  const orderedIds = new Set(componentCatalogOrder);
  const unorderedIds = componentCatalogContributions
    .map((component) => component.id)
    .filter((id) => !orderedIds.has(id as (typeof componentCatalogOrder)[number]));
  throw new Error(`Component catalog entries are missing from catalog order: ${unorderedIds.join(', ')}`);
}
