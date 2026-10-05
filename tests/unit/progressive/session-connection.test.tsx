import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionConnectionIsland } from '../../../src/react/progressive/SessionConnectionIsland.tsx';

class FakeEventSource extends EventTarget {
	static instances: FakeEventSource[] = [];
	onopen: (() => void) | null = null;
	onerror: (() => void) | null = null;
	constructor(readonly url: string) { super(); FakeEventSource.instances.push(this); }
	close = vi.fn();
}

describe('SessionConnectionIsland', () => {
	afterEach(() => { FakeEventSource.instances = []; sessionStorage.clear(); vi.unstubAllGlobals(); });

	it('keeps one resumable team stream and dispatches typed invalidations', () => {
		vi.stubGlobal('EventSource', FakeEventSource);
		const received = vi.fn(); document.addEventListener('treeseed:session-event', received);
		render(<SessionConnectionIsland teamId="team-a" endpoint="/v1/session/events" />);
		const source = FakeEventSource.instances[0]!;
		expect(String(source.url)).toContain('teamId=team-a');
		act(() => source.dispatchEvent(new MessageEvent('discussion.updated', { data: JSON.stringify({ resourceId: 'discussion-a' }), lastEventId: '42' })));
		expect(sessionStorage.getItem('treeseed.session-events.team-a')).toBe('42');
		expect(received).toHaveBeenCalledOnce();
		document.removeEventListener('treeseed:session-event', received);
	});
});
