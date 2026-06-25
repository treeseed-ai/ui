export function createOverlaySession() {
	return {
		startedAt: new Date().toISOString(),
		mode: 'policy-gated-preview' as const,
	};
}
