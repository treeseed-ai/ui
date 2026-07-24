


export type ComponentKind = 'form' | 'display';

export type ComponentRuntime = 'astro' | 'react';

export type ComponentSize = 'inline' | 'small' | 'medium' | 'large' | 'full-page';

export type ComponentCatalogEntry = {
  id: string;
  name: string;
  kind: ComponentKind;
  runtime: ComponentRuntime;
  category: string;
  route: string;
  description: string;
  intendedSize: ComponentSize;
  packageEntry?: string;
  status?: 'active' | 'deprecated';
  replacement?: string;
  defaultProps: Record<string, unknown>;
  configurableProps: Array<{
    name: string;
    type: string;
    defaultValue: unknown;
    description: string;
  }>;
  stateShape?: Record<string, unknown>;
};

export const form = (
  id: string,
  name: string,
  category: string,
  runtime: ComponentRuntime,
  description: string,
  intendedSize: ComponentSize,
  defaultProps: Record<string, unknown>,
  configurableProps: ComponentCatalogEntry['configurableProps'],
  stateShape: Record<string, unknown> = { value: 'component-specific', submitted: null },
  packageEntry?: string,
  status: ComponentCatalogEntry['status'] = 'active',
  replacement?: string
): ComponentCatalogEntry => ({
  id,
  name,
  kind: 'form',
  runtime,
  category,
  route: `/forms/${id}`,
  description,
  intendedSize,
  packageEntry: packageEntry ?? (runtime === 'astro'
    ? `@treeseed/ui/components/astro/forms/${name}.astro`
    : `@treeseed/ui/components/react/${name}`),
  status,
  replacement,
  defaultProps,
  configurableProps,
  stateShape,
});

export const display = (
  id: string,
  name: string,
  category: string,
  runtime: ComponentRuntime,
  description: string,
  intendedSize: ComponentSize,
  defaultProps: Record<string, unknown>,
  configurableProps: ComponentCatalogEntry['configurableProps'],
  stateShape?: Record<string, unknown>,
  packageEntry = runtime === 'astro'
    ? `@treeseed/ui/components/astro/${category.toLowerCase()}/${name}.astro`
    : `@treeseed/ui/components/react/${name}`,
  status: ComponentCatalogEntry['status'] = 'active',
  replacement?: string
): ComponentCatalogEntry => ({
  id,
  name,
  kind: 'display',
  runtime,
  category,
  route: `/displays/${id}`,
  description,
  intendedSize,
  packageEntry,
  status,
  replacement,
  defaultProps,
  configurableProps,
  stateShape,
});
