export type UtilityApplicationState = 'ready' | 'loading' | 'reconnecting' | 'empty' | 'stale' | 'denied' | 'failed' | 'offline';

const defaultMessages: Record<UtilityApplicationState, string> = {
	ready: 'Ready', loading: 'Loading…', reconnecting: 'Reconnecting…', empty: 'Nothing here yet.',
	stale: 'This view changed. Reload before continuing.', denied: 'You do not have permission to use this application.',
	failed: 'The application could not load. Retry when ready.', offline: 'Offline. Your unsent work remains available.',
};

export function utilityApplicationMessage(state: UtilityApplicationState, detail?: string) {
	return detail?.trim() || defaultMessages[state];
}

export function setUtilityApplicationState(root: ParentNode, state: UtilityApplicationState, detail?: string) {
	const target = root.querySelector<HTMLElement>('[data-ts-utility-state]');
	if (!target) return;
	target.dataset.state = state;
	target.textContent = utilityApplicationMessage(state, detail);
	target.setAttribute('role', ['failed', 'denied', 'offline'].includes(state) ? 'alert' : 'status');
	target.setAttribute('aria-live', ['failed', 'denied', 'offline'].includes(state) ? 'assertive' : 'polite');
}
