import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mergeVersioned, useRealtimeResource } from '../../../src/react/operations-monitor/use-realtime-resource.ts';
import { scopedActivityEndpoint } from '../../../src/react/operations-monitor/OperationsMonitorHeader.tsx';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('real-time resource coordinator', () => {
	it('includes the selected team, date, and workday in activity refresh requests', () => {
		expect(scopedActivityEndpoint('/activity?mode=full', 'team a', '2026-08-04', 'workday/one', 'cursor value')).toBe('/activity?mode=full&teamId=team+a&date=2026-08-04&workDayId=workday%2Fone&cursor=cursor+value');
		expect(scopedActivityEndpoint('/activity?workDayId=stale', 'team-b', '2026-08-05', null, null)).toBe('/activity?teamId=team-b&date=2026-08-05');
	});

	it('immutably merges newer records and applies removals', () => {
		const current = [{ id: 'a', stateVersion: 2, value: 'current' }, { id: 'b', stateVersion: 1, value: 'remove' }];
		expect(mergeVersioned(current, [{ id: 'a', stateVersion: 1, value: 'stale' }, { id: 'c', stateVersion: 1, value: 'new' }], ['b']))
			.toEqual([{ id: 'a', stateVersion: 2, value: 'current' }, { id: 'c', stateVersion: 1, value: 'new' }]);
		expect(current).toHaveLength(2);
	});

	it('never overlaps requests and preserves the server snapshot while a request is pending', async () => {
		vi.useFakeTimers(); let resolve!: (value: Response) => void;
		const fetch = vi.fn(() => new Promise<Response>((done) => { resolve = done; })); vi.stubGlobal('fetch', fetch);
		const endpoint = () => '/live'; const parse = (value: unknown) => ({ data: value as number });
		const { result } = renderHook(() => useRealtimeResource({ initialData: 7, endpoint, intervalMs: 2_000, enabled: true, parse }));
		await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
		expect(fetch).toHaveBeenCalledTimes(1); expect(result.current.data).toBe(7);
		await act(async () => { resolve(Response.json(8, { headers: { etag: '"next"' } })); await Promise.resolve(); });
		expect(result.current.data).toBe(8);
		await act(async () => { await vi.advanceTimersByTimeAsync(1_999); }); expect(fetch).toHaveBeenCalledTimes(1);
		await act(async () => { await vi.advanceTimersByTimeAsync(1); }); expect(fetch).toHaveBeenCalledTimes(2);
	});

	it('replaces stale rows with a successful complete empty snapshot', async () => {
		vi.useFakeTimers();
		const request = vi.fn().mockRejectedValueOnce(new Error('unavailable')).mockResolvedValueOnce(Response.json({ complete: true, upserts: [], removedIds: [], cursor: 'next' }));
		const parse = (value: unknown) => {
			const payload = value as { complete?: boolean; upserts: number[]; removedIds: string[]; cursor: string };
			return { data: payload.upserts, removedIds: payload.removedIds, cursor: payload.cursor, replace: payload.complete === true };
		};
		const { result } = renderHook(() => useRealtimeResource({ initialData: [1], endpoint: () => '/activity', intervalMs: 60_000, enabled: true, parse, merge: (current, next, removed) => [...current.filter((item) => !removed.includes(String(item))), ...next], request }));
		await act(async () => { await vi.advanceTimersByTimeAsync(0); });
		expect(result.current.data).toEqual([1]);
		expect(result.current.status).toBe('degraded');
		expect(result.current.error).toBe('unavailable');
		act(() => result.current.reconnect());
		await act(async () => { await vi.advanceTimersByTimeAsync(0); });
		expect(result.current.data).toEqual([]);
		expect(result.current.status).toBe('live');
		expect(result.current.error).toBeNull();
	});

	it('clears rows on scope changes and ignores a late response from the previous scope', async () => {
		vi.useFakeTimers(); let resolveOld!: (response: Response) => void;
		const request = vi.fn((url: string) => url.includes('team-a') ? new Promise<Response>((resolve) => { resolveOld = resolve; }) : Promise.resolve(Response.json({ data: ['new'] })));
		const parse = (value: unknown) => ({ data: (value as { data: string[] }).data });
		const { result, rerender } = renderHook(({ scope }) => useRealtimeResource({ initialData: ['old-frame'], scopeInitialData: [], scopeKey: scope, endpoint: () => `/activity?${scope}`, intervalMs: 60_000, enabled: true, parse, request }), { initialProps: { scope: 'team-a' } });
		await act(async () => { await vi.advanceTimersByTimeAsync(0); });
		rerender({ scope: 'team-b' });
		expect(result.current.data).toEqual([]);
		expect(result.current.status).toBe('connecting');
		await act(async () => { await vi.advanceTimersByTimeAsync(0); });
		expect(result.current.data).toEqual(['new']);
		await act(async () => { resolveOld(Response.json({ data: ['stale'] })); await Promise.resolve(); });
		expect(result.current.data).toEqual(['new']);
	});

	it('preserves delta upserts and removedIds behavior', async () => {
		vi.useFakeTimers();
		const request = vi.fn(async () => Response.json({ upserts: [{ id: '3', stateVersion: 1 }], removedIds: ['2'] }));
		const { result } = renderHook(() => useRealtimeResource({ initialData: [{ id: '1', stateVersion: 1 }, { id: '2', stateVersion: 1 }], endpoint: () => '/activity', intervalMs: 60_000, enabled: true, parse: (value) => { const payload = value as { upserts: Array<{ id: string; stateVersion: number }>; removedIds: string[] }; return { data: payload.upserts, removedIds: payload.removedIds }; }, merge: mergeVersioned, request }));
		await act(async () => { await vi.advanceTimersByTimeAsync(0); });
		expect(result.current.data).toEqual([{ id: '1', stateVersion: 1 }, { id: '3', stateVersion: 1 }]);
	});

	it('debounces matching session invalidations into an island-owned refresh', async () => {
		vi.useFakeTimers();
		const request = vi.fn(async () => Response.json({ value: 8 }));
		const endpoint = () => '/v1/teams/team-a/agent-lab/overview';
		const parse = (value: unknown) => ({ data: value as { value: number } });
		renderHook(() => useRealtimeResource({ initialData: { value: 7 }, endpoint, intervalMs: 60_000, enabled: true, parse, request }));
		await act(async () => { await vi.advanceTimersByTimeAsync(0); });
		document.dispatchEvent(new CustomEvent('treeseed:session-event', { detail: { eventType: 'resource.invalidated', payload: { endpoints: ['/v1/teams/team-a/agent-lab'] } } }));
		document.dispatchEvent(new CustomEvent('treeseed:session-event', { detail: { eventType: 'resource.invalidated', payload: { endpoints: ['/v1/teams/team-a/agent-lab'] } } }));
		await act(async () => { await vi.advanceTimersByTimeAsync(100); });
		expect(request).toHaveBeenCalledTimes(2);
	});
});
