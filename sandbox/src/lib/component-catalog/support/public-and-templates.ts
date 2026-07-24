import type { ComponentCatalogEntry } from './component-kind.ts';
import { display } from './component-kind.ts';

export const publicAndTemplatesComponents: ComponentCatalogEntry[] = [
  display('permission-boundary', 'PermissionBoundary', 'Patterns', 'astro', 'Permission state boundary for allowed and denied content.', 'medium', { state: 'allowed' }, [
      { name: 'state', type: 'ResolvedActionState', defaultValue: 'allowed', description: 'Resolved permission state.' },
      { name: 'remediation', type: 'string', defaultValue: undefined, description: 'Optional remediation text.' },
    ], undefined, '@treeseed/ui/components/astro/patterns/PermissionBoundary.astro'),
  display('bottom-nav', 'BottomNav', 'Deprecated compatibility', 'astro', 'Deprecated mobile bottom navigation kept for one migration cycle; use ShellHeader and TeamOperationsDrawer instead.', 'medium', { items: 3, currentPath: '/displays/bottom-nav' }, [
      { name: 'items', type: 'NavItem[]', defaultValue: 3, description: 'Navigation items.' },
      { name: 'currentPath', type: 'string', defaultValue: '/displays/bottom-nav', description: 'Current path marker.' },
    ], undefined, '@treeseed/ui/components/astro/shell/BottomNav.astro', 'deprecated', 'ShellHeader + TeamOperationsDrawer'),
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
  display('message-template', 'MessageTemplate', 'Templates', 'astro', 'Message-centered page template for status and next-action surfaces.', 'full-page', { source: 'Templates' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Message template view-model and action props.' },
    ], undefined, '@treeseed/ui/components/astro/templates/MessageTemplate.astro'),
  display('profile-template', 'ProfileTemplate', 'Templates', 'astro', 'Profile page template with identity, metadata, and related content.', 'full-page', { source: 'Templates' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Profile template view-model and action props.' },
    ], undefined, '@treeseed/ui/components/astro/templates/ProfileTemplate.astro'),
];
