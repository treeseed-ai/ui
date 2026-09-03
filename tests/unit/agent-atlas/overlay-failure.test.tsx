import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AtlasOverlay } from '../../../src/react/agent-atlas/AtlasOverlay.tsx';

const endpoints = { projection: '/projection', delta: '/delta', stream: '/stream', detail: '/detail', assignmentGraphs: '/graphs' };

describe('Atlas inner-surface failure recovery', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('keeps the selected overlay open and retries a failed canonical detail request', async () => {
		const fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 503 }).mockResolvedValueOnce({ ok: true, json: async () => ({ payload: { title: 'Recovered agent', status: 'active', data: {} } }) });
		vi.stubGlobal('fetch', fetch);
		render(<AtlasOverlay selection={{ kind: 'agent', id: 'agent-a' }} endpoints={endpoints} observedAt="2026-09-02T12:00:00Z" onClose={vi.fn()} onDiscuss={vi.fn()} onInspect={vi.fn()} interfaceMode="easy" top depth={0} />);
		expect(await screen.findByRole('alert')).toHaveTextContent('selection remains open');
		fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
		expect(await screen.findByRole('heading', { name: 'Recovered agent' })).toBeInTheDocument();
		await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
	});

	it('announces loading without hiding the close control', () => {
		vi.stubGlobal('fetch', vi.fn(() => new Promise(() => undefined)));
		render(<AtlasOverlay selection={{ kind: 'project', id: 'project-a' }} endpoints={endpoints} observedAt="2026-09-02T12:00:00Z" onClose={vi.fn()} onDiscuss={vi.fn()} onInspect={vi.fn()} interfaceMode="easy" top depth={0} />);
		expect(screen.getByRole('status')).toHaveTextContent('Loading canonical detail');
		expect(screen.getByRole('button', { name: 'Close detail' })).toBeEnabled();
	});
});
