
import { componentCatalog } from './component-catalog.ts';
import { ComponentKind } from './component-kind.ts';

export const formComponents = componentCatalog.filter((entry) => entry.kind === 'form');

export const displayComponents = componentCatalog.filter((entry) => entry.kind === 'display');

export function findComponent(kind: ComponentKind, id: string | undefined) {
  return componentCatalog.find((entry) => entry.kind === kind && entry.id === id);
}
