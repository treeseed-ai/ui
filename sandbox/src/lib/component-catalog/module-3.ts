
import { componentCatalog } from './component-catalog.ts';
import { display } from './component-kind.ts';

componentCatalog.push(
  display('app-markdown-field', 'AppMarkdownField', 'App Controls', 'astro', 'Application Markdown field variant used by authenticated work surfaces.', 'large', { label: 'Project note', rows: 8 }, [
    { name: 'label', type: 'string', defaultValue: 'Project note', description: 'Field label.' },
    { name: 'rows', type: 'number', defaultValue: 8, description: 'Editor height hint.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/MarkdownField.astro'),
  display('content-field-help', 'ContentFieldHelp', 'App Controls', 'astro', 'Reusable ContentFieldHelp component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/ContentFieldHelp.astro'),
  display('delete-confirmation-modal', 'DeleteConfirmationModal', 'App Controls', 'astro', 'Reusable DeleteConfirmationModal component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/DeleteConfirmationModal.astro'),
  display('host-credential-permission-note', 'HostCredentialPermissionNote', 'App Controls', 'astro', 'Reusable HostCredentialPermissionNote component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/HostCredentialPermissionNote.astro'),
  display('launch-requirement-summary', 'LaunchRequirementSummary', 'App Controls', 'astro', 'Reusable LaunchRequirementSummary component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/LaunchRequirementSummary.astro'),
  display('plain-table', 'PlainTable', 'App Controls', 'astro', 'Reusable PlainTable component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/PlainTable.astro'),
  display('project-control-nav', 'ProjectControlNav', 'App Controls', 'astro', 'Reusable ProjectControlNav component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/ProjectControlNav.astro'),
  display('related-content-creator', 'RelatedContentCreator', 'App Controls', 'astro', 'Reusable RelatedContentCreator component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/RelatedContentCreator.astro'),
  display('template-host-requirement-picker', 'TemplateHostRequirementPicker', 'App Controls', 'astro', 'Reusable TemplateHostRequirementPicker component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/TemplateHostRequirementPicker.astro'),
  display('template-resource-requirement-picker', 'TemplateResourceRequirementPicker', 'App Controls', 'astro', 'Reusable TemplateResourceRequirementPicker component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/TemplateResourceRequirementPicker.astro'),
  display('template-secret-requirement-panel', 'TemplateSecretRequirementPanel', 'App Controls', 'astro', 'Reusable TemplateSecretRequirementPanel component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/TemplateSecretRequirementPanel.astro'),
  display('work-content-nav', 'WorkContentNav', 'App Controls', 'astro', 'Reusable WorkContentNav component copied into the TreeSeed UI library.', 'medium', { source: 'App Controls' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/controls/WorkContentNav.astro'),
  display('capacity-diagnostics-panel', 'CapacityDiagnosticsPanel', 'Operations', 'astro', 'Reusable CapacityDiagnosticsPanel component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/operations/CapacityDiagnosticsPanel.astro'),
  display('deployment-timeline', 'DeploymentTimeline', 'Operations', 'astro', 'Reusable DeploymentTimeline component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/operations/DeploymentTimeline.astro'),
  display('governance-decision-panel', 'GovernanceDecisionPanel', 'Operations', 'astro', 'Reusable GovernanceDecisionPanel component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/operations/GovernanceDecisionPanel.astro'),
  display('governance-policy-summary', 'GovernancePolicySummary', 'Operations', 'astro', 'Reusable GovernancePolicySummary component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/operations/GovernancePolicySummary.astro'),
  display('knowledge-artifact-card', 'KnowledgeArtifactCard', 'Operations', 'astro', 'Reusable KnowledgeArtifactCard component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/operations/KnowledgeArtifactCard.astro'),
  display('operational-timeline', 'OperationalTimeline', 'Operations', 'astro', 'Reusable OperationalTimeline component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/operations/OperationalTimeline.astro'),
  display('repository-context-panel', 'RepositoryContextPanel', 'Operations', 'astro', 'Reusable RepositoryContextPanel component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/operations/RepositoryContextPanel.astro'),
  display('seed-operations-panel', 'SeedOperationsPanel', 'Operations', 'astro', 'Reusable SeedOperationsPanel component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/operations/SeedOperationsPanel.astro'),
  display('worker-queue-panel', 'WorkerQueuePanel', 'Operations', 'astro', 'Reusable WorkerQueuePanel component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/operations/WorkerQueuePanel.astro'),
  display('sensitive-data-unlock', 'SensitiveDataUnlock', 'Sensitive Data', 'astro', 'Reusable SensitiveDataUnlock component copied into the TreeSeed UI library.', 'medium', { source: 'Sensitive Data' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/app/sensitive/SensitiveDataUnlock.astro'),
  display('auth-card', 'AuthCard', 'Auth', 'astro', 'Reusable AuthCard component copied into the TreeSeed UI library.', 'medium', { source: 'Auth' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/auth/AuthCard.astro'),
  display('auth-divider', 'AuthDivider', 'Auth', 'astro', 'Reusable AuthDivider component copied into the TreeSeed UI library.', 'medium', { source: 'Auth' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/auth/AuthDivider.astro'),
  display('auth-shell', 'AuthShell', 'Auth', 'astro', 'Reusable AuthShell component copied into the TreeSeed UI library.', 'full-page', { source: 'Auth' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/auth/AuthShell.astro'),
  display('provider-button-list', 'ProviderButtonList', 'Auth', 'astro', 'Reusable ProviderButtonList component copied into the TreeSeed UI library.', 'medium', { source: 'Auth' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/auth/ProviderButtonList.astro'),
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
  display('contact-form', 'ContactForm', 'Forms', 'astro', 'Reusable ContactForm component copied into the TreeSeed UI library.', 'medium', { source: 'Forms' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/forms/ContactForm.astro'),
  display('footer-subscribe-form', 'FooterSubscribeForm', 'Forms', 'astro', 'Reusable FooterSubscribeForm component copied into the TreeSeed UI library.', 'medium', { source: 'Forms' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/forms/FooterSubscribeForm.astro'),
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
  display('product-card', 'ProductCard', 'Market', 'astro', 'Reusable ProductCard component copied into the TreeSeed UI library.', 'medium', { source: 'Market' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
  ], undefined, '@treeseed/ui/components/astro/market/ProductCard.astro'),
  display('marketplace-product-card', 'MarketplaceProductCard', 'Commerce', 'astro', 'Theme-native marketplace product summary card.', 'medium', {
    id: 'product_demo',
    title: 'Cooperative Starter',
    summary: 'A governed starter with buyer-visible ownership context.',
    kind: 'template',
    vendorDisplayName: 'Seed Cooperative',
    ownershipModel: 'cooperative_owned',
    offers: [{ id: 'offer_demo', mode: 'one_time', title: 'Buy once', unitAmount: 2900, currency: 'usd', checkoutEligible: true }],
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Marketplace product summary props.' }], undefined, '@treeseed/ui/components/astro/commerce/MarketplaceProductCard.astro'),
  display('marketplace-offer-panel', 'MarketplaceOfferPanel', 'Commerce', 'astro', 'Buyer-facing offer choice panel.', 'large', {
    productId: 'product_demo',
    offers: [{ id: 'offer_demo', mode: 'free', title: 'Community access', unitAmount: null, currency: null, checkoutEligible: true, stripeSyncStatus: null }],
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Offer summary props.' }], undefined, '@treeseed/ui/components/astro/commerce/MarketplaceOfferPanel.astro'),
  display('commerce-ownership-summary', 'CommerceOwnershipSummary', 'Commerce', 'astro', 'Buyer-visible cooperative ownership and stewardship summary.', 'medium', {
    ownershipModel: 'community_governed',
    summary: 'Maintained by a cooperative steward team.',
    stewards: [{ role: 'governance_steward', displayName: 'Seed Stewards' }],
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Ownership summary props.' }], undefined, '@treeseed/ui/components/astro/commerce/CommerceOwnershipSummary.astro'),
  display('commerce-trust-checklist', 'CommerceTrustChecklist', 'Commerce', 'astro', 'Seller or listing readiness checklist.', 'medium', {
    title: 'Seller readiness',
    items: [{ label: 'Vendor approved', value: true }, { label: 'Stripe ready', value: false }],
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Checklist props.' }], undefined, '@treeseed/ui/components/astro/commerce/CommerceTrustChecklist.astro'),
  display('commerce-status-timeline', 'CommerceStatusTimeline', 'Commerce', 'astro', 'Commerce workflow status timeline.', 'medium', {
    title: 'Governance timeline',
    events: [{ label: 'Submitted', message: 'Ready for review', createdAt: '2026-06-14T00:00:00.000Z' }],
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Timeline props.' }], undefined, '@treeseed/ui/components/astro/commerce/CommerceStatusTimeline.astro'),
  display('commerce-payment-group-panel', 'CommercePaymentGroupPanel', 'Commerce', 'astro', 'Grouped vendor checkout panel shell.', 'medium', { title: 'Payment groups' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Panel props.' },
  ], undefined, '@treeseed/ui/components/astro/commerce/CommercePaymentGroupPanel.astro'),
  display('commerce-entitlement-list', 'CommerceEntitlementList', 'Commerce', 'astro', 'Entitlement status list.', 'medium', {
    entitlements: [{ id: 'entitlement_demo', status: 'active', productId: 'product_demo', renewalState: 'active' }],
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Entitlement props.' }], undefined, '@treeseed/ui/components/astro/commerce/CommerceEntitlementList.astro'),
  display('service-quote-panel', 'ServiceQuotePanel', 'Commerce', 'astro', 'Scoped service quote summary.', 'medium', {
    quote: { title: 'Scoped build quote', status: 'submitted', amount: 120000, currency: 'usd', scopeSummary: 'Implement governed service work.', quoteVersion: 1 },
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Quote props.' }], undefined, '@treeseed/ui/components/astro/commerce/ServiceQuotePanel.astro'),
  display('service-request-timeline', 'ServiceRequestTimeline', 'Commerce', 'astro', 'Scoped service request timeline.', 'medium', {
    events: [{ label: 'Quote created', message: 'Seller submitted v1.' }],
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Timeline props.' }], undefined, '@treeseed/ui/components/astro/commerce/ServiceRequestTimeline.astro'),
  display('capacity-risk-panel', 'CapacityRiskPanel', 'Commerce', 'astro', 'Capacity risk and access posture summary.', 'medium', {
    runtimeIsolationLevel: 'tenant_isolated',
    humanInvolvementLevel: 'operator_assisted',
    aiInvolvementLevel: 'assistive',
    dataAccessLevel: 'buyer_provided',
    secretAccessLevel: 'buyer_managed',
    buyerVisibleRiskSummary: 'Manual review required before any access.',
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Capacity risk props.' }], undefined, '@treeseed/ui/components/astro/commerce/CapacityRiskPanel.astro'),
  display('capacity-inquiry-panel', 'CapacityInquiryPanel', 'Commerce', 'astro', 'Capacity inquiry form panel.', 'large', { listingId: 'listing_demo' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Inquiry form props.' },
  ], undefined, '@treeseed/ui/components/astro/commerce/CapacityInquiryPanel.astro'),
  display('seller-commerce-monitor', 'SellerCommerceMonitor', 'Commerce', 'astro', 'Seller commerce operations health monitor.', 'medium', {
    monitor: { stripeReady: true, blockedStripeSyncCount: 0, driftedStripeSyncCount: 0, pendingFulfillmentCount: 2, failedRefundCount: 0, failedWebhookCount: 0, pendingServiceRequestCount: 1, pendingCapacityInquiryCount: 1, pendingGovernanceTransferCount: 0 },
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Monitor props.' }], undefined, '@treeseed/ui/components/astro/commerce/SellerCommerceMonitor.astro'),
  display('seller-readiness-checklist', 'SellerReadinessChecklist', 'Commerce', 'astro', 'Seller readiness checklist alias for commerce operations pages.', 'medium', {
    items: [{ label: 'Vendor approved', value: true }, { label: 'Capacity trusted', value: false }],
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Checklist props.' }], undefined, '@treeseed/ui/components/astro/commerce/SellerReadinessChecklist.astro'),
  display('commons-proposal-card', 'CommonsProposalCard', 'Governance', 'astro', 'Public Commons proposal summary card with advisory signal.', 'medium', {
    proposal: { id: 'proposal_demo', title: 'Improve service quote guidance', summary: 'Back a bounded proposal for TreeSeed Commons review.', status: 'backing', scope: 'marketplace', backingCount: 8, voteSupportWeight: 12 },
    href: '/displays/commons-proposal-card',
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Commons proposal card props.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsProposalCard.astro'),
  display('commons-proposal-pipeline', 'CommonsProposalPipeline', 'Governance', 'astro', 'Proposal state pipeline for Commons governance flows.', 'medium', {
    status: 'under_review',
  }, [{ name: 'status', type: 'string', defaultValue: 'draft', description: 'Current proposal status.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsProposalPipeline.astro'),
  display('commons-vote-summary', 'CommonsVoteSummary', 'Governance', 'astro', 'Weighted advisory vote summary.', 'medium', {
    support: 18,
    object: 3,
    abstain: 2,
    backers: 11,
  }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Weighted vote totals.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsVoteSummary.astro'),
  display('commons-weight-breakdown', 'CommonsWeightBreakdown', 'Governance', 'astro', 'Participant governance weight breakdown.', 'medium', {
    participant: { baseWeight: 1, trustWeight: 1, contributionWeight: 2, stakeholderWeight: 1, delegatedWeight: 3, totalWeight: 8 },
  }, [{ name: 'participant', type: 'object', defaultValue: {}, description: 'Participant weight fields.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsWeightBreakdown.astro'),
  display('commons-participant-badge', 'CommonsParticipantBadge', 'Governance', 'astro', 'Compact Commons participant identity and weight badge.', 'inline', {
    participant: { displayName: 'Seed Member', status: 'active', totalWeight: 4, verifiedEmail: true },
  }, [{ name: 'participant', type: 'object', defaultValue: {}, description: 'Commons participant summary.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsParticipantBadge.astro'),
  display('commons-decision-timeline', 'CommonsDecisionTimeline', 'Governance', 'astro', 'Decision evidence timeline for Commons events.', 'medium', {
    events: [{ eventType: 'proposal.submitted', priorState: 'draft', nextState: 'submitted', message: 'Submitted for backing.', createdAt: '2026-06-15T00:00:00.000Z' }],
  }, [{ name: 'events', type: 'array', defaultValue: [], description: 'Governance event timeline entries.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsDecisionTimeline.astro'),
  display('commons-delegation-panel', 'CommonsDelegationPanel', 'Governance', 'astro', 'Scoped voting delegation summary panel.', 'medium', {
    delegations: [{ id: 'delegation_demo', status: 'active', scope: 'marketplace', fromParticipantId: 'participant_a', toParticipantId: 'participant_b' }],
  }, [{ name: 'delegations', type: 'array', defaultValue: [], description: 'Active or historical delegation records.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsDelegationPanel.astro'),
  display('commons-steward-decision-panel', 'CommonsStewardDecisionPanel', 'Governance', 'astro', 'Steward-only Commons decision form shell.', 'medium', {
    proposalId: 'proposal_demo',
    action: '/v1/commons/proposals/proposal_demo/steward-decision',
  }, [{ name: 'proposalId', type: 'string', defaultValue: 'proposal_demo', description: 'Proposal receiving the steward decision.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsStewardDecisionPanel.astro'),
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
  display('account-deletion-panel', 'AccountDeletionPanel', 'Account', 'astro', 'Account deletion confirmation and consequence summary panel.', 'large', { source: 'Account' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Account deletion policy and confirmation props.' },
  ], undefined, '@treeseed/ui/components/astro/account/AccountDeletionPanel.astro'),
  display('account-identity-settings', 'AccountIdentitySettings', 'Account', 'astro', 'Account identity and profile settings panel.', 'large', { source: 'Account' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Account identity settings props.' },
  ], undefined, '@treeseed/ui/components/astro/account/AccountIdentitySettings.astro'),
  display('notification-preference-panel', 'NotificationPreferencePanel', 'Account', 'astro', 'Account notification preference controls and state.', 'large', { source: 'Account' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Notification preference props.' },
  ], undefined, '@treeseed/ui/components/astro/account/NotificationPreferencePanel.astro'),
  display('personal-theme-manager', 'PersonalThemeManager', 'Account', 'astro', 'Personal color-scheme and appearance management panel.', 'large', { source: 'Account' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Personal theme configuration props.' },
  ], undefined, '@treeseed/ui/components/astro/account/PersonalThemeManager.astro'),
  display('session-manager', 'SessionManager', 'Account', 'astro', 'Active account session inventory and revocation controls.', 'large', { source: 'Account' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Session inventory and action props.' },
  ], undefined, '@treeseed/ui/components/astro/account/SessionManager.astro'),
  display('registration-form', 'RegistrationForm', 'Auth', 'astro', 'Account registration form and validation surface.', 'medium', { source: 'Auth' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Registration form configuration props.' },
  ], undefined, '@treeseed/ui/components/astro/auth/RegistrationForm.astro'),
  display('username-claim-form', 'UsernameClaimForm', 'Auth', 'astro', 'Username claim form and availability feedback surface.', 'medium', { source: 'Auth' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Username claim configuration props.' },
  ], undefined, '@treeseed/ui/components/astro/auth/UsernameClaimForm.astro'),
  display('notification-bell', 'NotificationBell', 'Notifications', 'astro', 'Notification status and unread-count trigger.', 'inline', { source: 'Notifications' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Notification count and destination props.' },
  ], undefined, '@treeseed/ui/components/astro/notifications/NotificationBell.astro'),
  display('accessible-dialog', 'AccessibleDialog', 'Overlays', 'astro', 'Accessible modal dialog shell with labelled content and actions.', 'medium', { source: 'Overlays' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Dialog identity, label, state, and action props.' },
  ], undefined, '@treeseed/ui/components/astro/overlays/AccessibleDialog.astro'),
  display('message-template', 'MessageTemplate', 'Templates', 'astro', 'Message-centered page template for status and next-action surfaces.', 'full-page', { source: 'Templates' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Message template view-model and action props.' },
  ], undefined, '@treeseed/ui/components/astro/templates/MessageTemplate.astro'),
  display('profile-template', 'ProfileTemplate', 'Templates', 'astro', 'Profile page template with identity, metadata, and related content.', 'full-page', { source: 'Templates' }, [
    { name: 'props', type: 'object', defaultValue: {}, description: 'Profile template view-model and action props.' },
  ], undefined, '@treeseed/ui/components/astro/templates/ProfileTemplate.astro'),
);
