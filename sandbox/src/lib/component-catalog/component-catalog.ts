
import { ComponentCatalogEntry, display, form } from './component-kind.ts';

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
  display('resource-card', 'ResourceCard', 'Surface', 'astro', 'Compact resource summary card.', 'medium', { title: 'Question record', status: 'recorded' }, [
    { name: 'title', type: 'string', defaultValue: 'Question record', description: 'Resource title.' },
    { name: 'status', type: 'string', defaultValue: 'recorded', description: 'Optional status badge.' },
  ], undefined, '@treeseed/ui/components/astro/surface/ResourceCard.astro'),
  display('readiness-summary', 'ReadinessSummary', 'Service', 'astro', 'Service readiness list with setup and advanced diagnostics states.', 'large', { items: 3 }, [
    { name: 'viewModel', type: 'ReadinessSummaryViewModel', defaultValue: { items: 3 }, description: 'Policy-safe readiness summary.' },
    { name: 'showAdvanced', type: 'boolean', defaultValue: false, description: 'Shows advanced diagnostics when enabled.' },
  ], undefined, '@treeseed/ui/components/astro/service/ReadinessSummary.astro'),
  display('distribution-summary', 'DistributionSummary', 'Distribution', 'astro', 'Distribution listing with release, entitlement, delivery, and action state.', 'large', { items: 3 }, [
    { name: 'viewModel', type: 'DistributionSummaryViewModel', defaultValue: { items: 3 }, description: 'Policy-safe distribution summary.' },
  ], undefined, '@treeseed/ui/components/astro/distribution/DistributionSummary.astro'),
  display('overlay-status', 'OverlayStatus', 'Distribution', 'astro', 'Policy-gated overlay editing status with lazy editor intent action.', 'medium', { state: 'preview' }, [
    { name: 'viewModel', type: 'OverlayStatusViewModel', defaultValue: { state: 'preview' }, description: 'Overlay bootstrap state.' },
  ], undefined, '@treeseed/ui/components/astro/distribution/OverlayStatus.astro'),
  display('allocation-panel', 'AllocationPanel', 'Operating Loop', 'astro', 'Allocation summary with desired, inherited, scheduled, active, and actual states.', 'large', { items: 2 }, [
    { name: 'viewModel', type: 'AllocationViewModel', defaultValue: { items: 2 }, description: 'Policy-shaped allocation view model.' },
  ], undefined, '@treeseed/ui/components/astro/operating/AllocationPanel.astro'),
  display('allocation-tree', 'AllocationTree', 'Operating Loop', 'astro', 'Nested allocation drilldown tree from team portfolio to provider grants.', 'large', { nodes: 3 }, [
    { name: 'nodes', type: 'AllocationTreeNode[]', defaultValue: 3, description: 'Nested allocation nodes.' },
  ], undefined, '@treeseed/ui/components/astro/operating/AllocationTree.astro'),
  display('allocation-state-legend', 'AllocationStateLegend', 'Operating Loop', 'astro', 'Shared legend for allocation and workday operating states.', 'inline', { statuses: 7 }, [
    { name: 'statuses', type: 'OperatingStatus[]', defaultValue: 7, description: 'Statuses to explain.' },
  ], undefined, '@treeseed/ui/components/astro/operating/AllocationStateLegend.astro'),
  display('work-queue-summary', 'WorkQueueSummary', 'Operating Loop', 'astro', 'Work queue summary for running, blocked, failed, and review-needed items.', 'large', { items: 2 }, [
    { name: 'viewModel', type: 'WorkQueueViewModel', defaultValue: { items: 2 }, description: 'Policy-shaped work queue.' },
  ], undefined, '@treeseed/ui/components/astro/operating/WorkQueueSummary.astro'),
  display('activity-timeline', 'ActivityTimeline', 'Operating Loop', 'astro', 'Direction, allocation, agent, workday, and audit timeline.', 'large', { items: 2 }, [
    { name: 'viewModel', type: 'ActivityTimelineViewModel', defaultValue: { items: 2 }, description: 'Timeline view model.' },
  ], undefined, '@treeseed/ui/components/astro/operating/ActivityTimeline.astro'),
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
  display('action-bar', 'ActionBar', 'Layout', 'astro', 'Resolved action renderer with disabled reasons.', 'medium', { actions: 2 }, [
    { name: 'actions', type: 'ResolvedAction[]', defaultValue: 2, description: 'Policy-resolved actions.' },
    { name: 'label', type: 'string', defaultValue: 'Page actions', description: 'Navigation label.' },
  ], undefined, '@treeseed/ui/components/astro/layout/ActionBar.astro'),
  display('feedback-button', 'FeedbackButton', 'Feedback', 'astro', 'Shell feedback trigger bound to a shared dialog.', 'inline', { targetId: 'catalog-feedback' }, [
    { name: 'targetId', type: 'string', defaultValue: 'catalog-feedback', description: 'Dialog id to open.' },
    { name: 'label', type: 'string', defaultValue: 'Feedback', description: 'Visible button text.' },
  ], undefined, '@treeseed/ui/components/astro/feedback/FeedbackButton.astro'),
  display('feedback-dialog', 'FeedbackDialog', 'Feedback', 'astro', 'Feedback form with typed context and optional screenshot capture.', 'medium', { typeOptions: 5, screenshot: 'optional' }, [
    { name: 'context', type: 'FeedbackContext', defaultValue: { shell: 'public' }, description: 'Policy-safe page context.' },
    { name: 'id', type: 'string', defaultValue: 'catalog-feedback', description: 'Dialog id.' },
  ], undefined, '@treeseed/ui/components/astro/feedback/FeedbackDialog.astro'),
  display('feedback-redaction-boundary', 'FeedbackRedactionBoundary', 'Feedback', 'astro', 'Marks sensitive DOM regions for feedback screenshot masking.', 'inline', { reason: 'secret' }, [
    { name: 'reason', type: 'string', defaultValue: 'secret', description: 'Redaction reason marker.' },
  ], undefined, '@treeseed/ui/components/astro/feedback/FeedbackRedactionBoundary.astro'),
  display('help-button', 'HelpButton', 'Help', 'astro', 'Shell help trigger bound to the shared contextual drawer.', 'inline', { targetId: 'catalog-help' }, [
    { name: 'targetId', type: 'string', defaultValue: 'catalog-help', description: 'Drawer id to open.' },
    { name: 'label', type: 'string', defaultValue: 'Help', description: 'Visible button text.' },
  ], undefined, '@treeseed/ui/components/astro/help/HelpButton.astro'),
  display('help-drawer', 'HelpDrawer', 'Help', 'astro', 'Contextual help drawer with lazy scoped search and feedback handoff.', 'medium', { topics: 2, actions: 2 }, [
    { name: 'context', type: 'HelpContext', defaultValue: { shell: 'product' }, description: 'Policy-safe help context.' },
    { name: 'id', type: 'string', defaultValue: 'catalog-help', description: 'Drawer id.' },
  ], undefined, '@treeseed/ui/components/astro/help/HelpDrawer.astro'),
  display('help-popover', 'HelpPopover', 'Help', 'astro', 'Compact contextual help summary for shell drawers.', 'small', { topics: 2 }, [
    { name: 'context', type: 'HelpContext', defaultValue: { shell: 'product' }, description: 'Policy-safe help context.' },
  ], undefined, '@treeseed/ui/components/astro/help/HelpPopover.astro'),
  display('contextual-help-panel', 'ContextualHelpPanel', 'Help', 'astro', 'Full help panel with topics, action explanations, and feedback handoff.', 'medium', { topics: 2, actions: 2 }, [
    { name: 'context', type: 'HelpContext', defaultValue: { shell: 'product' }, description: 'Policy-safe help context.' },
    { name: 'feedbackTargetId', type: 'string | undefined', defaultValue: 'catalog-feedback', description: 'Optional feedback dialog id.' },
  ], undefined, '@treeseed/ui/components/astro/help/ContextualHelpPanel.astro'),
  display('help-topic-link', 'HelpTopicLink', 'Help', 'astro', 'Policy-safe link to a contextual help topic.', 'inline', { topicId: 'questions' }, [
    { name: 'topic', type: 'HelpTopicLink', defaultValue: { title: 'Questions' }, description: 'Topic link metadata.' },
  ], undefined, '@treeseed/ui/components/astro/help/HelpTopicLink.astro'),
  display('help-action-list', 'HelpActionList', 'Help', 'astro', 'Resolved action help with unavailable-state reasons and remediation.', 'medium', { actions: 2 }, [
    { name: 'actions', type: 'ResolvedAction[]', defaultValue: 2, description: 'Policy-resolved actions.' },
  ], undefined, '@treeseed/ui/components/astro/help/HelpActionList.astro'),
  display('permission-boundary', 'PermissionBoundary', 'Patterns', 'astro', 'Permission state boundary for allowed and denied content.', 'medium', { state: 'allowed' }, [
    { name: 'state', type: 'ResolvedActionState', defaultValue: 'allowed', description: 'Resolved permission state.' },
    { name: 'remediation', type: 'string', defaultValue: undefined, description: 'Optional remediation text.' },
  ], undefined, '@treeseed/ui/components/astro/patterns/PermissionBoundary.astro'),
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
  display('theme-script', 'ThemeScript', 'Theme', 'astro', 'Document theme bootstrap script and optional generated theme CSS.', 'inline', { defaultScheme: 'fern', defaultMode: 'system', includeCss: false }, [
    { name: 'defaultScheme', type: 'ThemePreference["scheme"]', defaultValue: 'fern', description: 'Initial color scheme.' },
    { name: 'defaultMode', type: 'ThemePreference["mode"]', defaultValue: 'system', description: 'Initial theme mode.' },
    { name: 'includeCss', type: 'boolean', defaultValue: false, description: 'Whether to emit generated theme CSS.' },
  ], undefined, '@treeseed/ui/components/astro/theme/ThemeScript.astro'),
  display('product-shell', 'ProductShell', 'Shells', 'astro', 'Authenticated application shell compatibility wrapper backed by the new shell primitives.', 'full-page', { navItems: 4, quickActions: 1 }, [
    { name: 'brand', type: 'Brand', defaultValue: 'TreeSeed', description: 'Shell brand.' },
    { name: 'navItems', type: 'NavItem[]', defaultValue: 4, description: 'Rail navigation.' },
  ], undefined, '@treeseed/ui/components/astro/shell/ProductShell.astro'),
  display('shell-frame', 'ShellFrame', 'Shells', 'astro', 'Shared document, theme, help, and feedback frame for TreeSeed shells.', 'full-page', { shell: 'document frame' }, [
    { name: 'title', type: 'string', defaultValue: 'ShellFrame', description: 'Document title.' },
    { name: 'appearance', type: 'ThemePreference', defaultValue: { scheme: 'fern', mode: 'system' }, description: 'Initial appearance.' },
  ], undefined, '@treeseed/ui/components/astro/shell/ShellFrame.astro'),
  display('shell-header', 'ShellHeader', 'Shells', 'astro', 'Responsive brand header with optional mobile operations trigger.', 'medium', { brand: 'TreeSeed', showMenuButton: true }, [
    { name: 'brand', type: 'ShellBrand', defaultValue: 'TreeSeed', description: 'Brand identity.' },
    { name: 'showMenuButton', type: 'boolean', defaultValue: true, description: 'Shows the mobile drawer trigger.' },
  ], undefined, '@treeseed/ui/components/astro/shell/ShellHeader.astro'),
  display('site-user-controls', 'SiteUserControls', 'Shells', 'astro', 'Site links, theme selection, help, feedback, and account utility controls.', 'large', { links: 3, utilities: 4 }, [
    { name: 'items', type: 'SiteUserControlItem[]', defaultValue: 3, description: 'Site-level links.' },
    { name: 'showAppearanceControl', type: 'boolean', defaultValue: true, description: 'Shows theme controls.' },
  ], undefined, '@treeseed/ui/components/astro/shell/SiteUserControls.astro'),
  display('team-operations-panel', 'TeamOperationsPanel', 'Shells', 'astro', 'Desktop team selector, team operations navigation, team actions, and account actions.', 'large', { items: 5, quickActions: 2 }, [
    { name: 'items', type: 'ShellNavItem[]', defaultValue: 5, description: 'Team operation links.' },
    { name: 'quickActions', type: 'ButtonAction[]', defaultValue: 2, description: 'Team action buttons.' },
  ], undefined, '@treeseed/ui/components/astro/shell/TeamOperationsPanel.astro'),
  display('team-operations-drawer', 'TeamOperationsDrawer', 'Shells', 'astro', 'Mobile drawer container for team operations, site controls, and account actions.', 'large', { title: 'Team operations' }, [
    { name: 'id', type: 'string', defaultValue: 'team-operations-drawer', description: 'Drawer id.' },
    { name: 'title', type: 'string', defaultValue: 'Team operations', description: 'Drawer heading.' },
  ], undefined, '@treeseed/ui/components/astro/shell/TeamOperationsDrawer.astro'),
  display('control-surface', 'ControlSurface', 'Shells', 'astro', 'Canonical display/control surface with header, actions, tabs, and content slots.', 'large', { title: 'Control surface', actions: 1, tabs: 3 }, [
    { name: 'title', type: 'string', defaultValue: 'Control surface', description: 'Surface heading.' },
    { name: 'description', type: 'string', defaultValue: 'Page content container.', description: 'Surface description.' },
  ], undefined, '@treeseed/ui/components/astro/shell/ControlSurface.astro'),
  display('surface-tabs', 'SurfaceTabs', 'Shells', 'astro', 'Responsive canonical surface tabs for link navigation and in-page panels.', 'large', { mode: 'links', items: 3 }, [
    { name: 'items', type: 'SurfaceTabItem[]', defaultValue: 3, description: 'Tabs to render.' },
    { name: 'mode', type: "'links' | 'panels'", defaultValue: 'links', description: 'Navigation or panel behavior.' },
  ], undefined, '@treeseed/ui/components/astro/shell/SurfaceTabs.astro'),
  display('bottom-nav', 'BottomNav', 'Deprecated compatibility', 'astro', 'Deprecated mobile bottom navigation kept for one migration cycle; use ShellHeader and TeamOperationsDrawer instead.', 'medium', { items: 3, currentPath: '/displays/bottom-nav' }, [
    { name: 'items', type: 'NavItem[]', defaultValue: 3, description: 'Navigation items.' },
    { name: 'currentPath', type: 'string', defaultValue: '/displays/bottom-nav', description: 'Current path marker.' },
  ], undefined, '@treeseed/ui/components/astro/shell/BottomNav.astro', 'deprecated', 'ShellHeader + TeamOperationsDrawer'),
  display('project-header', 'ProjectHeader', 'Shells', 'astro', 'Project context header with badges, actions, and tabs.', 'large', { badges: 2, tabs: 2, actions: 1 }, [
    { name: 'title', type: 'string', defaultValue: 'ProjectHeader', description: 'Project title.' },
    { name: 'tabs', type: 'TabItem[]', defaultValue: 2, description: 'Project tabs.' },
  ], undefined, '@treeseed/ui/components/astro/shell/ProjectHeader.astro'),
  display('public-footer', 'PublicFooter', 'Shells', 'astro', 'Public marketing footer.', 'large', { groups: 2 }, [
    { name: 'brandName', type: 'string', defaultValue: 'TreeSeed UI', description: 'Footer brand.' },
    { name: 'groups', type: 'FooterGroup[]', defaultValue: 2, description: 'Footer link groups.' },
  ], undefined, '@treeseed/ui/components/astro/shell/PublicFooter.astro'),
  display('public-shell', 'PublicShell', 'Shells', 'astro', 'Public shell compatibility wrapper backed by PublicSingleColumnShell.', 'full-page', { navItems: 2, actions: 1 }, [
    { name: 'brand', type: 'Brand', defaultValue: 'TreeSeed', description: 'Shell brand.' },
    { name: 'navItems', type: 'NavItem[]', defaultValue: 2, description: 'Public navigation.' },
  ], undefined, '@treeseed/ui/components/astro/shell/PublicShell.astro'),
  display('public-single-column-shell', 'PublicSingleColumnShell', 'Public', 'astro', 'Public single-column shell for marketing, profile, and knowledge pages.', 'full-page', { sections: 3, actions: 1 }, [
    { name: 'brand', type: 'ShellBrand', defaultValue: 'TreeSeed', description: 'Public brand identity.' },
    { name: 'navItems', type: 'SiteUserControlItem[]', defaultValue: 3, description: 'Public site links.' },
  ], undefined, '@treeseed/ui/components/astro/public/PublicSingleColumnShell.astro'),
  display('public-stack', 'PublicStack', 'Public', 'astro', 'Vertical stack primitive for public single-column pages.', 'large', { sections: 3 }, [
    { name: 'class', type: 'string', defaultValue: undefined, description: 'Optional class name.' },
  ], undefined, '@treeseed/ui/components/astro/public/PublicStack.astro'),
  display('public-section', 'PublicSection', 'Public', 'astro', 'Reusable public page section with heading, actions, and tone.', 'large', { title: 'Public section', tone: 'panel' }, [
    { name: 'tone', type: "'plain' | 'panel' | 'accent'", defaultValue: 'panel', description: 'Section treatment.' },
    { name: 'actions', type: 'PublicSectionAction[]', defaultValue: 1, description: 'Section actions.' },
  ], undefined, '@treeseed/ui/components/astro/public/PublicSection.astro'),
  display('public-hero-section', 'PublicHeroSection', 'Public', 'astro', 'Accent public hero section for single-column pages.', 'large', { title: 'Public hero', actions: 2 }, [
    { name: 'title', type: 'string', defaultValue: 'Public hero', description: 'Hero title.' },
    { name: 'actions', type: 'PublicSectionAction[]', defaultValue: 2, description: 'Hero actions.' },
  ], undefined, '@treeseed/ui/components/astro/public/PublicHeroSection.astro'),
  display('public-profile-header', 'PublicProfileHeader', 'Public', 'astro', 'Public user, team, or project profile masthead.', 'large', { name: 'Continuity Studio', handle: '@continuity' }, [
    { name: 'name', type: 'string', defaultValue: 'Continuity Studio', description: 'Profile display name.' },
    { name: 'handle', type: 'string', defaultValue: '@continuity', description: 'Optional handle.' },
  ], undefined, '@treeseed/ui/components/astro/public/PublicProfileHeader.astro'),
  display('public-knowledge-section', 'PublicKnowledgeSection', 'Public', 'astro', 'Public knowledge/book section variant for single-column pages.', 'large', { title: 'Knowledge section' }, [
    { name: 'title', type: 'string', defaultValue: 'Knowledge section', description: 'Knowledge section heading.' },
    { name: 'actions', type: 'PublicSectionAction[]', defaultValue: 1, description: 'Knowledge section actions.' },
  ], undefined, '@treeseed/ui/components/astro/public/PublicKnowledgeSection.astro'),
  display('collection-template', 'CollectionTemplate', 'Templates', 'astro', 'Collection page template for resource lists.', 'full-page', { rows: 3, actions: 1 }, [
    { name: 'viewModel', type: 'CollectionViewModel', defaultValue: { rows: 3 }, description: 'Collection view model.' },
    { name: 'actions', type: 'ResolvedAction[]', defaultValue: 1, description: 'Resolved actions.' },
  ], undefined, '@treeseed/ui/components/astro/templates/CollectionTemplate.astro'),
  display('dashboard-template', 'DashboardTemplate', 'Templates', 'astro', 'Context dashboard template for personal, team, project, and market surfaces.', 'full-page', { sections: 4, actions: 2 }, [
    { name: 'viewModel', type: 'DashboardViewModel', defaultValue: { sections: 4 }, description: 'Dashboard view model.' },
    { name: 'actions', type: 'ResolvedAction[]', defaultValue: 2, description: 'Resolved actions.' },
  ], undefined, '@treeseed/ui/components/astro/templates/DashboardTemplate.astro'),
  display('detail-template', 'DetailTemplate', 'Templates', 'astro', 'Detail page template for one resource.', 'full-page', { metadata: 3, actions: 1 }, [
    { name: 'title', type: 'string', defaultValue: 'Question detail', description: 'Detail title.' },
    { name: 'metadata', type: 'MetadataItem[]', defaultValue: 3, description: 'Aside metadata.' },
  ], undefined, '@treeseed/ui/components/astro/templates/DetailTemplate.astro'),
  display('reader-template', 'ReaderTemplate', 'Templates', 'astro', 'Reader page template for long-form knowledge.', 'full-page', { navItems: 3 }, [
    { name: 'title', type: 'string', defaultValue: 'Knowledge page', description: 'Reader title.' },
    { name: 'navItems', type: 'NavItem[]', defaultValue: 3, description: 'Reader navigation.' },
  ], undefined, '@treeseed/ui/components/astro/templates/ReaderTemplate.astro'),
  display('settings-template', 'SettingsTemplate', 'Templates', 'astro', 'Settings page template with section navigation.', 'full-page', { sections: 3 }, [
    { name: 'title', type: 'string', defaultValue: 'Settings', description: 'Settings title.' },
    { name: 'sections', type: 'SectionLink[]', defaultValue: 3, description: 'Settings sections.' },
  ], undefined, '@treeseed/ui/components/astro/templates/SettingsTemplate.astro'),
  display('workspace-template', 'WorkspaceTemplate', 'Templates', 'astro', 'Operating workspace template for workdays, agents, and allocation loops.', 'full-page', { sections: 3 }, [
    { name: 'viewModel', type: 'WorkspaceViewModel', defaultValue: { sections: 3 }, description: 'Workspace view model.' },
    { name: 'actions', type: 'ResolvedAction[]', defaultValue: 1, description: 'Resolved actions.' },
  ], undefined, '@treeseed/ui/components/astro/templates/WorkspaceTemplate.astro'),
  display('rail-nav', 'RailNav', 'Deprecated compatibility', 'astro', 'Deprecated application rail navigation kept for one migration cycle; use TeamOperationsPanel instead.', 'medium', { items: 4, currentPath: '/displays/rail-nav' }, [
    { name: 'items', type: 'NavItem[]', defaultValue: 4, description: 'Navigation links.' },
  ], undefined, '@treeseed/ui/components/astro/shell/RailNav.astro', 'deprecated', 'TeamOperationsPanel'),
  display('shell-icon-link', 'ShellIconLink', 'Shells', 'astro', 'Icon-only shell utility link.', 'inline', { icon: 'book' }, [
    { name: 'icon', type: "'book' | 'manager'", defaultValue: 'book', description: 'Icon glyph.' },
    { name: 'label', type: 'string', defaultValue: 'Book home', description: 'Accessible label.' },
  ], undefined, '@treeseed/ui/components/astro/shell/ShellIconLink.astro'),
  display('top-bar', 'TopBar', 'Shells', 'astro', 'Brand and utility action bar.', 'large', { brand: 'TreeSeed', actions: 1 }, [
    { name: 'brand', type: 'Brand', defaultValue: 'TreeSeed', description: 'Top bar brand.' },
    { name: 'actions', type: 'ButtonAction[]', defaultValue: 1, description: 'Utility actions.' },
  ], undefined, '@treeseed/ui/components/astro/shell/TopBar.astro'),
];
