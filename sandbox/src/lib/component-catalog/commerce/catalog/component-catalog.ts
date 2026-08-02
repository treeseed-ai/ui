import type { ComponentCatalogEntry } from '../../support/component-kind.ts';
import { formsComponents } from '../../support/forms.ts';
import { appControlsComponents } from '../../support/app-controls.ts';
import { operationsComponents } from '../../operations/operations.ts';
import { authAndSensitiveDataComponents } from '../../accounts/auth-and-sensitive-data.ts';
import { contentAndDataComponents } from '../../content/content-and-data.ts';
import { shellAndLayoutComponents } from '../../support/shell-and-layout.ts';
import { publicAndTemplatesComponents } from '../../support/public-and-templates.ts';
import { helpAndFeedbackComponents } from '../../support/help-and-feedback.ts';
import { themeAndChartsComponents } from '../../support/theme-and-charts.ts';
import { serviceManagementComponents } from '../../services/service-management.ts';
import { componentCatalogOrder } from '../orders/catalog-order.ts';

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
  ...serviceManagementComponents,
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
