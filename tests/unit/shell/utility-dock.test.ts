import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dismissUtilityApplication, initializeUtilityDock, presentUtilityApplication, rememberUtilityApplicationOpener, resolveUtilityDockPlacement } from '../../../src/lib/shell/utility-dock.ts';
import { setUtilityApplicationState, utilityApplicationMessage } from '../../../src/lib/shell/utility-state.ts';

describe('utility application dock', () => {
	beforeEach(() => {
		vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn() })));
		localStorage.clear();
		document.body.innerHTML = '<button id="launcher">Open</button><div class="ts-shell-workspace"><main class="ts-shell-workspace__content"></main><aside id="feedback" data-ts-utility-application="feedback" hidden></aside><aside id="chat" data-ts-utility-application="chat" hidden></aside></div>';
	});

	it('uses a bottom dock at narrow widths and switches one utility at a time', () => {
		const feedback = document.querySelector<HTMLElement>('#feedback')!;
		const chat = document.querySelector<HTMLElement>('#chat')!;
		expect(resolveUtilityDockPlacement()).toBe('dock-bottom');
		presentUtilityApplication(feedback, 'feedback');
		expect(feedback.hidden).toBe(false);
		expect(feedback.dataset.tsUtilityPlacement).toBe('dock-bottom');
		presentUtilityApplication(chat, 'chat');
		expect(feedback.hidden).toBe(true);
		expect(chat.hidden).toBe(false);
	});

	it('restores the launcher focus when the dock closes', () => {
		const launcher = document.querySelector<HTMLButtonElement>('#launcher')!;
		const chat = document.querySelector<HTMLElement>('#chat')!;
		rememberUtilityApplicationOpener(chat, launcher);
		presentUtilityApplication(chat, 'chat');
		dismissUtilityApplication(chat);
		expect(document.activeElement).toBe(launcher);
	});

	it('restores the open utility application and its page focus target', () => {
		const launcher = document.querySelector<HTMLButtonElement>('#launcher')!;
		const chat = document.querySelector<HTMLElement>('#chat')!;
		rememberUtilityApplicationOpener(chat, launcher);
		presentUtilityApplication(chat, 'chat');
		chat.hidden = true;

		initializeUtilityDock(document);

		expect(chat.hidden).toBe(false);
		expect(chat.dataset.tsUtilityPlacement).toBe('dock-bottom');
		dismissUtilityApplication(chat);
		expect(document.activeElement).toBe(launcher);
	});

	it.each(['ready', 'loading', 'reconnecting', 'empty', 'stale', 'denied', 'failed', 'offline'] as const)('announces the %s utility state consistently', (state) => {
		document.body.innerHTML = '<aside><p data-ts-utility-state></p></aside>';
		setUtilityApplicationState(document, state);
		const status = document.querySelector<HTMLElement>('[data-ts-utility-state]')!;
		expect(status.dataset.state).toBe(state);
		expect(status.textContent).toBe(utilityApplicationMessage(state));
		expect(status.getAttribute('role')).toBe(['failed', 'denied', 'offline'].includes(state) ? 'alert' : 'status');
	});
});
