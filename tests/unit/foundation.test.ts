import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { componentCatalog } from '../../sandbox/src/lib/component-catalog';
import { actionToButton, type ResolvedAction } from '../../src/lib/foundation/contracts';
import { searchContextualHelp } from '../../src/lib/help/search';
import { SITE_SLOGAN } from '../../src/site-brand';

const foundationFiles = [
	'src/lib/foundation/contracts.ts',
	'src/astro/templates/CollectionTemplate.astro',
	'src/astro/templates/DashboardTemplate.astro',
	'src/astro/templates/DetailTemplate.astro',
	'src/astro/templates/ReaderTemplate.astro',
	'src/astro/templates/SettingsTemplate.astro',
	'src/astro/layout/ActionBar.astro',
	'src/astro/layout/Stack.astro',
	'src/astro/activity/ActivityFeed.astro',
	'src/astro/surface/ResourceCard.astro',
	'src/astro/patterns/PermissionBoundary.astro',
	'src/astro/feedback/FeedbackButton.astro',
	'src/astro/feedback/FeedbackDialog.astro',
	'src/astro/feedback/FeedbackRedactionBoundary.astro',
	'src/astro/help/HelpButton.astro',
	'src/astro/help/HelpDrawer.astro',
	'src/astro/help/HelpPopover.astro',
	'src/astro/help/ContextualHelpPanel.astro',
	'src/astro/help/HelpTopicLink.astro',
	'src/astro/help/HelpActionList.astro',
	'src/astro/service/ReadinessSummary.astro',
	'src/astro/distribution/DistributionSummary.astro',
	'src/astro/distribution/OverlayStatus.astro',
	'src/lib/distribution/overlay-loader.ts',
	'src/astro/operating/ActivityTimeline.astro',
	'src/astro/operating/AllocationPanel.astro',
	'src/astro/operating/AllocationStateLegend.astro',
	'src/astro/operating/AllocationTree.astro',
	'src/astro/operating/WorkQueueSummary.astro',
	'src/astro/templates/WorkspaceTemplate.astro',
	'src/lib/help/drawer.ts',
	'src/lib/help/search.ts',
];

