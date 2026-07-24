import type { ComponentCatalogEntry } from './component-kind.ts';
import { display } from './component-kind.ts';

export const contentAndDataComponents: ComponentCatalogEntry[] = [
  display('action-list', 'ActionList', 'Data', 'astro', 'Actionable list rows with metadata.', 'medium', { items: 3 }, [
      { name: 'items', type: 'ActionListItem[]', defaultValue: 3, description: 'Rows to render.' },
    ]),
  display('badge', 'Badge', 'Data', 'astro', 'Compact status and category label.', 'inline', { tone: 'default', size: 'md' }, [
      { name: 'tone', type: 'Tone', defaultValue: 'default', description: 'Semantic color tone.' },
      { name: 'size', type: "'sm' | 'md'", defaultValue: 'md', description: 'Badge size.' },
    ]),
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
  display('status-pill', 'StatusPill', 'Data', 'astro', 'Inline status with dot indicator.', 'inline', { tone: 'success', label: 'Healthy' }, [
      { name: 'tone', type: 'Tone', defaultValue: 'success', description: 'Semantic color tone.' },
      { name: 'label', type: 'string', defaultValue: 'Healthy', description: 'Status text.' },
    ]),
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
  display('download-book', 'DownloadBook', 'Docs', 'astro', 'Reusable DownloadBook component copied into the TreeSeed UI library.', 'medium', { source: 'Docs' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/docs/DownloadBook.astro'),
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
