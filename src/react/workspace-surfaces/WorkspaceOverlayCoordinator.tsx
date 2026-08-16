import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
	const known = ['detail', 'designer', 'simulation', 'editor', 'diagnostic', 'help', 'confirmation'];
	const kind = known.includes(reference.kind) ? reference.kind : reference.kind === 'agent' ? 'designer' : reference.kind === 'assignment-graph' ? 'diagnostic' : 'detail';
	return { kind: kind as WorkspaceOverlayReference['kind'], id: reference.id };
}

export function WorkspaceOverlayCoordinator({ children }: { children: ReactNode }) {
	const initial = typeof window === 'undefined' ? { focusedSurfaceId: null, overlays: [] } : readWorkspaceNavigation();
	const [surfaceId, setSurfaceId] = useState<string | null>(initial.focusedSurfaceId);
	const [overlayStack, setOverlayStack] = useState<WorkspaceOverlayReference[]>(initial.overlays.map(presentationReference));
	useEffect(() => { const update = () => { const navigation = readWorkspaceNavigation(); setSurfaceId(navigation.focusedSurfaceId); setOverlayStack(navigation.overlays.map(presentationReference)); }; addEventListener('popstate', update); return () => removeEventListener('popstate', update); }, []);
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
