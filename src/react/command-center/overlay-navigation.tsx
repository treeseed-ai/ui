import type { CSSProperties, ReactNode } from 'react';
import type { CommandEntityKind } from './types.ts';
import { openWorkspaceOverlay, readWorkspaceNavigation } from '../workspace-surfaces/workspace-navigation.ts';

export interface InspectTarget { kind: CommandEntityKind; id: string }

export function readInspectStack(search?: string) {
	return readWorkspaceNavigation(search, true).overlays.map((entry) => ({ kind: entry.kind as CommandEntityKind, id: entry.id }));
}

export function openCommandOverlay(target: InspectTarget) {
	openWorkspaceOverlay(target);
}

export function CommandOverlayTrigger({ target, children, className, style, dataKind }: { target: InspectTarget; children: ReactNode; className?: string; style?: CSSProperties; dataKind?: string }) {
	return <button type="button" aria-haspopup="dialog" className={className} style={style} data-kind={dataKind} onClick={() => openCommandOverlay(target)}>{children}</button>;
}
