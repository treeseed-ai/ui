import { useEffect, useState } from 'react';

export interface SessionConnectionIslandProps {
	teamId: string;
	endpoint: string;
	enabled?: boolean;
}

function cursorKey(teamId: string) { return `treeseed.session-events.${teamId}`; }

export function SessionConnectionIsland({ teamId, endpoint, enabled = true }: SessionConnectionIslandProps) {
	const [status, setStatus] = useState(enabled ? 'connecting' : 'snapshot');

	useEffect(() => {
		if (!enabled || typeof EventSource === 'undefined') { setStatus('snapshot'); return; }
		let source: EventSource | null = null;
		let reconnectTimer: number | null = null;
		let failures = 0;
		let disposed = false;
		const connect = () => {
			if (disposed || !navigator.onLine) { setStatus('offline'); return; }
			const url = new URL(endpoint, location.origin);
			url.searchParams.set('teamId', teamId);
			const cursor = sessionStorage.getItem(cursorKey(teamId));
			if (cursor) url.searchParams.set('after', cursor);
			setStatus(failures ? 'degraded' : 'connecting');
			source = new EventSource(url, { withCredentials: true });
			source.onopen = () => { failures = 0; setStatus('live'); };
			source.onerror = () => {
				source?.close(); source = null; failures += 1;
				setStatus(navigator.onLine ? 'degraded' : 'offline');
				const delay = Math.min(30_000, 1_000 * 2 ** Math.min(failures, 5));
				reconnectTimer = window.setTimeout(connect, Math.round(delay * (.85 + Math.random() * .3)));
			};
			const receive = (event: MessageEvent) => {
				let detail: Record<string, unknown>;
				try { detail = JSON.parse(event.data); } catch { return; }
				if (event.lastEventId) sessionStorage.setItem(cursorKey(teamId), event.lastEventId);
				document.dispatchEvent(new CustomEvent('treeseed:session-event', { detail: { ...detail, eventType: event.type } }));
			};
			source.addEventListener('discussion.updated', receive);
			source.addEventListener('resource.invalidated', receive);
			source.addEventListener('notification.created', receive);
			source.addEventListener('session.ready', receive);
		};
		const online = () => { if (!source) connect(); };
		const offline = () => { source?.close(); source = null; setStatus('offline'); };
		window.addEventListener('online', online); window.addEventListener('offline', offline);
		connect();
		return () => {
			disposed = true; source?.close(); if (reconnectTimer !== null) clearTimeout(reconnectTimer);
			window.removeEventListener('online', online); window.removeEventListener('offline', offline);
		};
	}, [enabled, endpoint, teamId]);

	return <span hidden data-ts-session-connection={status} data-team-id={teamId} />;
}
