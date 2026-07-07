# @treeseed/ui

`@treeseed/ui` is the reusable Treeseed interface system. It provides layout-down Astro components, React widgets, forms, controls, cards, shells, dashboards, theme utilities, and CSS used by Treeseed admin, market, and core site surfaces.

Use this package when you need Treeseed visual primitives. Use `@treeseed/admin` for admin routes and workflows, `@treeseed/core` for site runtime integration, and the root market app for Treeseed-specific messaging and buyer-facing marketplace pages.

## What You Can Build With UI

- Treeseed shell primitives for authenticated app, operational market, auth, and public single-column layouts
- shared public stacked-section components for marketing, profiles, books, and Knowledge Hub pages
- `SurfaceTabs` for routed and in-page control-surface subpages
- auth cards and account surfaces
- form controls and data-entry panels
- operation status panels and deployment timelines
- reusable capacity/status controls when consumed by Admin or Market
- market/catalog cards
- commerce marketplace cards, offer panels, ownership summaries, service timelines, capacity risk panels, seller monitoring panels, and governance/Commons presentation components
- docs and content presentation components
- React widgets such as editors, charts, and rich controls
- theme-aware app layouts for admin and market surfaces

## Install

```bash
npm install @treeseed/ui
```

## Import Styles

Import the base styles once in the host shell or plugin CSS list:

```ts
import '@treeseed/ui/styles/tokens.css';
import '@treeseed/ui/styles/theme.css';
import '@treeseed/ui/styles/ui.css';
import '@treeseed/ui/styles/forms.css';
import '@treeseed/ui/styles/app-shell.css';
import '@treeseed/ui/styles/app-controls.css';
import '@treeseed/ui/styles/auth.css';
import '@treeseed/ui/styles/operations.css';
import '@treeseed/ui/styles/market.css';
import '@treeseed/ui/styles/commerce.css';
import '@treeseed/ui/styles/governance.css';
```

Admin contributes these styles through `@treeseed/admin/plugin` when a host app installs the admin portal.

## Use Astro Components

```astro
---
import AppLayout from '@treeseed/ui/components/astro/layouts/AppLayout.astro';
import Button from '@treeseed/ui/components/astro/forms/Button.astro';
import Panel from '@treeseed/ui/components/astro/surface/Panel.astro';
import SurfaceTabs from '@treeseed/ui/components/astro/shell/SurfaceTabs.astro';
---

<AppLayout title="Operations">
  <Fragment slot="tabs">
    <SurfaceTabs label="Project controls" current="overview" items={[{ id: 'overview', label: 'Overview', href: '/app/projects/1' }]} />
  </Fragment>
  <Panel title="Deployments">
    <Button type="submit">Deploy</Button>
  </Panel>
</AppLayout>
```

Import from package exports such as `@treeseed/ui/components/astro/...`. Do not import from `packages/ui/src`.

## Shells And Registry

Current shell work should compose these exported primitives:

- `ShellFrame`, `ShellHeader`, `SiteUserControls`, `TeamOperationsPanel`, `TeamOperationsDrawer`, and `ControlSurface` for authenticated app and operational market shells.
- `AuthShell` for authentication flows.
- `PublicSingleColumnShell`, `PublicStack`, `PublicSection`, `PublicHeroSection`, `PublicProfileHeader`, and `PublicKnowledgeSection` for public marketing, profile, book, and Knowledge Hub pages.
- `SurfaceTabs` for link tabs and accessible in-page tab panels inside a `ControlSurface` tab slot.

`ProductShell`, `PublicShell`, `RailNav`, and `BottomNav` remain exported as compatibility/deprecated surfaces for one migration cycle. New host pages should use Admin/Core/Market layout wrappers that compose the current shell primitives.

Every exported Astro component must appear in the sandbox registry at `sandbox/src/lib/component-catalog.ts`. Shells and layout-level components need representative full-page previews; deprecated compatibility entries must be labeled as deprecated.

## Use React Components

React components are available through documented React exports such as:

```ts
import { MarkdownEditor } from '@treeseed/ui/react';
```

Use React widgets for interactive controls that need client-side state. Keep route data loading, auth policy, and workflow orchestration in admin, market, API, SDK, or CLI code.

## Theme And Tokens

The package owns reusable tokens, theme CSS, app shell styles, form styles, operation styles, market/card styles, and Stripe-free commerce/governance components. Tenant-specific brand colors, public marketing art direction, copy, data loading, and workflow orchestration belong in the host app or Admin/API packages.

## Sandbox

Run the component sandbox while developing UI primitives:

```bash
npm install
npm run dev
```

Run package verification before publishing:

```bash
npm run verify:local
```

## What UI Does Not Own

- routes or page ownership
- auth/session policy
- backend API behavior
- hosting or reconciliation
- package workflow orchestration
- admin view models
- marketplace business policy
- Stripe.js, Stripe Elements, checkout confirmation, backend API behavior, webhooks, billing, subscriptions, coupons, or licensing
- payout, commission, application-fee, revenue-split, capacity billing, provider execution, grant, reservation, or routing logic
- capacity-provider runtime
- capacity allocation policy, assignment selection, mode-run persistence, or capacity ledger behavior
- TreeDX repository service behavior

Admin, market, and core should compose UI primitives instead of recreating layout-down controls locally.

See the root [Package Ownership](../../docs/package-ownership.md) guide for cross-package boundaries.
