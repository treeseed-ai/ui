import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { createWorkspaceState, workspaceReducer, type SurfaceRoute } from '../../lib/foundation/contracts.ts';
import type { WorkspaceFocusState, WorkspaceOverlayReference, WorkspaceSurfaceMode } from './types.ts';
import { closeWorkspaceOverlay, openWorkspaceOverlay, readWorkspaceNavigation, setWorkspaceFocus } from './workspace-navigation.ts';

interface WorkspaceOverlayCoordinatorValue extends WorkspaceFocusState {
	focusSurface(id: string): void;
	shrinkSurface(id: string): void;
	openOverlay(reference: WorkspaceOverlayReference): void;
	closeOverlay(id?: string): void;
	closeTop(): void;
}

const WorkspaceOverlayContext = createContext<WorkspaceOverlayCoordinatorValue | null>(null);
function presentationReference(reference: { kind: string; id: string }): WorkspaceOverlayReference {
	return { kind: reference.kind, id: reference.id };
}

function restoredState() {
	const initial = createWorkspaceState();
	if (typeof window === 'undefined') return initial;
	const navigation = readWorkspaceNavigation();
	return workspaceReducer(initial, { type: 'restore.stack', workspace: 'team', routes: navigation.overlays as SurfaceRoute[] });
}

export function WorkspaceOverlayCoordinator({ children }: { children: ReactNode }) {
	const initial = typeof window === 'undefined' ? { focusedSurfaceId: null, overlays: [] } : readWorkspaceNavigation();
	const [surfaceId, setSurfaceId] = useState<string | null>(initial.focusedSurfaceId);
	const [workspaceState, dispatch] = useReducer(workspaceReducer, undefined, restoredState);
	const overlayStack = workspaceState.workspaces.team.stack.slice(1).map((frame) => presentationReference({ kind: frame.route.kind, id: frame.route.id ?? frame.route.kind }));
	useEffect(() => { const update = () => { const navigation = readWorkspaceNavigation(); setSurfaceId(navigation.focusedSurfaceId); dispatch({ type: 'restore.stack', workspace: 'team', routes: navigation.overlays as SurfaceRoute[] }); }; addEventListener('popstate', update); return () => removeEventListener('popstate', update); }, []);
	const focusSurface = useCallback((id: string) => setWorkspaceFocus(id), []);
	const shrinkSurface = useCallback((id: string) => { if (readWorkspaceNavigation().focusedSurfaceId === id) setWorkspaceFocus(null, 'replace'); }, []);
	const openOverlay = useCallback((reference: WorkspaceOverlayReference) => openWorkspaceOverlay(reference), []);
	const closeOverlay = useCallback((id?: string) => closeWorkspaceOverlay(id), []);
	const closeTop = useCallback(() => closeOverlay(), [closeOverlay]);
	const mode: WorkspaceSurfaceMode = surfaceId ? 'focused' : 'inline';
	const value = useMemo(() => ({ surfaceId, mode, overlays: overlayStack, focusSurface, shrinkSurface, openOverlay, closeOverlay, closeTop }), [closeOverlay, closeTop, focusSurface, mode, openOverlay, overlayStack, shrinkSurface, surfaceId]);
	return <WorkspaceOverlayContext.Provider value={value}>{children}</WorkspaceOverlayContext.Provider>;
}

export function useWorkspaceOverlayCoordinator() {
	const value = useContext(WorkspaceOverlayContext);
	if (!value) throw new Error('Workspace overlay controls require a WorkspaceOverlayCoordinator.');
	return value;
}
