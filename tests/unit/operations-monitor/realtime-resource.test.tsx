import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mergeVersioned, useRealtimeResource } from '../../../src/react/operations-monitor/use-realtime-resource.ts';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('real-time resource coordinator', () => {
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
});
