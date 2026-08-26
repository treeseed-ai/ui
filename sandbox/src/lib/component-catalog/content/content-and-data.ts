import type { ComponentCatalogEntry } from '../support/component-kind.ts';
import { display } from '../support/component-kind.ts';

export const contentAndDataComponents: ComponentCatalogEntry[] = [
  display('entity-collection', 'EntityCollection', 'Data', 'astro', 'Responsive filterable card collection for operational entities.', 'large', { items: 2 }, [
      { name: 'items', type: 'EntityCollectionItem[]', defaultValue: 2, description: 'Server-authorized entity summaries.' },
      { name: 'nextHref', type: 'string', defaultValue: undefined, description: 'Cursor-backed next-page destination.' },
    ], undefined, '@treeseed/ui/components/astro/data/entities/EntityCollection.astro'),
  display('entity-filter-toolbar', 'EntityFilterToolbar', 'Data', 'astro', 'Shared URL-backed search and status filters for entity collections.', 'medium', { query: 'guide', status: 'running' }, [
      { name: 'query', type: 'string', defaultValue: '', description: 'Current text filter.' },
      { name: 'status', type: 'string', defaultValue: '', description: 'Current status filter.' },
    ], undefined, '@treeseed/ui/components/astro/data/entities/EntityFilterToolbar.astro'),
  display('knowledge-project-collection', 'KnowledgeProjectCollection', 'Knowledge', 'astro', 'Responsive project collection for repository-native books and authoring entry points.', 'large', { projects: 2 }, [
      { name: 'projects', type: 'ProjectItem[]', defaultValue: 2, description: 'Authorized projects with TreeDX readiness and knowledge counts.' },
    ], undefined, '@treeseed/ui/components/astro/knowledge/KnowledgeProjectCollection.astro'),
  display('knowledge-authoring-form', 'KnowledgeAuthoringForm', 'Knowledge', 'astro', 'Schema-driven book and page metadata with the canonical rich Markdown editor.', 'large', { kind: 'page' }, [
      { name: 'workspaceId', type: 'string', defaultValue: 'workspace-preview', description: 'TreeDX authoring workspace correlation.' },
      { name: 'values', type: 'Record<string, unknown>', defaultValue: { kind: 'page' }, description: 'Validated draft metadata and Markdown body.' },
    ], undefined, '@treeseed/ui/components/astro/knowledge/KnowledgeAuthoringForm.astro'),
  display('knowledge-relation-picker', 'KnowledgeRelationPicker', 'Knowledge', 'react', 'Authorized knowledge search and stable relationship selection with derived backlinks.', 'large', { initialIds: ['account.identity'] }, [
      { name: 'initialIds', type: 'string[]', defaultValue: ['account.identity'], description: 'Existing stable knowledge-page relationships.' },
      { name: 'searchEndpoint', type: 'string', defaultValue: '/v1/knowledge/search', description: 'Policy-filtered TreeDX knowledge search endpoint.' },
    ], undefined, '@treeseed/ui/components/react/KnowledgeRelationPicker'),
  display('knowledge-review-collection', 'KnowledgeReviewCollection', 'Knowledge', 'astro', 'Review queue with source revisions, user-time-zone timestamps, and structured decisions.', 'large', { reviews: 1 }, [
      { name: 'reviews', type: 'KnowledgeReview[]', defaultValue: 1, description: 'Authorized review records.' },
      { name: 'timeZone', type: 'string', defaultValue: 'UTC', description: 'Signed-in user IANA time zone.' },
    ], undefined, '@treeseed/ui/components/astro/knowledge/KnowledgeReviewCollection.astro'),
  display('knowledge-outline', 'KnowledgeOutline', 'Knowledge', 'astro', 'Expandable ordered book and page outline with policy-resolved management actions.', 'large', { books: 1, pages: 2 }, [
      { name: 'books', type: 'OutlineBook[]', defaultValue: 1, description: 'Books and their authorized ordered pages.' },
    ], undefined, '@treeseed/ui/components/astro/knowledge/KnowledgeOutline.astro'),
  display('knowledge-outline-branch', 'KnowledgeOutlineBranch', 'Knowledge', 'astro', 'Recursive ordered page branch used by the shared knowledge outline.', 'large', { pages: 2 }, [
      { name: 'pages', type: 'OutlinePage[]', defaultValue: 2, description: 'Pages in the current authorized outline.' },
      { name: 'parentId', type: 'string', defaultValue: undefined, description: 'Optional parent page for a nested branch.' },
    ], undefined, '@treeseed/ui/components/astro/knowledge/outline/KnowledgeOutlineBranch.astro'),
  display('knowledge-pack-workbench', 'KnowledgePackWorkbench', 'Knowledge', 'astro', 'Saved book collections and immutable TreeDX snapshot pack builds.', 'large', { books: 3, collections: 1, builds: 1 }, [
      { name: 'books', type: 'BookDefinition[]', defaultValue: 3, description: 'Authorized pack-ready books.' },
      { name: 'collections', type: 'BookCollectionDefinition[]', defaultValue: 1, description: 'Saved and managed book selections.' },
      { name: 'builds', type: 'KnowledgePackBuild[]', defaultValue: 1, description: 'Immutable pack build history.' },
    ], undefined, '@treeseed/ui/components/astro/knowledge/KnowledgePackWorkbench.astro'),
  display('knowledge-lifecycle-panel', 'KnowledgeLifecyclePanel', 'Knowledge', 'astro', 'Fail-closed archive and restore preparation with visible graph and pack dependencies.', 'large', { kind: 'page', status: 'published' }, [
      { name: 'kind', type: "'book' | 'page'", defaultValue: 'page', description: 'Repository-native content kind.' },
      { name: 'dependencies', type: 'KnowledgeLifecycleDependencies', defaultValue: {}, description: 'Authorized blockers resolved from TreeDX and saved collections.' },
    ], undefined, '@treeseed/ui/components/astro/knowledge/KnowledgeLifecyclePanel.astro'),
  display('knowledge-publication-status', 'KnowledgePublicationStatus', 'Knowledge', 'astro', 'Per-project source, graph, and atomic publication parity status.', 'large', { projects: 1 }, [
      { name: 'status', type: 'KnowledgePublicationStatus', defaultValue: { projects: 1 }, description: 'Authorized atomic publication state.' },
      { name: 'timeZone', type: 'string', defaultValue: 'UTC', description: 'Signed-in user IANA time zone.' },
    ], undefined, '@treeseed/ui/components/astro/knowledge/KnowledgePublicationStatus.astro'),
  display('action-list', 'ActionList', 'Data', 'astro', 'Actionable list rows with metadata.', 'medium', { items: 3 }, [
      { name: 'items', type: 'ActionListItem[]', defaultValue: 3, description: 'Rows to render.' },
    ]),
  display('badge', 'Badge', 'Data', 'astro', 'Compact status and category label.', 'inline', { tone: 'default', size: 'md' }, [
      { name: 'tone', type: 'Tone', defaultValue: 'default', description: 'Semantic color tone.' },
      { name: 'size', type: "'sm' | 'md'", defaultValue: 'md', description: 'Badge size.' },
    ]),
  display('countdown', 'Countdown', 'Data', 'astro', 'Accessible live countdown paired with a time-zone-aware deadline.', 'small', { target: '2026-08-26T18:30:00.000Z' }, [
      { name: 'target', type: 'string | number | Date', defaultValue: '2026-08-26T18:30:00.000Z', description: 'Countdown deadline instant.' },
      { name: 'startedAt', type: 'string | number | Date', defaultValue: undefined, description: 'Optional window start for progress.' },
      { name: 'timeZone', type: 'string', defaultValue: 'UTC', description: 'IANA display time zone.' },
    ], undefined, '@treeseed/ui/components/astro/data/Countdown.astro'),
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
  display('data-table', 'DataTable', 'Data', 'astro', 'Responsive tabular data.', 'large', { columns: 3, rows: 3 }, [
      { name: 'columns', type: 'DataTableColumn[]', defaultValue: 3, description: 'Column definitions.' },
      { name: 'rows', type: 'Record<string, unknown>[]', defaultValue: 3, description: 'Table rows.' },
    ]),
  display('responsive-table', 'ResponsiveTable', 'Data', 'astro', 'Canonical responsive table shell for rich custom cell content.', 'large', { columns: 2, rows: 2 }, [
      { name: 'caption', type: 'string', defaultValue: 'Team members', description: 'Accessible table caption.' },
    ]),
  display('disclosure-list', 'DisclosureList', 'Data', 'astro', 'Expandable summary with readable responsibility details.', 'medium', { title: 'Project lead', items: 2 }, [
      { name: 'title', type: 'string', defaultValue: 'Project lead', description: 'Disclosure heading.' },
      { name: 'items', type: 'DisclosureItem[]', defaultValue: 2, description: 'Readable detail rows.' },
      { name: 'open', type: 'boolean', defaultValue: false, description: 'Initial expanded state.' },
    ]),
  display('key-value-list', 'KeyValueList', 'Data', 'astro', 'Definition-list metadata display.', 'medium', { items: 3 }, [
      { name: 'items', type: 'KeyValueItem[]', defaultValue: 3, description: 'Metadata rows.' },
    ]),
  display('metric-card', 'MetricCard', 'Data', 'astro', 'Single operational metric card.', 'small', { label: 'Deployments', value: 18, tone: 'success' }, [
      { name: 'label', type: 'string', defaultValue: 'Deployments', description: 'Metric label.' },
      { name: 'value', type: 'string | number', defaultValue: 18, description: 'Displayed value.' },
      { name: 'href', type: 'string', defaultValue: undefined, description: 'Optional destination for an interactive metric.' },
      { name: 'tone', type: 'Tone', defaultValue: 'success', description: 'Semantic color tone.' },
    ], undefined, '@treeseed/ui/components/astro/data/metrics/MetricCard.astro'),
  display('metric-grid', 'MetricGrid', 'Data', 'astro', 'Responsive metric-card grid.', 'large', { metrics: 3, min: '12rem' }, [
      { name: 'metrics', type: 'MetricItem[]', defaultValue: 3, description: 'Metric cards to render.' },
      { name: 'min', type: 'string', defaultValue: '12rem', description: 'Minimum grid column width.' },
    ], undefined, '@treeseed/ui/components/astro/data/metrics/MetricGrid.astro'),
  display('metric-grid-public-entrypoint', 'MetricGrid', 'Data', 'astro', 'Stable flattened entrypoint for the responsive metric-card grid.', 'large', { metrics: 3, min: '12rem' }, [
      { name: 'metrics', type: 'MetricItem[]', defaultValue: 3, description: 'Metric cards to render.' },
      { name: 'min', type: 'string', defaultValue: '12rem', description: 'Minimum grid column width.' },
    ], undefined, '@treeseed/ui/components/astro/data/MetricGrid.astro'),
  display('status-pill', 'StatusPill', 'Data', 'astro', 'Inline status with dot indicator.', 'inline', { tone: 'success', label: 'Healthy' }, [
      { name: 'tone', type: 'Tone', defaultValue: 'success', description: 'Semantic color tone.' },
      { name: 'label', type: 'string', defaultValue: 'Healthy', description: 'Status text.' },
    ]),
  display('timestamp', 'Timestamp', 'Data', 'astro', 'Semantic date and time rendered in the account display time zone.', 'inline', { value: '2026-07-26T18:30:00.000Z' }, [
      { name: 'value', type: 'string | Date', defaultValue: '2026-07-26T18:30:00.000Z', description: 'Timestamp instant to format.' },
      { name: 'timeZone', type: 'string', defaultValue: 'UTC', description: 'IANA time-zone identifier.' },
    ], undefined, '@treeseed/ui/components/astro/data/Timestamp.astro'),
  display('content-status-legend', 'ContentStatusLegend', 'Content', 'astro', 'Reusable ContentStatusLegend component copied into the TreeSeed UI library.', 'medium', { source: 'Content' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/content/ContentStatusLegend.astro'),
  display('status-badge', 'StatusBadge', 'Content', 'astro', 'Reusable StatusBadge component copied into the TreeSeed UI library.', 'medium', { source: 'Content' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/content/StatusBadge.astro'),
  display('dev-watch-reload', 'DevWatchReload', 'Core', 'astro', 'Reusable DevWatchReload component copied into the TreeSeed UI library.', 'medium', { source: 'Core' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/core/DevWatchReload.astro'),
  display('site-title', 'SiteTitle', 'Core', 'astro', 'Reusable SiteTitle component copied into the TreeSeed UI library.', 'medium', { source: 'Core' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/core/SiteTitle.astro'),
  display('book-font-controls', 'BookFontControls', 'Docs', 'astro', 'Reusable BookFontControls component copied into the TreeSeed UI library.', 'medium', { source: 'Docs' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/docs/BookFontControls.astro'),
  display('desktop-sidebar-toggle', 'DesktopSidebarToggle', 'Docs', 'astro', 'Reusable DesktopSidebarToggle component copied into the TreeSeed UI library.', 'medium', { source: 'Docs' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/docs/DesktopSidebarToggle.astro'),
  display('mobile-sidebar-toggle', 'MobileSidebarToggle', 'Docs', 'astro', 'Accessible mobile control for the canonical Starlight book contents sidebar.', 'small', { controls: 'starlight__sidebar' }, [
      { name: 'controls', type: 'string', defaultValue: 'starlight__sidebar', description: 'ID of the controlled book sidebar.' },
      { name: 'label', type: 'string', defaultValue: 'Toggle book contents', description: 'Accessible control label.' },
    ], undefined, '@treeseed/ui/components/astro/docs/MobileSidebarToggle.astro'),
  display('footer', 'Footer', 'Docs', 'astro', 'Reusable Footer component copied into the TreeSeed UI library.', 'medium', { source: 'Docs' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/docs/Footer.astro'),
  display('header', 'Header', 'Docs', 'astro', 'Reusable Header component copied into the TreeSeed UI library.', 'medium', { source: 'Docs' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/docs/Header.astro'),
  display('page-frame', 'PageFrame', 'Docs', 'astro', 'Reusable PageFrame component copied into the TreeSeed UI library.', 'full-page', { source: 'Docs' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/docs/PageFrame.astro'),
  display('page-sidebar', 'PageSidebar', 'Docs', 'astro', 'Reusable PageSidebar component copied into the TreeSeed UI library.', 'medium', { source: 'Docs' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/docs/PageSidebar.astro'),
  display('page-title', 'PageTitle', 'Docs', 'astro', 'Reusable PageTitle component copied into the TreeSeed UI library.', 'medium', { source: 'Docs' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/docs/PageTitle.astro'),
  display('sidebar', 'Sidebar', 'Docs', 'astro', 'Reusable Sidebar component copied into the TreeSeed UI library.', 'medium', { source: 'Docs' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/docs/Sidebar.astro'),
  display('theme-select', 'ThemeSelect', 'Docs', 'astro', 'Reusable ThemeSelect component copied into the TreeSeed UI library.', 'medium', { source: 'Docs' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/docs/ThemeSelect.astro'),
];
