const maximumOverlayDepth = 8;
export interface WorkspaceNavigationTarget { kind: string; id: string }
export interface WorkspaceExitRequest { id: string; }

const workspacePathPrefix = '/app/work';

function decodeLegacy(value: string) {
	try {
		const raw = value.replace(/-/gu, '+').replace(/_/gu, '/');
		return decodeURIComponent(escape(atob(raw.padEnd(Math.ceil(raw.length / 4) * 4, '='))));
	} catch { return null; }
}

export function readWorkspaceNavigation(search?: string, legacyBase64 = false) {
	const value = search ?? (typeof window === 'undefined' ? '' : window.location.search);
	const parameters = new URLSearchParams(value);
	const overlays = parameters.getAll('inspect').flatMap((entry) => {
		const split = entry.indexOf('~');
		if (split < 1) return [];
		const encodedId = entry.slice(split + 1);
		let id = encodedId;
		if (legacyBase64) id = decodeLegacy(encodedId) ?? id;
		return [{ kind: entry.slice(0, split), id }];
	}).slice(-maximumOverlayDepth);
	return { focusedSurfaceId: parameters.get('focus'), overlays };
}

export function safeWorkspaceReturnPath(value: string | null | undefined) {
	if (!value?.startsWith(workspacePathPrefix)) return null;
	try {
		const url = new URL(value, 'https://workspace.invalid');
		return url.origin === 'https://workspace.invalid' && (url.pathname === workspacePathPrefix || url.pathname.startsWith(`${workspacePathPrefix}/`))
			? `${url.pathname}${url.search}${url.hash}`
			: null;
	} catch { return null; }
}

export function currentWorkspaceReturnPath(parameters: Record<string, string | null> = {}) {
	const url = new URL(window.location.href);
	for (const [key, value] of Object.entries(parameters)) {
		if (value === null) url.searchParams.delete(key);
		else url.searchParams.set(key, value);
	}
	return safeWorkspaceReturnPath(`${url.pathname}${url.search}${url.hash}`);
}

function announceNavigation() {
	window.dispatchEvent(new PopStateEvent('popstate'));
}

export function requestWorkspaceExit(id: string) {
	return window.dispatchEvent(new CustomEvent<WorkspaceExitRequest>('treeseed:workspace-exit-request', {
		cancelable: true,
		detail: { id },
	}));
}

function replaceOverlayParameters(url: URL, overlays: WorkspaceNavigationTarget[]) {
	url.searchParams.delete('inspect');
	overlays.forEach((entry) => url.searchParams.append('inspect', `${entry.kind}~${entry.id}`));
}

export function openWorkspaceOverlay(reference: WorkspaceNavigationTarget) {
	const url = new URL(window.location.href);
	const current = readWorkspaceNavigation(url.search).overlays;
	const existing = current.findIndex((entry) => entry.kind === reference.kind && entry.id === reference.id);
	const next = existing >= 0 ? current.slice(0, existing + 1) : [...current, reference].slice(-maximumOverlayDepth);
	replaceOverlayParameters(url, next);
	history.pushState({ ...history.state, workspaceOverlay: true }, '', url);
	announceNavigation();
}

export function closeWorkspaceOverlay(id?: string) {
	const navigation = readWorkspaceNavigation();
	if (!id || navigation.overlays.at(-1)?.id === id) { closeTopWorkspaceOverlay(); return; }
	const index = navigation.overlays.findIndex((entry) => entry.id === id);
	if (index < 0) return;
	const url = new URL(window.location.href);
	replaceOverlayParameters(url, navigation.overlays.slice(0, index));
	history.replaceState(history.state, '', url);
	announceNavigation();
}

export function closeTopWorkspaceOverlay() {
	const top = readWorkspaceNavigation().overlays.at(-1);
	if (top && !requestWorkspaceExit(top.id)) return;
	if (history.state?.workspaceOverlay || history.state?.tsCommandOverlay || history.state?.atlasInspect) {
		history.back();
		return;
	}
	const url = new URL(window.location.href);
	const values = url.searchParams.getAll('inspect');
	url.searchParams.delete('inspect');
	values.slice(0, -1).forEach((value) => url.searchParams.append('inspect', value));
	history.replaceState(history.state, '', url);
	announceNavigation();
}

export function setWorkspaceFocus(surfaceId: string | null, action: 'push' | 'replace' = 'push', parameters: Record<string, string | null> = {}) {
	const url = new URL(window.location.href);
	if (surfaceId) url.searchParams.set('focus', surfaceId);
	else url.searchParams.delete('focus');
	for (const [key, value] of Object.entries(parameters)) {
		if (value === null) url.searchParams.delete(key);
		else url.searchParams.set(key, value);
	}
	history[`${action}State`]({ ...history.state, workspaceFocus: surfaceId }, '', url);
	announceNavigation();
}
