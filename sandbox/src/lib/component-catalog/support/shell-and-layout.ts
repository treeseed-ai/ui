import type { ComponentCatalogEntry } from './component-kind.ts';
import { display } from './component-kind.ts';

export const shellAndLayoutComponents: ComponentCatalogEntry[] = [
  display('page-header', 'PageHeader', 'Layout', 'astro', 'Page title, description, and actions.', 'large', { title: 'PageHeader preview', actions: 1 }, [
      { name: 'title', type: 'string', defaultValue: 'PageHeader preview', description: 'Heading text.' },
      { name: 'actions', type: 'ButtonAction[]', defaultValue: 1, description: 'Header actions.' },
    ], undefined, '@treeseed/ui/components/astro/layout/PageHeader.astro'),
  display('action-bar', 'ActionBar', 'Layout', 'astro', 'Resolved action renderer with disabled reasons.', 'medium', { actions: 2 }, [
      { name: 'actions', type: 'ResolvedAction[]', defaultValue: 2, description: 'Policy-resolved actions.' },
      { name: 'label', type: 'string', defaultValue: 'Page actions', description: 'Navigation label.' },
    ], undefined, '@treeseed/ui/components/astro/layout/ActionBar.astro'),
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
  display('shell-icon-link', 'ShellIconLink', 'Shells', 'astro', 'Icon-only shell utility link.', 'inline', { icon: 'book' }, [
      { name: 'icon', type: "'book' | 'manager'", defaultValue: 'book', description: 'Icon glyph.' },
      { name: 'label', type: 'string', defaultValue: 'Book home', description: 'Accessible label.' },
    ], undefined, '@treeseed/ui/components/astro/shell/ShellIconLink.astro'),
  display('top-bar', 'TopBar', 'Shells', 'astro', 'Brand and utility action bar.', 'large', { brand: 'TreeSeed', actions: 1 }, [
      { name: 'brand', type: 'Brand', defaultValue: 'TreeSeed', description: 'Top bar brand.' },
      { name: 'actions', type: 'ButtonAction[]', defaultValue: 1, description: 'Utility actions.' },
    ], undefined, '@treeseed/ui/components/astro/shell/TopBar.astro'),
  display('authored-entry-layout', 'AuthoredEntryLayout', 'Layouts', 'astro', 'Reusable AuthoredEntryLayout component copied into the TreeSeed UI library.', 'full-page', { source: 'Layouts' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/layouts/AuthoredEntryLayout.astro'),
  display('book-layout', 'BookLayout', 'Layouts', 'astro', 'Reusable BookLayout component copied into the TreeSeed UI library.', 'full-page', { source: 'Layouts' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/layouts/BookLayout.astro'),
  display('bridge-layout', 'BridgeLayout', 'Layouts', 'astro', 'Reusable BridgeLayout component copied into the TreeSeed UI library.', 'full-page', { source: 'Layouts' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/layouts/BridgeLayout.astro'),
  display('content-layout', 'ContentLayout', 'Layouts', 'astro', 'Reusable ContentLayout component copied into the TreeSeed UI library.', 'full-page', { source: 'Layouts' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/layouts/ContentLayout.astro'),
  display('main-layout', 'MainLayout', 'Layouts', 'astro', 'Reusable MainLayout component copied into the TreeSeed UI library.', 'full-page', { source: 'Layouts' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/layouts/MainLayout.astro'),
  display('note-layout', 'NoteLayout', 'Layouts', 'astro', 'Reusable NoteLayout component copied into the TreeSeed UI library.', 'full-page', { source: 'Layouts' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/layouts/NoteLayout.astro'),
  display('profile-layout', 'ProfileLayout', 'Layouts', 'astro', 'Reusable ProfileLayout component copied into the TreeSeed UI library.', 'full-page', { source: 'Layouts' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/layouts/ProfileLayout.astro'),
  display('app-layout', 'AppLayout', 'Layouts', 'astro', 'Reusable AppLayout component copied into the TreeSeed UI library.', 'full-page', { source: 'Layouts' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/layouts/AppLayout.astro'),
  display('public-layout', 'PublicLayout', 'Layouts', 'astro', 'Reusable PublicLayout component copied into the TreeSeed UI library.', 'full-page', { source: 'Layouts' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/layouts/PublicLayout.astro'),
  display('book-list', 'BookList', 'Site', 'astro', 'Reusable BookList component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/BookList.astro'),
  display('ctasection', 'CTASection', 'Site', 'astro', 'Reusable CTASection component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/CTASection.astro'),
  display('chronicle-list', 'ChronicleList', 'Site', 'astro', 'Reusable ChronicleList component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/ChronicleList.astro'),
  display('hero', 'Hero', 'Site', 'astro', 'Reusable Hero component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/Hero.astro'),
  display('notes-list', 'NotesList', 'Site', 'astro', 'Reusable NotesList component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/NotesList.astro'),
  display('path-card', 'PathCard', 'Site', 'astro', 'Reusable PathCard component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/PathCard.astro'),
  display('profile-list', 'ProfileList', 'Site', 'astro', 'Reusable ProfileList component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/ProfileList.astro'),
  display('published-content-body', 'PublishedContentBody', 'Site', 'astro', 'Reusable PublishedContentBody component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/PublishedContentBody.astro'),
  display('route-not-found', 'RouteNotFound', 'Site', 'astro', 'Reusable RouteNotFound component copied into the TreeSeed UI library.', 'full-page', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/RouteNotFound.astro'),
  display('section-intro', 'SectionIntro', 'Site', 'astro', 'Reusable SectionIntro component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/SectionIntro.astro'),
  display('stage-banner', 'StageBanner', 'Site', 'astro', 'Reusable StageBanner component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/StageBanner.astro'),
  display('trust-callout', 'TrustCallout', 'Site', 'astro', 'Reusable TrustCallout component copied into the TreeSeed UI library.', 'medium', { source: 'Site' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/site/TrustCallout.astro'),
];
