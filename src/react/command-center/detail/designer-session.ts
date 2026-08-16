type DesignerSession = {
	version: 2;
	expectedBase: string;
	definition: Record<string, unknown>;
	active: string;
	contentBody: string;
};

function object(value: unknown): Record<string, unknown> | null {
	return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export function designerSessionKey(projectId: unknown, path: unknown) {
	return `agent-designer:${String(projectId)}:${String(path)}`;
}

export function readDesignerSession(key: string, expectedBase: unknown) {
	if (typeof sessionStorage === 'undefined') return null;
	try {
		const value = object(JSON.parse(sessionStorage.getItem(key) ?? 'null'));
		const definition = object(value?.definition);
		if (value?.version !== 2 || value.expectedBase !== String(expectedBase) || !definition || typeof value.contentBody !== 'string') return null;
		return { definition, active: typeof value.active === 'string' ? value.active : 'identity', contentBody: value.contentBody };
	} catch { return null; }
}

export function writeDesignerSession(key: string, expectedBase: unknown, definition: Record<string, unknown>, active: string, contentBody = '') {
	if (typeof sessionStorage === 'undefined') return;
	try {
		const value: DesignerSession = { version: 2, expectedBase: String(expectedBase), definition, active, contentBody };
		sessionStorage.setItem(key, JSON.stringify(value));
	} catch {}
}

export function clearDesignerSession(key: string) {
	try { sessionStorage.removeItem(key); } catch {}
}
