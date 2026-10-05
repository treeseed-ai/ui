import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureDocumentBounds, maskSensitiveClone } from '../../../src/lib/feedback/dom-capture.ts';
import { freezeCaptureLayout, materializeActiveOverlays, snapshotActiveOverlays } from '../../../src/lib/feedback/capture-overlays.ts';

describe('feedback DOM capture privacy', () => {
	afterEach(() => vi.restoreAllMocks());

	beforeEach(() => {
		document.body.innerHTML = `
			<nav><a href="/app">Start</a><a href="/app/services">Services</a></nav>
			<select aria-label="Active team"><option selected>Knowledge Coop</option></select>
			<input name="displayName" value="Private typed value" />
			<textarea>Private draft</textarea>
			<div contenteditable="true">Private editable draft</div>
			<section data-ts-feedback-redact="credential"><strong>Credential preview</strong></section>
		`;
	});

	it('preserves navigation and ordinary selectors while masking private values and boundaries', () => {
		const clone = document.body.cloneNode(true) as HTMLBodyElement;
		const masked = maskSensitiveClone(clone);

		expect(masked).toBe(4);
		expect([...clone.querySelectorAll('nav a')].map((link) => link.textContent)).toEqual(['Start', 'Services']);
		expect(clone.querySelector('select')?.textContent).toContain('Knowledge Coop');
		expect((clone.querySelector('input') as HTMLInputElement).value).toBe('••••••••');
		expect((clone.querySelector('textarea') as HTMLTextAreaElement).value).toBe('••••••••');
		expect(clone.querySelector('[contenteditable]')?.textContent).toBe('[private content redacted]');
		expect(clone.querySelector('[data-ts-feedback-redact]')?.textContent).toBe('[private content redacted]');
	});

	it('uses the full document scroll bounds rather than only the visible viewport', () => {
		Object.defineProperty(document.documentElement, 'scrollWidth', { configurable: true, value: 1440 });
		Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 4200 });
		Object.defineProperty(document.body, 'scrollWidth', { configurable: true, value: 1200 });
		Object.defineProperty(document.body, 'scrollHeight', { configurable: true, value: 3900 });
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });

		expect(captureDocumentBounds()).toEqual({ width: 1440, height: 4200 });
	});

	it('stops at the visible page edge when the desktop feedback panel is docked', () => {
		document.body.innerHTML = `
			<div data-ts-shell-workspace>
				<main class="ts-shell-workspace__content">Page content</main>
				<aside data-ts-feedback-panel data-ts-feedback-presentation="docked">Feedback</aside>
			</div>
		`;
		const content = document.querySelector<HTMLElement>('.ts-shell-workspace__content')!;
		vi.spyOn(content, 'getBoundingClientRect').mockReturnValue({ width: 1080, height: 2100, left: 0, right: 1080, top: 0, bottom: 2100, x: 0, y: 0, toJSON: () => ({}) });
		Object.defineProperty(content, 'scrollHeight', { configurable: true, value: 2100 });
		Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 4200 });
		Object.defineProperty(document.body, 'scrollHeight', { configurable: true, value: 3900 });

		expect(captureDocumentBounds()).toEqual({ width: 1080, height: 4200 });
	});

	it('materializes an active help dialog while excluding the feedback panel', () => {
		document.body.innerHTML = `
			<dialog open data-ts-help-dialog="shell-help">
				<h1>TreeSeed Help</h1>
				<aside data-ts-feedback-panel>Feedback form</aside>
			</dialog>
		`;
		const dialog = document.querySelector<HTMLDialogElement>('dialog')!;
		vi.spyOn(window, 'getComputedStyle').mockReturnValue({ backgroundColor: 'rgba(15, 23, 42, 0.52)', backdropFilter: 'none' } as CSSStyleDeclaration);
		vi.spyOn(dialog, 'matches').mockImplementation((selector) => selector === ':modal' || Element.prototype.matches.call(dialog, selector));
		vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ width: 900, height: 640, left: 90, right: 990, top: 70, bottom: 710, x: 90, y: 70, toJSON: () => ({}) });
		const active = snapshotActiveOverlays();
		const clone = document.documentElement.cloneNode(true) as HTMLElement;
		active.clear();
		for (const panel of clone.querySelectorAll('[data-ts-feedback-panel]')) panel.remove();
		freezeCaptureLayout(clone, { width: 1200, height: 2600 }, false);
		const count = materializeActiveOverlays(clone, active.snapshots, { width: 1200, height: 2600 });

		expect(count).toBe(1);
		expect(clone.querySelector('[data-ts-feedback-captured-overlay="dialog"]')?.textContent).toContain('TreeSeed Help');
		expect((clone.querySelector('[data-ts-feedback-captured-overlay="dialog"] h1') as HTMLElement).style.animation).toBe('none');
		expect(clone.querySelector('[data-ts-feedback-capture-backdrop]')).not.toBeNull();
		expect(clone.querySelector('[data-ts-feedback-panel]')).toBeNull();
	});
});
