import type { MarketComponentMapEntry } from '../../marketComponentMap.ts';

const entry = (
	uiPath: string,
	sourcePath: string,
	sandboxRoute?: string,
): MarketComponentMapEntry => ({
	uiPath,
	sourcePath,
	category: 'App Controls',
	parityMode: 'rendered-visual',
	allowedSourceDifferences: ['import-paths', 'package-safe-types', 'structural-props', 'route-base-props', 'generic-component-names'],
	...(sandboxRoute ? { sandboxRoute } : {}),
});

export const APP_CONTROLS_COMPONENTS = [
	entry(
		'src/astro/app/controls/data/DeleteConfirmationModal.astro',
		'/home/adrian/Projects/treeseed/market/src/components/app/controls/DeleteConfirmationModal.astro',
		'/displays/delete-confirmation-modal',
	),
	entry(
		'src/astro/app/controls/content/MarkdownField.astro',
		'/home/adrian/Projects/treeseed/market/src/components/app/controls/MarkdownField.astro',
	),
	entry(
		'src/astro/app/controls/data/PlainTable.astro',
		'/home/adrian/Projects/treeseed/market/src/components/app/controls/PlainTable.astro',
		'/displays/plain-table',
	),
	entry(
		'src/astro/app/controls/navigation/ProjectControlNav.astro',
		'/home/adrian/Projects/treeseed/market/src/components/app/controls/ProjectControlNav.astro',
		'/displays/project-control-nav',
	),
	entry(
		'src/astro/app/controls/content/RelatedContentCreator.astro',
		'/home/adrian/Projects/treeseed/market/src/components/app/controls/RelatedContentCreator.astro',
		'/displays/related-content-creator',
	),
	entry(
		'src/astro/app/controls/content/WorkContentNav.astro',
		'/home/adrian/Projects/treeseed/market/src/components/app/controls/WorkContentNav.astro',
		'/displays/work-content-nav',
	),
] as const satisfies readonly MarketComponentMapEntry[];
