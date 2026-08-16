import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendFormRequest } = vi.hoisted(() => ({ sendFormRequest: vi.fn() }));
vi.mock('../../../src/forms-client.ts', () => ({ sendFormRequest }));

import { discussionErrorMessage, initializeDiscussionPanels } from '../../../src/lib/discussion/panel.ts';

describe('Discussion validation feedback', () => {
	beforeEach(() => {
		delete document.documentElement.dataset.tsDiscussionBound;
		vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
		Element.prototype.scrollIntoView = vi.fn();
		document.body.innerHTML = `
			<aside data-ts-side-sheet><div data-ts-discussion data-endpoint="/v1/discussions" data-team-id="team-1" data-project-id="project-1">
				<script type="application/json" data-ts-discussion-context>{"identityLabel":"Adrian"}</script>
				<span data-ts-discussion-state>Ready</span><ol data-ts-discussion-timeline></ol>
				<form data-ts-discussion-composer><textarea name="body">Invalid content</textarea>
					<input type="radio" name="intent" value="discuss" checked><button type="submit">Send</button></form>
			</div></aside>`;
		sendFormRequest.mockImplementation(async ({ url }: { url: string }) => url === '/api/markdown/preview'
			? new Response(JSON.stringify({ ok: true, payload: { html: '<p>Rendered</p>' } }), { status: 200 })
			: new Response(JSON.stringify({ ok: false, error: 'Discussion content is invalid.', code: 'discussion_content_invalid',
				details: [{ field: 'title', message: 'Title is required.' }] }), { status: 422 }));
	});

	it('formats exact Zod fields as repair guidance', () => {
		expect(discussionErrorMessage({ error: 'Invalid content.', details: [{ field: 'activityProfiles.planning.handler', message: 'Invalid enum value.' }] }, 422))
			.toContain('**activityProfiles.planning.handler**: Invalid enum value.');
	});

	it('marks the optimistic message failed and renders the field error', async () => {
		initializeDiscussionPanels(document);
		document.querySelector<HTMLFormElement>('[data-ts-discussion-composer]')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
		await vi.waitFor(() => expect(document.querySelector('[data-ts-discussion-state]')?.textContent).toBe('Not committed'));
		const messages = [...document.querySelectorAll<HTMLElement>('.ts-discussion__message')];
		expect(messages[0]?.querySelector('header span')?.textContent).toBe('failed');
		expect(messages.at(-1)?.textContent).toContain('Platform');
		expect(sendFormRequest).toHaveBeenCalledWith(expect.objectContaining({ url: '/v1/discussions' }));
	});
});
