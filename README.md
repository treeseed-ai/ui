# @treeseed/ui

`@treeseed/ui` is the reusable Treeseed interface system. It provides layout-down Astro components, React widgets, forms, controls, cards, shells, dashboards, theme utilities, and CSS used by Treeseed admin, market, and core site surfaces.

Use this package when you need Treeseed visual primitives. Use `@treeseed/admin` for admin routes and workflows, `@treeseed/core` for site runtime integration, and the root market app for Treeseed-specific messaging and future ecommerce.

## What You Can Build With UI

- Treeseed app shells and public shells
- auth cards and account surfaces
- form controls and data-entry panels
- operation status panels and deployment timelines
- market/catalog cards
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
```

Admin contributes these styles through `@treeseed/admin/plugin` when a host app installs the admin portal.

## Use Astro Components

```astro
---
import AppLayout from '@treeseed/ui/components/astro/layouts/AppLayout.astro';
import Button from '@treeseed/ui/components/astro/forms/Button.astro';
import Panel from '@treeseed/ui/components/astro/surface/Panel.astro';
---

<AppLayout title="Operations">
  <Panel title="Deployments">
    <Button type="submit">Deploy</Button>
  </Panel>
</AppLayout>
```

Import from package exports such as `@treeseed/ui/components/astro/...`. Do not import from `packages/ui/src`.

## Use React Components

React components are available through documented React exports such as:

```ts
import { MarkdownEditor } from '@treeseed/ui/react';
```

Use React widgets for interactive controls that need client-side state. Keep route data loading, auth policy, and workflow orchestration in admin, market, API, SDK, or CLI code.

## Theme And Tokens

The package owns reusable tokens, theme CSS, app shell styles, form styles, operation styles, and market/card styles. Tenant-specific brand colors, public marketing art direction, and ecommerce presentation belong in the host app.

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
- checkout, billing, subscriptions, coupons, or licensing
- capacity-provider runtime
- TreeDX repository service behavior

Admin, market, and core should compose UI primitives instead of recreating layout-down controls locally.

See the root [Package Ownership](../../docs/package-ownership.md) guide for cross-package boundaries.
