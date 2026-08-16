import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorkspaceSurfaceMode } from './types.ts';
import { readWorkspaceNavigation, setWorkspaceFocus } from './workspace-navigation.ts';

function modeFromNavigation(surfaceId: string, aliases: string[], fallback: WorkspaceSurfaceMode) {
	if (typeof window === 'undefined') return fallback;
	const focused = readWorkspaceNavigation().focusedSurfaceId;
	return focused === surfaceId || aliases.includes(focused ?? '') ? 'focused' : 'inline';
}

export function useWorkspaceSurfaceMode({
	surfaceId,
	aliases = [],
	initialMode = 'inline',
	focusParameters = {},
	inlineParameters = {},
}: {
	surfaceId: string;
	aliases?: string[];
	initialMode?: WorkspaceSurfaceMode;
	focusParameters?: Record<string, string | null>;
	inlineParameters?: Record<string, string | null>;
}) {
	const aliasesKey = aliases.join('\u0000');
	const [mode, setMode] = useState<WorkspaceSurfaceMode>(() => modeFromNavigation(surfaceId, aliases, initialMode));
	const parameters = useRef({ focus: focusParameters, inline: inlineParameters });
	parameters.current = { focus: focusParameters, inline: inlineParameters };
	useEffect(() => {
		const acceptedAliases = aliasesKey ? aliasesKey.split('\u0000') : [];
		const synchronize = () => setMode(modeFromNavigation(surfaceId, acceptedAliases, 'inline'));
		window.addEventListener('popstate', synchronize);
		return () => window.removeEventListener('popstate', synchronize);
	}, [aliasesKey, surfaceId]);
	const changeMode = useCallback((next: WorkspaceSurfaceMode) => {
		setMode(next);
		setWorkspaceFocus(next === 'focused' ? surfaceId : null, next === 'focused' ? 'push' : 'replace', parameters.current[next === 'focused' ? 'focus' : 'inline']);
	}, [surfaceId]);
	return [mode, changeMode] as const;
}
