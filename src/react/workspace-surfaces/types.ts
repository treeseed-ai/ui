import type { ReactNode } from 'react';
import type { SurfaceKind } from '../../lib/foundation/contracts.ts';

export type WorkspaceSurfaceMode = 'inline' | 'focused';
export type WorkspaceSurfaceBoundary = 'control-surface' | 'workspace-content';

export type WorkspaceOverlayPresentationKind =
	| 'detail'
	| 'designer'
	| 'simulation'
	| 'editor'
	| 'diagnostic'
	| 'help'
	| 'confirmation';

export type WorkspaceOverlayKind = WorkspaceOverlayPresentationKind | SurfaceKind;

export interface WorkspaceOverlayReference {
	kind: WorkspaceOverlayKind;
	id: string;
	parentId?: string;
}

export interface WorkspaceFocusState {
	surfaceId: string | null;
	mode: WorkspaceSurfaceMode;
	overlays: WorkspaceOverlayReference[];
}

export interface WorkspaceFocusSurfaceProps {
	id: string;
	label: string;
	mode: WorkspaceSurfaceMode;
	boundary?: WorkspaceSurfaceBoundary;
	onModeChange(mode: WorkspaceSurfaceMode): void;
	headerContext?: ReactNode;
	children: ReactNode;
	className?: string;
}