describe('UI foundation', () => {
	it('keeps full-width controls inside their form layout cells', () => {
		const formsCss = readFileSync('src/styles/forms.css', 'utf8');
		expect(formsCss).toMatch(/\.ts-control\s*\{[^}]*box-sizing: border-box;[^}]*width: 100%;/su);
	});

	it('exports one slogan for first-party TreeSeed brand displays', () => {
		const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { exports: Record<string, unknown> };
		const brandedSources = [
			'src/astro/auth/AuthCard.astro',
			'src/astro/auth/AuthShell.astro',
			'src/astro/layouts/AppLayout.astro',
			'src/astro/layouts/MainLayout.astro',
			'src/astro/layouts/PublicLayout.astro',
		];

		expect(SITE_SLOGAN).toBe('Grow what you know');
		expect(readFileSync('src/index.ts', 'utf8')).toContain("export * from './site-brand.ts'");
		expect(packageJson.exports['./site-brand']).toEqual({
			types: './dist/site-brand.d.ts',
			default: './dist/site-brand.js',
		});
		expect(readFileSync('scripts/support/copy-assets.ts', 'utf8')).toContain(
			"['src/site-brand.ts', 'dist/site-brand.ts', true]",
		);
		for (const path of brandedSources) {
			expect(readFileSync(path, 'utf8'), path).toContain('SITE_SLOGAN');
		}
	});

	it('keeps browser runtime initializers inert during server rendering', () => {
		for (const path of [
			'src/lib/app/markdown-field.ts',
			'src/lib/app/related-content-creator.ts',
			'src/astro/forms/composition/markdown-field.ts',
		]) {
			expect(readFileSync(path, 'utf8'), path).toContain("if (typeof document !== 'undefined')");
		}
	});

	it('exports ProductShell as the canonical authenticated shell', () => {
		const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { exports: Record<string, unknown> };

		expect(packageJson.exports['./components/astro/shell/ProductShell.astro']).toBe('./dist/astro/shell/layout/ProductShell.astro');
		expect(packageJson.exports['./components/astro/shell/AppShell.astro']).toBeUndefined();
		expect(existsSync('src/astro/shell/layout/ProductShell.astro')).toBe(true);
		expect(existsSync('src/astro/shell/AppShell.astro')).toBe(false);
	});

	it('keeps header icons unique and notifications account-scoped', () => {
		const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { exports: Record<string, unknown> };
		const controls = readFileSync('src/astro/shell/chrome/SiteUserControls.astro', 'utf8');
		const publicShell = readFileSync('src/astro/public/PublicSingleColumnShell.astro', 'utf8');
		const productShell = readFileSync('src/astro/shell/layout/ProductShell.astro', 'utf8');
		const publicLayouts = [
			readFileSync('src/astro/layouts/MainLayout.astro', 'utf8'),
			readFileSync('src/astro/layouts/PublicLayout.astro', 'utf8'),
		];
		const catalogIds = new Set(componentCatalog.map((entry) => entry.id));

		expect(publicShell.match(/\bshowManagerLink\b/gu)).toHaveLength(1);
		expect(controls.match(/icon="manager"/gu)).toHaveLength(1);
		for (const layout of publicLayouts) expect(layout).not.toContain('ShellIconLink');
		for (const shell of [controls, productShell]) {
			expect(shell).not.toContain('NotificationBell');
			expect(shell).not.toContain('notificationCsrfToken');
			expect(shell).not.toMatch(/\bnotifications\s*[?:=]/u);
		}
		expect(packageJson.exports['./components/astro/notifications/NotificationBell.astro']).toBeUndefined();
		expect(catalogIds.has('notification-bell')).toBe(false);
		expect(catalogIds.has('notification-preference-panel')).toBe(true);
		expect(existsSync('src/astro/account/NotificationPreferencePanel.astro')).toBe(true);
		const appShellCss = readFileSync('src/styles/app-shell.css', 'utf8');
		expect(appShellCss).toContain('.ts-shell-header .ts-site-user-controls__utilities > :not(.ts-theme-menu)');
		expect(appShellCss).toContain('.ts-team-drawer .ts-theme-menu');
	});

	it('right-aligns auth and app shell header controls', () => {
		const authCss = readFileSync('src/styles/auth.css', 'utf8');
		const appShellCss = readFileSync('src/styles/app-shell.css', 'utf8');

		expect(authCss).toMatch(/\.auth-shell-bar > \.ts-site-user-controls\s*\{[^}]*justify-content: flex-end;[^}]*margin-inline-start: auto;/su);
		expect(authCss).toMatch(/\.auth-shell-bar \.ts-site-user-controls__nav\s*\{[^}]*justify-content: flex-end;/su);
		expect(authCss).toMatch(/\.auth-card__brand\s*\{[^}]*border-bottom:[^}]*display: grid;/su);
		expect(authCss).toMatch(/\.auth-card__brand > \.auth-brand\s*\{[^}]*display: none;/su);
		expect(appShellCss).toMatch(/\.ts-shell-header__actions\s*\{[^}]*flex: 1 1 auto;[^}]*justify-content: flex-end;[^}]*margin-inline-start: auto;/su);
		expect(appShellCss).toMatch(/\.ts-shell-header \.ts-site-user-controls__nav\s*\{[^}]*justify-content: flex-end;/su);
	});

	it('keeps the app rail pinned, icon-enabled, collapsible, and mobile-safe', () => {
		const productShell = readFileSync('src/astro/shell/layout/ProductShell.astro', 'utf8');
		const operations = readFileSync('src/astro/shell/team-operations/TeamOperationsPanel.astro', 'utf8');
		const appShellCss = readFileSync('src/styles/app-shell.css', 'utf8');
		const appLayout = readFileSync('src/astro/layouts/AppLayout.astro', 'utf8');

		expect(productShell).toContain("const storageKey = 'treeseed.app-sidebar-collapsed'");
		expect(productShell).toContain('localStorage.getItem(storageKey)');
		expect(productShell).toContain("'astro:before-swap'");
		expect(productShell).toContain('event.newDocument.documentElement');
		expect(productShell).toContain('tsAppSidebarReady');
		expect(productShell).toContain('data-ts-app-sidebar-toggle');
		expect(operations).toContain('ts-team-operations__primary');
		expect(operations).toContain('ts-team-operations__footer');
		expect(operations).toContain('<ShellIcon');
		expect(appShellCss).toMatch(/\.ts-product-shell-body\s*\{[^}]*margin: 0;/su);
		expect(appShellCss).toMatch(/\.ts-team-operations\s*\{[^}]*box-sizing: border-box;[^}]*overflow: hidden;/su);
		expect(appShellCss).toMatch(/\.ts-team-operations__primary\s*\{[^}]*overflow-y: auto;/su);
		expect(appShellCss).toMatch(/\.ts-team-operations__footer\s*\{[^}]*margin-top: auto;/su);
		expect(appShellCss).toMatch(/html\[data-ts-app-sidebar-ready='true'\] \.ts-product-shell__body\s*\{[^}]*transition: grid-template-columns 160ms ease;/su);
		expect(appShellCss).toContain(".ts-product-shell__desktop-operations .ts-team-operations__label");
		for (const icon of ['start', 'services', 'projects', 'capacity', 'work', 'knowledge', 'account', 'sign-out']) {
			expect(appLayout).toContain(`icon: '${icon}'`);
		}
	});

	it('places settings section tabs above the active content', () => {
		const template = readFileSync('src/astro/templates/SettingsTemplate.astro', 'utf8');
		const uiCss = readFileSync('src/styles/ui.css', 'utf8');

		expect(template).toContain("import SurfaceTabs from '../shell/navigation/SurfaceTabs.astro'");
		expect(template).toContain('label="Settings sections"');
		expect(template).not.toContain('ts-template__aside');
		expect(template).not.toContain('ts-settings-nav');
		expect(uiCss).not.toContain('.ts-template--settings .ts-template__main');
		expect(uiCss).not.toContain('.ts-settings-nav');
	});

	it('owns reusable administration navigation and data display primitives', () => {
		const tabs = readFileSync('src/astro/shell/navigation/SurfaceTabs.astro', 'utf8');
		const disclosure = readFileSync('src/astro/data/DisclosureList.astro', 'utf8');
		const dataTable = readFileSync('src/astro/data/DataTable.astro', 'utf8');
		const table = readFileSync('src/astro/data/ResponsiveTable.astro', 'utf8');
		const identity = readFileSync('src/astro/patterns/IdentitySummary.astro', 'utf8');
		const pagination = readFileSync('src/astro/shell/navigation/Pagination.astro', 'utf8');
		const confirmation = readFileSync('src/astro/surface/InlineConfirmation.astro', 'utf8');
		const uiCss = readFileSync('src/styles/ui.css', 'utf8');

		expect(tabs).toContain('ts-surface-tabs');
		expect(disclosure).toContain('ts-disclosure-list');
		expect(dataTable).toContain("import ResponsiveTable from './ResponsiveTable.astro'");
		expect(dataTable).not.toContain('ts-data-table-wrap');
		expect(table).toContain('ts-data-table');
		expect(table).toContain('data-density={density}');
		expect(identity).toContain('ts-identity-summary__avatar');
		expect(identity).toContain('<slot name="badge" />');
		expect(pagination).toContain('ts-pagination');
		expect(confirmation).toContain('ts-inline-confirmation');
		for (const selector of ['.ts-disclosure-list', '.ts-data-table', '.ts-identity-summary', '.ts-table-actions', '.ts-pagination', '.ts-inline-confirmation']) {
			expect(uiCss).toContain(selector);
		}
	});

	it('owns the reusable activity feed and spacing stack used by operational pages', () => {
		const activity = readFileSync('src/astro/activity/ActivityFeed.astro', 'utf8');
		const stack = readFileSync('src/astro/layout/Stack.astro', 'utf8');
		const uiCss = readFileSync('src/styles/ui.css', 'utf8');
		const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { exports: Record<string, unknown> };

		expect(activity).toContain('ts-activity-feed__entry');
		expect(activity).toContain('<Timestamp');
		expect(activity).toContain('actorHref?: string');
		expect(activity).toContain('actorImageSrc?: string | null');
		expect(activity).toContain('ts-activity-feed__actor-link');
		expect(activity).toContain('<img');
		expect(activity).not.toContain('actorId');
		expect(stack).toContain('data-gap={gap}');
		expect(uiCss).toContain('.ts-activity-feed__marker');
		expect(uiCss).toContain('.ts-stack');
		expect(packageJson.exports['./components/astro/activity/ActivityFeed.astro']).toBe('./dist/astro/activity/ActivityFeed.astro');
		expect(packageJson.exports['./components/astro/layout/Stack.astro']).toBe('./dist/astro/layout/Stack.astro');
	});

	it('owns compact search and help-dialog interaction primitives', () => {
		const search = readFileSync('src/astro/forms/search/InlineSearch.astro', 'utf8');
		const dialog = readFileSync('src/astro/overlays/AccessibleDialog.astro', 'utf8');
		const icon = readFileSync('src/astro/shell/navigation/ShellIcon.astro', 'utf8');
		const formsCss = readFileSync('src/styles/forms.css', 'utf8');

		expect(search).toContain('ts-inline-search__controls');
		expect(search).toContain("type=\"search\"");
		expect(dialog).toContain('dialog.showModal()');
		expect(dialog).toContain('opener.focus()');
		expect(icon).toContain('help: [');
		expect(formsCss).toMatch(/\.ts-inline-search__controls\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\) auto;/su);
	});

	it('supports pronounced cards and equal button sizing across links and forms', () => {
		const card = readFileSync('src/astro/surface/Card.astro', 'utf8');
		const styles = readFileSync('src/styles/ui.css', 'utf8');
		const tokens = readFileSync('src/styles/tokens.css', 'utf8');
		expect(card).toContain("emphasis?: 'default' | 'strong'");
		expect(card).toContain('data-emphasis={emphasis}');
		expect(styles).toContain(".ts-card[data-emphasis='strong']");
		expect(styles).toContain('background: var(--ts-color-card-surface)');
		expect(tokens).toContain('--ts-color-card-surface: color-mix(in srgb, var(--ts-color-accent-soft) 65%, var(--ts-color-surface))');
		expect(styles).toMatch(/\.ts-resource-grid\[data-spacing='roomy'\]\s*\{[^}]*gap:\s*var\(--ts-space-4\);/u);
		expect(styles).toMatch(/\.ts-button\s*\{[\s\S]*?box-sizing:\s*border-box;/u);
	});

	it('keeps registration validation focused on completing registration', () => {
		const registration = readFileSync('src/astro/auth/RegistrationForm.astro', 'utf8');
		const passwordSetup = readFileSync('src/astro/forms/fields/PasswordSetupFields.astro', 'utf8');
		const passwordMeter = readFileSync('src/astro/forms/fields/PasswordMeter.astro', 'utf8');

		expect(registration).not.toContain('Enter a username to check availability.');
		expect(registration).not.toContain('Enter an email to check availability.');
		expect(registration).not.toMatch(/Checking \$\{kind\} availability|is available\./u);
		expect(registration).toContain('This ${kind} isn’t available for registration.');
		expect(registration).toContain('<PasswordSetupFields passwordId="registerPassword"');
		expect(registration).toContain('aria-live="polite"');
		expect(registration).toContain('payload.available === true');
		expect(registration).toContain('submit.disabled = !states.username || !states.email');
		expect(passwordSetup).toContain('Passwords do not match.');
		expect(passwordSetup).toContain('Passwords match.');
		expect(passwordSetup).toContain('<PasswordMeter');
		for (const rule of ['lowercase', 'uppercase', 'number', 'symbol', 'spaces']) {
			expect(passwordMeter).toContain(`data-ts-password-rule="${rule}"`);
		}
		expect(passwordMeter).toContain('score === 6');
	});

	it('registers foundation components in the sandbox catalog', () => {
		const ids = new Set(componentCatalog.map((entry) => entry.id));

		for (const id of ['product-shell', 'shell-icon', 'action-bar', 'resource-card', 'readiness-summary', 'distribution-summary', 'overlay-status', 'allocation-panel', 'allocation-tree', 'allocation-state-legend', 'work-queue-summary', 'activity-timeline', 'permission-boundary', 'collection-template', 'dashboard-template', 'detail-template', 'reader-template', 'settings-template', 'workspace-template', 'feedback-button', 'feedback-dialog', 'feedback-redaction-boundary', 'toast-region', 'help-button', 'help-drawer', 'help-popover', 'contextual-help-panel', 'help-topic-link', 'help-action-list']) {
			expect(ids.has(id), `${id} should be cataloged`).toBe(true);
		}
	});

	it('keeps foundation files data-source agnostic', () => {
		const forbidden = /\bfetch\s*\(|Astro\.request|@treeseed\/(?:admin|core|api|agent)|from\s+['"][^'"]*(?:service|facade|client|api)[^'"]*['"]/iu;

		for (const file of foundationFiles) {
			expect(readFileSync(file, 'utf8'), `${file} should not import data/service behavior`).not.toMatch(forbidden);
		}
	});

	it('maps resolved actions into button props without enabling unavailable actions', () => {
		const action: ResolvedAction = {
			id: 'question.export',
			label: 'Export',
			state: 'disabledWithReason',
			href: '/app/work/questions/export',
			reason: 'Export is not ready yet.',
			method: 'GET',
			confirmation: 'none',
			auditSensitivity: 'normal',
		};

		expect(actionToButton(action)).toMatchObject({
			label: 'Export',
			href: undefined,
			disabled: true,
			ariaLabel: 'Export. Export is not ready yet.',
		});
	});

	it('keeps screenshot capture lazy and redaction-aware', () => {
		const dialog = readFileSync('src/lib/feedback/dialog.ts', 'utf8');
		const capture = readFileSync('src/lib/feedback/dom-capture.ts', 'utf8');
		const shellSources = [
			readFileSync('src/astro/shell/layout/ProductShell.astro', 'utf8'),
			readFileSync('src/astro/shell/layout/PublicShell.astro', 'utf8'),
			readFileSync('src/astro/auth/AuthShell.astro', 'utf8'),
		].join('\n');

		expect(dialog).toContain("await import('./dom-capture.ts')");
		expect(shellSources).not.toContain('dom-capture');
		expect(capture).toContain('data-ts-feedback-redact');
	});

	it('keeps contextual help shell-level and search lazy', () => {
		const helpDrawer = readFileSync('src/lib/help/drawer.ts', 'utf8');
		const feedbackDialog = readFileSync('src/lib/feedback/dialog.ts', 'utf8');
		const shellSources = [
			readFileSync('src/astro/shell/layout/ProductShell.astro', 'utf8'),
			readFileSync('src/astro/shell/layout/PublicShell.astro', 'utf8'),
			readFileSync('src/astro/auth/AuthShell.astro', 'utf8'),
		].join('\n');

		expect(shellSources).toContain('HelpButton');
		expect(shellSources).toContain('HelpDrawer');
		expect(shellSources).not.toContain('>Help</button>');
		expect(helpDrawer).toContain("await import('./search.ts')");
		expect(shellSources).not.toContain('lib/help/search');
		expect(feedbackDialog).toContain('tsFeedbackContextPatch');
	});

	it('keeps overlay editor bootstrap lazy and policy-gated', () => {
		const overlayLoader = readFileSync('src/lib/distribution/overlay-loader.ts', 'utf8');
		const shellSources = [
			readFileSync('src/astro/shell/layout/ProductShell.astro', 'utf8'),
			readFileSync('src/astro/shell/layout/PublicShell.astro', 'utf8'),
			readFileSync('src/astro/auth/AuthShell.astro', 'utf8'),
		].join('\n');

		expect(overlayLoader).toContain("await import('./overlay-session.ts')");
		expect(overlayLoader).toContain("status.state !== 'available'");
		expect(shellSources).not.toContain('overlay-session');
	});

	it('searches only provided contextual help payloads', () => {
		const results = searchContextualHelp({
			topics: [{ id: 'questions', title: 'Question records', summary: 'Capture uncertainty.', source: 'capability' }],
			actions: [{ id: 'question.export', label: 'Export', reason: 'Exports arrive later.', remediation: 'Use the page table today.' }],
		}, 'export');

		expect(results).toEqual([expect.objectContaining({
			topicId: 'question.export',
			title: 'Export',
			source: 'action-state',
		})]);
	});
});
