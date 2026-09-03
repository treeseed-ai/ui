import type { UiContext } from './semantic.ts';
import type { ApplicationPlacement } from './application.ts';

export const ROOT_WORKSPACES = ['team', 'chat', 'inbox', 'discover'] as const;
export type WorkspaceId = typeof ROOT_WORKSPACES[number];

export type CoreSurfaceKind =
	| WorkspaceId | 'user' | 'services' | 'capacity' | 'projects' | 'knowledge'
	| 'model' | 'template' | 'agent-builder' | 'allocator' | 'content' | 'releases';

/** Registered applications may add semantic surface kinds without changing the kernel. */
export type SurfaceKind = CoreSurfaceKind | (string & {});

export interface SurfaceRoute {
	kind: SurfaceKind;
	id?: string;
	viewId?: string;
	parameters?: Record<string, string>;
}

export interface SurfaceFrame {
	route: SurfaceRoute;
	focusId?: string;
	dirty?: boolean;
}

export interface WorkspaceState {
	root: WorkspaceId;
	stack: SurfaceFrame[];
	focusHistory: string[];
	selection?: string;
	scrollOffset?: number;
}

export interface AppWorkspaceState {
	activeWorkspace: WorkspaceId;
	workspaces: Record<WorkspaceId, WorkspaceState>;
	context: UiContext;
	commandPaletteOpen: boolean;
	utilityDock: UtilityDockState;
}

export interface UtilityDockState {
	open: boolean;
	applicationId?: string;
	placement: Extract<ApplicationPlacement, 'dock-end' | 'dock-bottom'>;
	size: number;
	returnFocusId?: string;
}

export type WorkspaceAction =
	| { type: 'switch'; workspace: WorkspaceId }
	| { type: 'open'; route: SurfaceRoute; focusId?: string }
	| { type: 'close'; discardDirty?: boolean }
	| { type: 'replace'; route: SurfaceRoute; focusId?: string }
	| { type: 'focus'; focusId: string }
	| { type: 'select'; selection?: string }
	| { type: 'scroll'; offset: number }
	| { type: 'dirty'; dirty: boolean }
	| { type: 'context'; context: Partial<UiContext> }
	| { type: 'palette'; open: boolean }
	| { type: 'utility.open'; applicationId: string; placement: UtilityDockState['placement']; returnFocusId?: string }
	| { type: 'utility.close' }
	| { type: 'utility.resize'; size: number }
	| { type: 'utility.place'; placement: UtilityDockState['placement'] }
	| { type: 'restore.stack'; workspace: WorkspaceId; routes: SurfaceRoute[] };

function initialWorkspace(root: WorkspaceId): WorkspaceState {
	return { root, stack: [{ route: { kind: root, viewId: root } }], focusHistory: [] };
}

export function createWorkspaceState(context: UiContext = {}): AppWorkspaceState {
	return {
		activeWorkspace: 'team',
		workspaces: Object.fromEntries(ROOT_WORKSPACES.map((root) => [root, initialWorkspace(root)])) as Record<WorkspaceId, WorkspaceState>,
		context,
		commandPaletteOpen: false,
		utilityDock: { open: false, placement: 'dock-end', size: 480 },
	};
}

function changeActive(state: AppWorkspaceState, update: (workspace: WorkspaceState) => WorkspaceState): AppWorkspaceState {
	const current = state.workspaces[state.activeWorkspace];
	const next = update(current);
	return next === current ? state : { ...state, workspaces: { ...state.workspaces, [state.activeWorkspace]: next } };
}

export function activeSurface(state: AppWorkspaceState) {
	return state.workspaces[state.activeWorkspace].stack.at(-1)!;
}

export function workspaceReducer(state: AppWorkspaceState, action: WorkspaceAction): AppWorkspaceState {
	if (action.type === 'switch') return { ...state, activeWorkspace: action.workspace, commandPaletteOpen: false };
	if (action.type === 'restore.stack') {
		const workspace = state.workspaces[action.workspace];
		const routes = action.routes.filter((route) => route.kind !== action.workspace);
		return { ...state, workspaces: { ...state.workspaces, [action.workspace]: {
			...workspace,
			stack: [{ route: { kind: action.workspace, viewId: action.workspace } }, ...routes.map((route) => ({ route }))],
		} } };
	}
	if (action.type === 'context') return { ...state, context: { ...state.context, ...action.context } };
	if (action.type === 'palette') return { ...state, commandPaletteOpen: action.open };
	if (action.type === 'utility.open') return { ...state, utilityDock: { ...state.utilityDock, open: true, applicationId: action.applicationId, placement: action.placement, returnFocusId: action.returnFocusId } };
	if (action.type === 'utility.close') return { ...state, utilityDock: { ...state.utilityDock, open: false, applicationId: undefined } };
	if (action.type === 'utility.resize') return { ...state, utilityDock: { ...state.utilityDock, size: Math.max(240, Math.min(720, action.size)) } };
	if (action.type === 'utility.place') return { ...state, utilityDock: { ...state.utilityDock, placement: action.placement } };
	return changeActive(state, (workspace) => {
		if (action.type === 'open') return { ...workspace, stack: [...workspace.stack, { route: action.route, focusId: action.focusId }], focusHistory: action.focusId ? [...workspace.focusHistory, action.focusId] : workspace.focusHistory };
		if (action.type === 'replace') return { ...workspace, stack: [...workspace.stack.slice(0, -1), { route: action.route, focusId: action.focusId }] };
		if (action.type === 'close') {
			const top = workspace.stack.at(-1)!;
			if (workspace.stack.length === 1 || top.dirty && !action.discardDirty) return workspace;
			return { ...workspace, stack: workspace.stack.slice(0, -1), focusHistory: workspace.focusHistory.slice(0, -1) };
		}
		if (action.type === 'focus') return { ...workspace, focusHistory: [...workspace.focusHistory.filter((id) => id !== action.focusId), action.focusId], stack: workspace.stack.map((frame, index) => index === workspace.stack.length - 1 ? { ...frame, focusId: action.focusId } : frame) };
		if (action.type === 'select') return { ...workspace, selection: action.selection };
		if (action.type === 'scroll') return { ...workspace, scrollOffset: Math.max(0, action.offset) };
		if (action.type === 'dirty') return { ...workspace, stack: workspace.stack.map((frame, index) => index === workspace.stack.length - 1 ? { ...frame, dirty: action.dirty } : frame) };
		return workspace;
	});
}
