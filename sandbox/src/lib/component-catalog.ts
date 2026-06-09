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
  defaultProps: Record<string, unknown>;
  configurableProps: Array<{
    name: string;
    type: string;
    defaultValue: unknown;
    description: string;
  }>;
  stateShape?: Record<string, unknown>;
};

const form = (
  id: string,
  name: string,
  category: string,
  runtime: ComponentRuntime,
  description: string,
  intendedSize: ComponentSize,
  defaultProps: Record<string, unknown>,
  configurableProps: ComponentCatalogEntry['configurableProps'],
  stateShape: Record<string, unknown> = { value: 'component-specific', submitted: null },
  packageEntry?: string
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
  defaultProps,
  configurableProps,
  stateShape,
});

const display = (
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
    : `@treeseed/ui/components/react/${name}`
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
  defaultProps,
  configurableProps,
  stateShape,
});

export const componentCatalog: ComponentCatalogEntry[] = [
  form('button', 'Button', 'Actions', 'astro', 'Command and link button variants.', 'inline', {
    variant: 'primary',
    size: 'md',
    type: 'submit',
    disabled: false,
  }, [
    { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", defaultValue: 'primary', description: 'Visual button treatment.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: 'md', description: 'Button size.' },
    { name: 'disabled', type: 'boolean', defaultValue: false, description: 'Disables the button.' },
  ]),
  form('checkbox-field', 'CheckboxField', 'Fields', 'react', 'Theme-aware React checkbox form control.', 'small', {
    id: 'react-enabled',
    name: 'react_enabled',
    label: 'Enable realtime monitoring',
    checked: true,
  }, [
    { name: 'checked', type: 'boolean', defaultValue: true, description: 'Controlled checked state.' },
    { name: 'defaultChecked', type: 'boolean', defaultValue: undefined, description: 'Initial uncontrolled checked state.' },
    { name: 'onChange', type: '(checked: boolean) => void', defaultValue: undefined, description: 'Change callback.' },
  ], { react_enabled: true, submitted: null }),
  form('dynamic-pie-allocation', 'DynamicPieAllocationInput', 'Allocation', 'react', 'Interactive pie allocation form value editor.', 'large', {
    name: 'capacity_allocation',
    precision: 1,
    minSlicePercentage: 0,
    allowNumericEditing: true,
    allowDragEditing: true,
  }, [
    { name: 'precision', type: '0 | 1 | 2', defaultValue: 1, description: 'Decimal precision for slice values.' },
    { name: 'minSlicePercentage', type: 'number', defaultValue: 0, description: 'Minimum allowed slice percentage.' },
    { name: 'allowNumericEditing', type: 'boolean', defaultValue: true, description: 'Allows number input editing.' },
    { name: 'allowDragEditing', type: 'boolean', defaultValue: true, description: 'Allows drag handles.' },
  ], { allocation: [], validity: { valid: true, total: 100 }, submitted: null }),
  form('field', 'Field', 'Fields', 'astro', 'Label, help, error, and control wrapper.', 'medium', {
    label: 'Project name',
    help: 'Short labels work best in navigation.',
    error: '',
  }, [
    { name: 'label', type: 'string', defaultValue: 'Project name', description: 'Field label.' },
    { name: 'help', type: 'string', defaultValue: 'Short labels work best in navigation.', description: 'Help text below the control.' },
    { name: 'error', type: 'string', defaultValue: '', description: 'Validation error text.' },
  ]),
  form('form-actions', 'FormActions', 'Actions', 'astro', 'Action alignment for forms.', 'medium', {
    align: 'between',
  }, [
    { name: 'align', type: "'start' | 'end' | 'between'", defaultValue: 'between', description: 'Horizontal action alignment.' },
  ]),
  form('markdown-field', 'MarkdownField', 'Editors', 'astro', 'CodeMirror-enhanced Markdown field with preview mode.', 'large', {
    label: 'Decision body',
    name: 'decision_body',
    rows: 8,
    required: true,
  }, [
    { name: 'rows', type: 'number', defaultValue: 8, description: 'Textarea/editor height hint.' },
    { name: 'required', type: 'boolean', defaultValue: true, description: 'Requires content before submit.' },
    { name: 'placeholder', type: 'string', defaultValue: '', description: 'Editor placeholder.' },
  ], { markdown: '', preview: 'rendered from /api/markdown/preview', submitted: null }),
  form('password-meter', 'PasswordMeter', 'Validation', 'astro', 'Password strength indicator bound to a password input.', 'medium', {
    minLength: 12,
    label: 'Password strength',
  }, [
    { name: 'minLength', type: 'number', defaultValue: 12, description: 'Length rule threshold.' },
    { name: 'label', type: 'string', defaultValue: 'Password strength', description: 'Meter label.' },
  ], { password: 'redacted in submissions', strength: 0, submitted: null }),
  form('radio-group', 'RadioGroup', 'Choices', 'astro', 'Radio group with labels and option help.', 'medium', {
    name: 'strategy',
    legend: 'Release strategy',
    value: 'guarded',
    required: true,
  }, [
    { name: 'value', type: 'string', defaultValue: 'guarded', description: 'Selected radio value.' },
    { name: 'required', type: 'boolean', defaultValue: true, description: 'Requires one choice.' },
  ]),
  form('rich-markdown-editor', 'RichMarkdownEditor', 'Editors', 'react', 'Rich MDXEditor-based Markdown and MDX editing surface.', 'large', {
    label: 'Rich markdown',
    name: 'rich_markdown',
    required: true,
  }, [
    { name: 'initialMarkdown', type: 'string', defaultValue: '# Build a resilient launch loop', description: 'Initial editor document.' },
    { name: 'required', type: 'boolean', defaultValue: true, description: 'Requires content before submit.' },
  ], { markdown: '', submitted: null }),
  form('select-field', 'SelectField', 'Choices', 'react', 'Theme-aware React select form control.', 'small', {
    id: 'react-environment',
    name: 'react_environment',
    label: 'Environment',
    value: 'production',
    options: 3,
  }, [
    { name: 'value', type: 'string', defaultValue: 'production', description: 'Controlled selected option.' },
    { name: 'defaultValue', type: 'string', defaultValue: undefined, description: 'Initial uncontrolled selected option.' },
    { name: 'options', type: 'SelectOption[]', defaultValue: 3, description: 'Selectable options.' },
    { name: 'onChange', type: '(value: string) => void', defaultValue: undefined, description: 'Change callback.' },
  ], { react_environment: 'production', submitted: null }),
  form('select', 'Select', 'Choices', 'astro', 'Theme-aware native select control.', 'small', {
    name: 'environment',
    value: 'production',
    required: true,
  }, [
    { name: 'value', type: 'string', defaultValue: 'production', description: 'Selected option.' },
    { name: 'required', type: 'boolean', defaultValue: true, description: 'Requires a selected option.' },
  ]),
  form('text-field', 'TextField', 'Fields', 'react', 'Theme-aware React text and textarea form control.', 'small', {
    id: 'react-project',
    name: 'react_project',
    label: 'Project',
    value: 'Monitoring Console',
    multiline: false,
  }, [
    { name: 'value', type: 'string', defaultValue: 'Monitoring Console', description: 'Controlled field value.' },
    { name: 'defaultValue', type: 'string', defaultValue: undefined, description: 'Initial uncontrolled field value.' },
    { name: 'multiline', type: 'boolean', defaultValue: false, description: 'Renders a textarea instead of an input.' },
    { name: 'onChange', type: '(value: string) => void', defaultValue: undefined, description: 'Change callback.' },
  ], { react_project: 'Monitoring Console', submitted: null }),
  form('text-input', 'TextInput', 'Fields', 'astro', 'Theme-aware single-line input control.', 'small', {
    name: 'project',
    type: 'text',
    value: 'Monitoring Console',
    required: true,
  }, [
    { name: 'type', type: 'text | email | url | password | search | number | tel', defaultValue: 'text', description: 'Native input type.' },
    { name: 'value', type: 'string', defaultValue: 'Monitoring Console', description: 'Input value.' },
    { name: 'required', type: 'boolean', defaultValue: true, description: 'Requires a value.' },
  ]),
  form('textarea', 'Textarea', 'Fields', 'astro', 'Theme-aware multiline text input.', 'medium', {
    name: 'notes',
    rows: 5,
    value: 'Watch queue depth and deployment drift.',
  }, [
    { name: 'rows', type: 'number', defaultValue: 5, description: 'Visible row count.' },
    { name: 'value', type: 'string', defaultValue: 'Watch queue depth and deployment drift.', description: 'Textarea value.' },
  ]),
  form('theme-menu', 'ThemeMenu', 'Theme', 'astro', 'Popup appearance selector menu.', 'small', {
    selectedScheme: 'fern',
    selectedMode: 'system',
  }, [
    { name: 'selectedScheme', type: 'string', defaultValue: 'fern', description: 'Initial color scheme.' },
    { name: 'selectedMode', type: "'system' | 'light' | 'dark'", defaultValue: 'system', description: 'Initial theme mode.' },
  ], { scheme: 'fern', mode: 'system', submitted: null }, '@treeseed/ui/components/astro/theme/ThemeMenu.astro'),
  form('theme-selector', 'ThemeSelector', 'Theme', 'astro', 'Color scheme and mode selector.', 'medium', {
    selectedScheme: 'fern',
    selectedMode: 'system',
    compact: false,
  }, [
    { name: 'selectedScheme', type: 'string', defaultValue: 'fern', description: 'Initial color scheme.' },
    { name: 'selectedMode', type: "'system' | 'light' | 'dark'", defaultValue: 'system', description: 'Initial mode.' },
    { name: 'compact', type: 'boolean', defaultValue: false, description: 'Compact layout mode.' },
  ], { scheme: 'fern', mode: 'system', submitted: null }, '@treeseed/ui/components/astro/theme/ThemeSelector.astro'),

  display('action-list', 'ActionList', 'Data', 'astro', 'Actionable list rows with metadata.', 'medium', { items: 3 }, [
    { name: 'items', type: 'ActionListItem[]', defaultValue: 3, description: 'Rows to render.' },
  ]),
  display('badge', 'Badge', 'Data', 'astro', 'Compact status and category label.', 'inline', { tone: 'default', size: 'md' }, [
    { name: 'tone', type: 'Tone', defaultValue: 'default', description: 'Semantic color tone.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: 'md', description: 'Badge size.' },
  ]),
  display('card', 'Card', 'Surface', 'astro', 'Reusable content or link card.', 'medium', { tone: 'default', interactive: true }, [
    { name: 'href', type: 'string', defaultValue: undefined, description: 'Turns card into a link.' },
    { name: 'tone', type: 'Tone', defaultValue: 'default', description: 'Semantic color tone.' },
  ], undefined, '@treeseed/ui/components/astro/surface/Card.astro'),
  display('data-table', 'DataTable', 'Data', 'astro', 'Responsive tabular data.', 'large', { columns: 3, rows: 3 }, [
    { name: 'columns', type: 'DataTableColumn[]', defaultValue: 3, description: 'Column definitions.' },
    { name: 'rows', type: 'Record<string, unknown>[]', defaultValue: 3, description: 'Table rows.' },
  ]),
  display('empty-state', 'EmptyState', 'Surface', 'astro', 'Quiet empty state with optional actions.', 'medium', { title: 'No pending approvals', actions: 1 }, [
    { name: 'title', type: 'string', defaultValue: 'No pending approvals', description: 'Primary empty-state text.' },
    { name: 'actions', type: 'ButtonAction[]', defaultValue: 1, description: 'Optional action buttons.' },
  ], undefined, '@treeseed/ui/components/astro/surface/EmptyState.astro'),
  display('key-value-list', 'KeyValueList', 'Data', 'astro', 'Definition-list metadata display.', 'medium', { items: 3 }, [
    { name: 'items', type: 'KeyValueItem[]', defaultValue: 3, description: 'Metadata rows.' },
  ]),
  display('metric-card', 'MetricCard', 'Data', 'astro', 'Single operational metric card.', 'small', { label: 'Deployments', value: 18, tone: 'success' }, [
    { name: 'label', type: 'string', defaultValue: 'Deployments', description: 'Metric label.' },
    { name: 'value', type: 'string | number', defaultValue: 18, description: 'Displayed value.' },
    { name: 'tone', type: 'Tone', defaultValue: 'success', description: 'Semantic color tone.' },
  ]),
  display('metric-grid', 'MetricGrid', 'Data', 'astro', 'Responsive metric-card grid.', 'large', { metrics: 3, min: '12rem' }, [
    { name: 'metrics', type: 'MetricItem[]', defaultValue: 3, description: 'Metric cards to render.' },
    { name: 'min', type: 'string', defaultValue: '12rem', description: 'Minimum grid column width.' },
  ]),
  display('monitoring-chart', 'MonitoringChart', 'Charts', 'react', 'Realtime monitoring line chart with synthetic polling.', 'large', { title: 'Cluster Health', pollIntervalMs: 2000, maxPoints: 180 }, [
    { name: 'pollIntervalMs', type: '1000 | 2000 | 5000 | 10000 | null', defaultValue: 2000, description: 'Polling cadence.' },
    { name: 'maxPoints', type: 'number', defaultValue: 180, description: 'Series buffer size.' },
    { name: 'snapshotEndpoint', type: 'string', defaultValue: '/api/monitoring/snapshot', description: 'Snapshot endpoint.' },
  ], { pollCount: 0, sampleCount: 0 }),
  display('page-header', 'PageHeader', 'Layout', 'astro', 'Page title, description, and actions.', 'large', { title: 'PageHeader preview', actions: 1 }, [
    { name: 'title', type: 'string', defaultValue: 'PageHeader preview', description: 'Heading text.' },
    { name: 'actions', type: 'ButtonAction[]', defaultValue: 1, description: 'Header actions.' },
  ], undefined, '@treeseed/ui/components/astro/layout/PageHeader.astro'),
  display('panel', 'Panel', 'Surface', 'astro', 'Section panel with header, actions, and body.', 'medium', { title: 'Panel preview', tone: 'default' }, [
    { name: 'title', type: 'string', defaultValue: 'Panel preview', description: 'Panel heading.' },
    { name: 'tone', type: 'Tone', defaultValue: 'default', description: 'Semantic color tone.' },
  ], undefined, '@treeseed/ui/components/astro/surface/Panel.astro'),
  display('project-activity-chart', 'ProjectActivityChart', 'Charts', 'react', 'Realtime project activity area chart with synthetic polling.', 'large', { title: 'Project Activity', pollIntervalMs: 2000, maxEvents: 720 }, [
    { name: 'pollIntervalMs', type: '1000 | 2000 | 5000 | 10000 | null', defaultValue: 2000, description: 'Polling cadence.' },
    { name: 'maxEvents', type: 'number', defaultValue: 720, description: 'Event buffer size.' },
    { name: 'eventsEndpoint', type: 'string', defaultValue: '/api/project-activity/events', description: 'Events endpoint.' },
  ], { pollCount: 0, retainedEvents: 0 }),
  display('status-pill', 'StatusPill', 'Data', 'astro', 'Inline status with dot indicator.', 'inline', { tone: 'success', label: 'Healthy' }, [
    { name: 'tone', type: 'Tone', defaultValue: 'success', description: 'Semantic color tone.' },
    { name: 'label', type: 'string', defaultValue: 'Healthy', description: 'Status text.' },
  ]),
  display('theme-preview-swatch', 'ThemePreviewSwatch', 'Theme', 'astro', 'Color scheme preview swatch.', 'inline', { swatches: 4 }, [
    { name: 'swatches', type: 'string[]', defaultValue: 4, description: 'Preview colors.' },
  ], undefined, '@treeseed/ui/components/astro/theme/ThemePreviewSwatch.astro'),
  display('app-shell', 'AppShell', 'Shell', 'astro', 'Full application shell layout.', 'full-page', { navItems: 4, quickActions: 1 }, [
    { name: 'brand', type: 'Brand', defaultValue: 'TreeSeed', description: 'Shell brand.' },
    { name: 'navItems', type: 'NavItem[]', defaultValue: 4, description: 'Rail navigation.' },
  ], undefined, '@treeseed/ui/components/astro/shell/AppShell.astro'),
  display('bottom-nav', 'BottomNav', 'Shell', 'astro', 'Mobile bottom navigation.', 'medium', { items: 3, currentPath: '/displays/bottom-nav' }, [
    { name: 'items', type: 'NavItem[]', defaultValue: 3, description: 'Navigation items.' },
    { name: 'currentPath', type: 'string', defaultValue: '/displays/bottom-nav', description: 'Current path marker.' },
  ], undefined, '@treeseed/ui/components/astro/shell/BottomNav.astro'),
  display('project-header', 'ProjectHeader', 'Shell', 'astro', 'Project context header with badges, actions, and tabs.', 'large', { badges: 2, tabs: 2, actions: 1 }, [
    { name: 'title', type: 'string', defaultValue: 'ProjectHeader', description: 'Project title.' },
    { name: 'tabs', type: 'TabItem[]', defaultValue: 2, description: 'Project tabs.' },
  ], undefined, '@treeseed/ui/components/astro/shell/ProjectHeader.astro'),
  display('public-footer', 'PublicFooter', 'Shell', 'astro', 'Public marketing footer.', 'large', { groups: 2 }, [
    { name: 'brandName', type: 'string', defaultValue: 'TreeSeed UI', description: 'Footer brand.' },
    { name: 'groups', type: 'FooterGroup[]', defaultValue: 2, description: 'Footer link groups.' },
  ], undefined, '@treeseed/ui/components/astro/shell/PublicFooter.astro'),
  display('public-shell', 'PublicShell', 'Shell', 'astro', 'Full public site shell layout.', 'full-page', { navItems: 2, actions: 1 }, [
    { name: 'brand', type: 'Brand', defaultValue: 'TreeSeed', description: 'Shell brand.' },
    { name: 'navItems', type: 'NavItem[]', defaultValue: 2, description: 'Public navigation.' },
  ], undefined, '@treeseed/ui/components/astro/shell/PublicShell.astro'),
  display('rail-nav', 'RailNav', 'Shell', 'astro', 'Application rail navigation.', 'medium', { items: 4, currentPath: '/displays/rail-nav' }, [
    { name: 'items', type: 'NavItem[]', defaultValue: 4, description: 'Navigation links.' },
  ], undefined, '@treeseed/ui/components/astro/shell/RailNav.astro'),
  display('shell-icon-link', 'ShellIconLink', 'Shell', 'astro', 'Icon-only shell utility link.', 'inline', { icon: 'book' }, [
    { name: 'icon', type: "'book' | 'manager'", defaultValue: 'book', description: 'Icon glyph.' },
    { name: 'label', type: 'string', defaultValue: 'Book home', description: 'Accessible label.' },
  ], undefined, '@treeseed/ui/components/astro/shell/ShellIconLink.astro'),
  display('top-bar', 'TopBar', 'Shell', 'astro', 'Brand and utility action bar.', 'large', { brand: 'TreeSeed', actions: 1 }, [
    { name: 'brand', type: 'Brand', defaultValue: 'TreeSeed', description: 'Top bar brand.' },
    { name: 'actions', type: 'ButtonAction[]', defaultValue: 1, description: 'Utility actions.' },
  ], undefined, '@treeseed/ui/components/astro/shell/TopBar.astro'),
];

export const formComponents = componentCatalog.filter((entry) => entry.kind === 'form');
export const displayComponents = componentCatalog.filter((entry) => entry.kind === 'display');

export function findComponent(kind: ComponentKind, id: string | undefined) {
  return componentCatalog.find((entry) => entry.kind === kind && entry.id === id);
}
