import { useCallback } from 'react';
import { AgentActivityGantt } from './AgentActivityGantt.tsx';
import type { ActivityIntervalItem, DeltaPayload, RealtimePreference } from './types.ts';
import { mergeVersioned, useRealtimeResource } from './use-realtime-resource.ts';
import '../../styles/operations-monitor.css';

export function LiveAgentActivityGantt({ initial, endpoint, preference, active, start, end, timeZone }: {
	initial: DeltaPayload<ActivityIntervalItem>; endpoint: string; preference: RealtimePreference; active: boolean; start: string; end: string; timeZone: string;
}) {
	const resourceEndpoint = useCallback((cursor: string | null) => `${endpoint}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, [endpoint]);
	const parse = useCallback((payload: unknown) => { const delta = payload as DeltaPayload<ActivityIntervalItem>; return { data: delta.upserts, cursor: delta.cursor, removedIds: delta.removedIds }; }, []);
	const baseMs = preference.intervalSeconds * 1_000;
	const live = useRealtimeResource({ initialData: initial.upserts, endpoint: resourceEndpoint, intervalMs: active ? baseMs : Math.max(10_000, baseMs * 2), enabled: preference.enabled, parse, merge: mergeVersioned });
	return <div data-live-state={preference.enabled ? live.status : 'snapshot'}><AgentActivityGantt intervals={live.data} start={start} end={end} timeZone={timeZone} />{live.error ? <button type="button" onClick={live.reconnect}>Reconnect activity</button> : null}</div>;
}
