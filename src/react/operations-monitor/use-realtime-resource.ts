import { useCallback, useEffect, useRef, useState } from 'react';

export type RealtimeStatus = 'snapshot' | 'connecting' | 'live' | 'degraded' | 'offline';

export async function requestRealtimeResource(url: string, signal: AbortSignal, etag: string | null) {
	return await fetch(url, { headers: { accept: 'application/json', ...(etag ? { 'if-none-match': etag } : {}) }, signal });
}

function replaceRealtimeData<T>(_current: T, next: T) { return next; }

export function mergeVersioned<T extends { id: string; stateVersion?: number }>(current: T[], upserts: T[], removedIds: string[]) {
	const removed = new Set(removedIds); const values = new Map(current.filter((item) => !removed.has(item.id)).map((item) => [item.id, item]));
	for (const item of upserts) {
		const existing = values.get(item.id);
		if (!existing || Number(item.stateVersion ?? 0) >= Number(existing.stateVersion ?? 0)) values.set(item.id, item);
	}
	return [...values.values()];
}

export function useRealtimeResource<T>({
	initialData, endpoint, intervalMs, enabled, parse, merge = replaceRealtimeData, request = requestRealtimeResource,
}: {
	initialData: T; endpoint: (cursor: string | null) => string; intervalMs: number; enabled: boolean;
	parse: (payload: unknown) => { data: T; cursor?: string | null; removedIds?: string[] };
	merge?: (current: T, next: T, removedIds: string[]) => T;
	request?: (url: string, signal: AbortSignal, etag: string | null) => Promise<Response>;
}) {
	const [data, setData] = useState(initialData); const [status, setStatus] = useState<RealtimeStatus>(enabled ? 'connecting' : 'snapshot');
	const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null); const [error, setError] = useState<string | null>(null); const [refreshCount, setRefreshCount] = useState(0);
	const cursor = useRef<string | null>(null); const etag = useRef<string | null>(null); const generation = useRef(0);
	const timer = useRef<number | null>(null); const controller = useRef<AbortController | null>(null); const failures = useRef(0);
	const [refreshVersion, setRefreshVersion] = useState(0);

	const reconnect = useCallback(() => { failures.current = 0; etag.current = null; setRefreshVersion((value) => value + 1); }, []);
	const replaceData = useCallback((next: T) => setData(next), []);

	useEffect(() => {
		const activeGeneration = ++generation.current; let disposed = false;
		const clear = () => { if (timer.current !== null) window.clearTimeout(timer.current); timer.current = null; controller.current?.abort(); };
		if (!enabled) { clear(); setStatus('snapshot'); setError(null); return clear; }
		cursor.current = null; etag.current = null;
		const schedule = (delay: number) => { if (!disposed) timer.current = window.setTimeout(refresh, delay); };
		const refresh = async () => {
			if (disposed || activeGeneration !== generation.current) return;
			if (document.hidden || !navigator.onLine) { setStatus(navigator.onLine ? 'connecting' : 'offline'); schedule(intervalMs); return; }
			controller.current?.abort(); const requestController = new AbortController(); controller.current = requestController;
			setStatus((current) => failures.current ? 'degraded' : current === 'live' ? 'live' : 'connecting');
			try {
				const response = await request(endpoint(cursor.current), requestController.signal, etag.current);
				if (response.status !== 304 && !response.ok) throw new Error(`Live refresh failed (${response.status}).`);
				if (response.status !== 304) {
					const envelope = await response.json(); const result = parse(envelope?.payload ?? envelope);
					if (disposed || requestController.signal.aborted || activeGeneration !== generation.current) return;
					setData((current) => merge(current, result.data, result.removedIds ?? [])); cursor.current = result.cursor ?? cursor.current;
					etag.current = response.headers.get('etag');
				}
				failures.current = 0; setStatus('live'); setError(null); setLastUpdatedAt(Date.now()); setRefreshCount((value) => value + 1); schedule(intervalMs);
			} catch (caught) {
				if (requestController.signal.aborted || disposed) return;
				failures.current += 1; setStatus(navigator.onLine ? 'degraded' : 'offline'); setError(caught instanceof Error ? caught.message : 'Live refresh failed.');
				const backoff = Math.min(60_000, intervalMs * 2 ** Math.min(failures.current, 5)); schedule(Math.round(backoff * (.85 + Math.random() * .3)));
			}
		};
		const resume = () => { if (document.hidden || !navigator.onLine) return; if (timer.current !== null) window.clearTimeout(timer.current); void refresh(); };
		const visibility = () => { if (document.hidden) clear(); else resume(); };
		const offline = () => { clear(); setStatus('offline'); };
		document.addEventListener('visibilitychange', visibility); window.addEventListener('online', resume); window.addEventListener('offline', offline);
		void refresh();
		return () => { disposed = true; clear(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('online', resume); window.removeEventListener('offline', offline); };
	}, [enabled, endpoint, intervalMs, merge, parse, refreshVersion, request]);

	useEffect(() => {
		if (!enabled) return;
		let debounce: number | null = null;
		const invalidate = (event: Event) => {
			const detail = event instanceof CustomEvent ? event.detail as Record<string, unknown> : {};
			if (detail.eventType !== 'resource.invalidated') return;
			const payload = detail.payload && typeof detail.payload === 'object' ? detail.payload as Record<string, unknown> : {};
			const endpoints = Array.isArray(payload.endpoints) ? payload.endpoints.map(String) : [];
			if (!endpoints.some((prefix) => endpoint(cursor.current).includes(prefix))) return;
			if (debounce !== null) window.clearTimeout(debounce);
			debounce = window.setTimeout(reconnect, 100);
		};
		document.addEventListener('treeseed:session-event', invalidate);
		return () => { document.removeEventListener('treeseed:session-event', invalidate); if (debounce !== null) window.clearTimeout(debounce); };
	}, [enabled, endpoint, reconnect]);

	return { data, status, lastUpdatedAt, refreshCount, error, reconnect, replaceData };
}
