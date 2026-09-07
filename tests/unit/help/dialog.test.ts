import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeHelpDialogs } from '../../../src/lib/help/dialog.ts';

describe('published help transport', () => {
	beforeEach(() => {
		document.body.innerHTML = `<button data-ts-help-open="help" data-ts-help-knowledge-page-id="guide">Help</button>
		<dialog id="help" data-ts-help-dialog><script data-ts-help-client-config type="application/json">{"pageEndpoint":"/pages/{pageId}","searchEndpoint":"/search"}</script>
		<div data-ts-help-article></div><div data-ts-help-navigation-items></div>
		<input data-ts-help-search-input><div data-ts-help-search-results></div></dialog>`;
		HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
		initializeHelpDialogs();
	});
	afterEach(() => { vi.unstubAllGlobals(); document.body.innerHTML = ''; });
	it('renders the data envelope article and related pages', async () => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: {
			page: { id: 'guide', title: 'Published guide', summary: 'Real content', bodyHtml: '<p>Instructions</p>' },
			relatedPages: [{ id: 'related', title: 'Related guide' }],
		} }))));
		document.querySelector<HTMLButtonElement>('button')!.click();
		await vi.waitFor(() => expect(document.querySelector('[data-ts-help-article]')?.textContent).toContain('Instructions'));
		expect(document.querySelector('[data-ts-help-navigation-items]')?.textContent).toContain('Related guide');
	});
	it.each([200, 503])('handles search response status %s without hiding failures', async (status) => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(status === 200
			? { data: { results: [{ id: 'guide', title: 'Search result' }] } } : { detail: 'Unavailable' }), { status })));
		const input = document.querySelector<HTMLInputElement>('input')!;
		input.value = 'guide'; input.dispatchEvent(new Event('input', { bubbles: true }));
		await vi.waitFor(() => expect(document.querySelector('[data-ts-help-search-results]')?.textContent)
			.toContain(status === 200 ? 'Search result' : 'Search is temporarily unavailable.'));
	});
});
