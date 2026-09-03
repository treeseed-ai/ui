import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeFeedbackPanels } from '../../../src/lib/feedback/panel.ts';

describe('feedback panel interaction', () => {
	let desktop: { matches: boolean; addEventListener: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		desktop = { matches: true, addEventListener: vi.fn() };
		vi.stubGlobal('matchMedia', vi.fn(() => desktop));
		document.body.innerHTML = `
			<button type="button" data-ts-feedback-open="feedback-panel" aria-label="Send feedback">
				<svg><path data-feedback-icon /></svg>
			</button>
			<aside id="feedback-panel" data-ts-feedback-panel popover="manual" hidden>
				<select><option>Bug</option></select>
			</aside>
		`;
	});

	it('opens when the SVG icon inside the launcher receives the click', () => {
		initializeFeedbackPanels(document);
		document.querySelector<SVGPathElement>('[data-feedback-icon]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		const panel = document.querySelector<HTMLElement>('#feedback-panel');
		expect(panel?.hidden).toBe(false);
		expect(panel?.dataset.tsFeedbackPresentation).toBe('docked');
		expect(panel?.hasAttribute('popover')).toBe(false);

		desktop.matches = false;
		desktop.addEventListener.mock.calls[0]?.[1]();
		expect(panel?.dataset.tsFeedbackPresentation).toBe('bottom');
		expect(panel?.hasAttribute('popover')).toBe(false);
	});
});
