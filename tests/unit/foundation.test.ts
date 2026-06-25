import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { componentCatalog } from '../../sandbox/src/lib/component-catalog';
import { actionToButton, type ResolvedAction } from '../../src/lib/foundation/contracts';
import { searchContextualHelp } from '../../src/lib/help/search';

const foundationFiles = [
	'src/lib/foundation/contracts.ts',
	'src/astro/templates/CollectionTemplate.astro',
	'src/astro/templates/DashboardTemplate.astro',
	'src/astro/templates/DetailTemplate.astro',
	'src/astro/templates/ReaderTemplate.astro',
	'src/astro/templates/SettingsTemplate.astro',
	'src/astro/layout/ActionBar.astro',
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
	it('exports ProductShell as the canonical authenticated shell', () => {
		const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { exports: Record<string, unknown> };

		expect(packageJson.exports['./components/astro/shell/ProductShell.astro']).toBe('./dist/astro/shell/ProductShell.astro');
		expect(packageJson.exports['./components/astro/shell/AppShell.astro']).toBeUndefined();
		expect(existsSync('src/astro/shell/ProductShell.astro')).toBe(true);
		expect(existsSync('src/astro/shell/AppShell.astro')).toBe(false);
	});

	it('registers foundation components in the sandbox catalog', () => {
		const ids = new Set(componentCatalog.map((entry) => entry.id));

		for (const id of ['product-shell', 'action-bar', 'resource-card', 'readiness-summary', 'distribution-summary', 'overlay-status', 'allocation-panel', 'allocation-tree', 'allocation-state-legend', 'work-queue-summary', 'activity-timeline', 'permission-boundary', 'collection-template', 'dashboard-template', 'detail-template', 'reader-template', 'settings-template', 'workspace-template', 'feedback-button', 'feedback-dialog', 'feedback-redaction-boundary', 'help-button', 'help-drawer', 'help-popover', 'contextual-help-panel', 'help-topic-link', 'help-action-list']) {
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
			readFileSync('src/astro/shell/ProductShell.astro', 'utf8'),
			readFileSync('src/astro/shell/PublicShell.astro', 'utf8'),
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
			readFileSync('src/astro/shell/ProductShell.astro', 'utf8'),
			readFileSync('src/astro/shell/PublicShell.astro', 'utf8'),
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
			readFileSync('src/astro/shell/ProductShell.astro', 'utf8'),
			readFileSync('src/astro/shell/PublicShell.astro', 'utf8'),
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
