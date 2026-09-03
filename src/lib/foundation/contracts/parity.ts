import type { SurfaceKind, WorkspaceId } from './workspace.ts';

export type UiRenderer = 'ink' | 'web';
export type DevelopmentSceneState = 'ready' | 'loading' | 'reconnecting' | 'empty' | 'stale' | 'denied' | 'failed' | 'offline';
export type DevelopmentViewport = 'narrow' | 'medium' | 'wide';

export interface WireframeParityDefinition {
	pages: number[];
	label: string;
	viewId: string;
	surface: SurfaceKind;
	workspace: WorkspaceId;
	adminRoute: string;
	renderers: UiRenderer[];
	requiredActions: string[];
}

export interface DevelopmentSceneDefinition {
	id: string;
	seed: 'treeseed';
	data: 'live-seed';
	workspace: WorkspaceId;
	surface?: SurfaceKind;
	state: DevelopmentSceneState;
	viewport: DevelopmentViewport;
	utilityApplication?: 'chat' | 'feedback';
	description: string;
}

export const WIREFRAME_PARITY: readonly WireframeParityDefinition[] = [
	{ pages: [4, 5], label: 'Team viewer', viewId: 'team', surface: 'team', workspace: 'team', adminRoute: '/app/teams/[teamId]', renderers: ['ink', 'web'], requiredActions: ['service.connect', 'capacity.configure', 'project.create'] },
	{ pages: [6], label: 'Services', viewId: 'services', surface: 'services', workspace: 'team', adminRoute: '/app/services', renderers: ['ink', 'web'], requiredActions: ['service.connect', 'service.configure', 'service.remove'] },
	{ pages: [7], label: 'Capacity', viewId: 'capacity', surface: 'capacity', workspace: 'team', adminRoute: '/app/capacity', renderers: ['ink', 'web'], requiredActions: ['capacity.configure', 'capacity.revoke'] },
	{ pages: [8], label: 'Projects', viewId: 'projects', surface: 'projects', workspace: 'team', adminRoute: '/app/projects', renderers: ['ink', 'web'], requiredActions: ['project.create', 'project.launch'] },
	{ pages: [9], label: 'Knowledge', viewId: 'knowledge', surface: 'knowledge', workspace: 'discover', adminRoute: '/app/knowledge', renderers: ['ink', 'web'], requiredActions: ['content.edit'] },
	{ pages: [10], label: 'Models', viewId: 'model', surface: 'model', workspace: 'discover', adminRoute: '/app/work/find', renderers: ['ink', 'web'], requiredActions: [] },
	{ pages: [11], label: 'Templates', viewId: 'template', surface: 'template', workspace: 'discover', adminRoute: '/app/work/find', renderers: ['ink', 'web'], requiredActions: [] },
	{ pages: [12], label: 'Chat', viewId: 'chat', surface: 'chat', workspace: 'chat', adminRoute: '/app/chat', renderers: ['ink', 'web'], requiredActions: ['message.send'] },
	{ pages: [13], label: 'Agent Builder', viewId: 'agent-builder', surface: 'agent-builder', workspace: 'team', adminRoute: '/app/work/build', renderers: ['ink', 'web'], requiredActions: ['agent.create', 'agent.save'] },
	{ pages: [14], label: 'Inbox', viewId: 'inbox', surface: 'inbox', workspace: 'inbox', adminRoute: '/app/work/inbox', renderers: ['ink', 'web'], requiredActions: ['question.answer', 'proposal.approve', 'proposal.reject'] },
	{ pages: [15], label: 'Allocator', viewId: 'allocator', surface: 'allocator', workspace: 'team', adminRoute: '/app/work/direction', renderers: ['ink', 'web'], requiredActions: ['allocation.save'] },
	{ pages: [16], label: 'Discover', viewId: 'discover', surface: 'discover', workspace: 'discover', adminRoute: '/app/work/find', renderers: ['ink', 'web'], requiredActions: [] },
	{ pages: [17], label: 'Content', viewId: 'content', surface: 'content', workspace: 'discover', adminRoute: '/app/work/results', renderers: ['ink', 'web'], requiredActions: ['content.edit', 'content.comment'] },
] as const;

const viewportWidths: Record<DevelopmentViewport, number> = { narrow: 390, medium: 820, wide: 1440 };
const baseScene = (id: string, workspace: WorkspaceId, surface: SurfaceKind | undefined, viewport: DevelopmentViewport, description: string): DevelopmentSceneDefinition => ({ id, seed: 'treeseed', data: 'live-seed', workspace, surface, state: 'ready', viewport, description: `${description} at ${viewportWidths[viewport]}px.` });
const rootScenes = (['team', 'chat', 'inbox', 'discover'] as const).flatMap((workspace) => (['narrow', 'medium', 'wide'] as const).map((viewport) => baseScene(`root.${workspace}.${viewport}`, workspace, undefined, viewport, `Seeded ${workspace} root`)));
const overlayScenes = WIREFRAME_PARITY.filter((entry) => !['chat', 'inbox', 'discover'].includes(entry.surface)).flatMap((entry) => (['narrow', 'medium', 'wide'] as const).map((viewport) => baseScene(`surface.${entry.surface}.${viewport}`, entry.workspace, entry.surface, viewport, `Seeded ${entry.label} surface`)));
const atlasStates = (['ready', 'loading', 'reconnecting', 'empty', 'stale', 'denied', 'failed', 'offline'] as const).map((state) => ({ ...baseScene(`atlas.${state}.wide`, 'team', 'team', 'wide', `Atlas ${state} state`), state }));
const dockStates = (['chat', 'feedback'] as const).flatMap((utilityApplication) => (['ready', 'loading', 'reconnecting', 'empty', 'stale', 'denied', 'failed', 'offline'] as const).flatMap((state) => (['narrow', 'medium', 'wide'] as const).map((viewport) => ({ ...baseScene(`dock.${utilityApplication}.${state}.${viewport}`, 'team', undefined, viewport, `${utilityApplication} dock ${state} state`), state, utilityApplication }))));

/** Stable scenes use the local TreeSeed seed as their data source; component fixtures are fallback-only. */
export const DEVELOPMENT_SCENES: readonly DevelopmentSceneDefinition[] = [...rootScenes, ...overlayScenes, ...atlasStates, ...dockStates];

export function resolveDevelopmentScene(id: string) {
	return DEVELOPMENT_SCENES.find((scene) => scene.id === id);
}

/** Resolve the stable Admin deep link used to reopen a live-seed scene after HMR or restart. */
export function developmentSceneAdminRoute(scene: DevelopmentSceneDefinition, teamId?: string) {
	if (scene.id.startsWith('dock.') || scene.id.startsWith('atlas.')) return '/app/work';
	if (scene.id.startsWith('root.')) {
		return ({ team: '/app/work', chat: '/app/chat', inbox: '/app/work/inbox', discover: '/app/work/find' } as const)[scene.workspace];
	}
	const definition = WIREFRAME_PARITY.find((entry) => entry.surface === scene.surface);
	if (!definition) return '/app/work';
	return definition.adminRoute.replace('[teamId]', encodeURIComponent(teamId ?? 'current'));
}
