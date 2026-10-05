import type { SurfaceKind, WorkspaceId } from '../../lib/foundation/contracts.ts';

export type InkRow = Record<string, unknown>;

export interface InkSurfaceItem {
	id: string;
	title: string;
	description: string;
	status?: string;
	raw: InkRow;
}

export interface InkSurfaceCollection {
	items: InkSurfaceItem[];
	message: string;
}

/** Renderer adapter. Product packages provide transport and authentication, never layout. */
export interface InkWorkspaceDataSource {
	loadWorkspace(workspace: WorkspaceId, query?: string): Promise<InkSurfaceItem[]>;
	loadSurface(surface: SurfaceKind): Promise<InkSurfaceCollection>;
	canExecute(actionId: string, selected?: InkSurfaceItem): boolean;
	execute(actionId: string, values: InkRow, selected?: InkSurfaceItem): Promise<unknown>;
	sendMessage(channel: string, message: string): Promise<unknown>;
}
