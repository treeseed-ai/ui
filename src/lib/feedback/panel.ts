import type { FeedbackContext, FeedbackSubmission, FeedbackSubmissionType } from '../foundation/contracts.ts';
import { formActionUrl, registerFormAdapter, setFieldError } from '../../forms-client.ts';

const initialized = new WeakSet<Document>();
const screenshotByForm = new WeakMap<HTMLFormElement, FeedbackSubmission['screenshot']>();
const contextPatchByPanel = new WeakMap<HTMLElement, Partial<FeedbackContext>>();
const openerByPanel = new WeakMap<HTMLElement, HTMLElement>();
const idempotencyByForm = new WeakMap<HTMLFormElement, string>();
const homeByPanel = new WeakMap<HTMLElement, { parent: Node; nextSibling: Node | null }>();
const desktopDock = '(min-width: 64rem)';

function csrfToken() {
	return document.cookie.split('; ').find((entry) => entry.startsWith('ts_csrf='))?.split('=').slice(1).join('=') ?? '';
}

function contextFor(form: HTMLFormElement): FeedbackContext {
	const source = form.querySelector<HTMLScriptElement>('[data-ts-feedback-context]')?.textContent;
	if (!source) throw new Error('Feedback context is missing.');
	const context = JSON.parse(source) as FeedbackContext;
	const panel = form.closest<HTMLElement>('[data-ts-feedback-panel]');
	return panel ? { ...context, ...contextPatchByPanel.get(panel) } : context;
}

function clientContext() {
	return { userAgent: navigator.userAgent, viewport: { width: innerWidth, height: innerHeight, devicePixelRatio: devicePixelRatio || 1 }, locale: navigator.language, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, theme: document.documentElement.dataset.theme ?? document.documentElement.dataset.colorScheme, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches };
}

function setStatus(form: HTMLFormElement, message: string, tone: 'neutral' | 'danger' | 'success' = 'neutral') {
	const status = form.querySelector<HTMLElement>('[data-ts-feedback-status]');
	if (status) { status.textContent = message; status.dataset.tone = tone; }
}

function presentPanel(panel: HTMLElement) {
	const docked = matchMedia(desktopDock).matches && !homeByPanel.has(panel);
	panel.dataset.tsFeedbackPresentation = docked ? 'docked' : 'overlay';
	if (docked) {
		if (typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) panel.hidePopover();
		panel.removeAttribute('popover');
		return;
	}
	panel.setAttribute('popover', 'manual');
	if (typeof panel.showPopover === 'function' && !panel.matches(':popover-open')) panel.showPopover();
}

function openPanel(panel: HTMLElement, opener: HTMLElement) {
	openerByPanel.set(panel, opener);
	const openDialog = opener.closest<HTMLDialogElement>('dialog[open]');
	if (openDialog && !openDialog.contains(panel) && panel.parentNode) {
		homeByPanel.set(panel, { parent: panel.parentNode, nextSibling: panel.nextSibling });
		openDialog.append(panel);
	}
	panel.hidden = false;
	presentPanel(panel);
	panel.querySelector<HTMLElement>('select, textarea, button')?.focus();
}

function closePanel(panel: HTMLElement) {
	if (typeof panel.hidePopover === 'function' && panel.matches(':popover-open')) panel.hidePopover();
	panel.hidden = true;
	const opener = openerByPanel.get(panel);
	const home = homeByPanel.get(panel);
	if (home) {
		home.parent.insertBefore(panel, home.nextSibling);
		homeByPanel.delete(panel);
	}
	panel.setAttribute('popover', 'manual');
	delete panel.dataset.tsFeedbackPresentation;
	opener?.focus();
}

function applyOpenerContext(panel: HTMLElement, opener: HTMLElement) {
	try { contextPatchByPanel.set(panel, JSON.parse(opener.dataset.tsFeedbackContextPatch ?? '{}')); } catch { contextPatchByPanel.delete(panel); }
	const type = opener.dataset.tsFeedbackType;
	const select = panel.querySelector<HTMLSelectElement>('select[name="type"]');
	if (type && select && [...select.options].some((option) => option.value === type)) select.value = type;
}

async function captureScreenshot(form: HTMLFormElement) {
	setStatus(form, 'Preparing a redacted preview…');
	const capture = await (await import('./dom-capture.ts')).captureRedactedDomScreenshot();
	screenshotByForm.set(form, capture);
	const preview = form.querySelector<HTMLImageElement>('[data-ts-feedback-preview]');
	if (preview) preview.src = capture.dataUrl;
	const previewOpen = form.querySelector<HTMLButtonElement>('[data-ts-feedback-preview-open]');
	if (previewOpen) previewOpen.hidden = false;
	const expanded = form.querySelector<HTMLImageElement>('[data-ts-image-lightbox-image]');
	if (expanded) expanded.src = capture.dataUrl;
	const remove = form.querySelector<HTMLButtonElement>('[data-ts-feedback-remove]');
	if (remove) remove.hidden = false;
	const button = form.querySelector<HTMLButtonElement>('[data-ts-feedback-capture]');
	if (button) button.textContent = 'Replace screenshot';
	setStatus(form, `Preview ready. ${capture.maskedRegionCount} private region${capture.maskedRegionCount === 1 ? '' : 's'} masked.`, 'success');
}

function removeScreenshot(form: HTMLFormElement, announce = true) {
	screenshotByForm.delete(form);
	const preview = form.querySelector<HTMLImageElement>('[data-ts-feedback-preview]');
	if (preview) preview.removeAttribute('src');
	const previewOpen = form.querySelector<HTMLButtonElement>('[data-ts-feedback-preview-open]');
	if (previewOpen) previewOpen.hidden = true;
	const expanded = form.querySelector<HTMLImageElement>('[data-ts-image-lightbox-image]');
	if (expanded) expanded.removeAttribute('src');
	const remove = form.querySelector<HTMLButtonElement>('[data-ts-feedback-remove]');
	if (remove) remove.hidden = true;
	const button = form.querySelector<HTMLButtonElement>('[data-ts-feedback-capture]');
	if (button) button.textContent = 'Capture screenshot';
	if (announce) setStatus(form, 'Screenshot removed.');
}

function payload(form: HTMLFormElement): FeedbackSubmission {
	const data = new FormData(form);
	const message = String(data.get('message') ?? '').trim();
	if (!message) {
		const control = form.elements.namedItem('message');
		if (control instanceof HTMLTextAreaElement) { setFieldError(control, 'Tell us what happened or what could be better.'); control.focus(); }
		throw new Error('Please correct the highlighted field.');
	}
	return { type: String(data.get('type') ?? 'bug') as FeedbackSubmissionType, message, allowContact: data.get('allowContact') === 'true', context: { ...contextFor(form), canonicalPath: `${location.pathname}${location.search}` }, client: clientContext(), screenshot: screenshotByForm.get(form) };
}

registerFormAdapter('feedback', {
	buildRequest({ form }) {
		let idempotencyKey = idempotencyByForm.get(form);
		if (!idempotencyKey) { idempotencyKey = crypto.randomUUID(); idempotencyByForm.set(form, idempotencyKey); }
		return { url: formActionUrl(form), init: { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json', 'x-treeseed-form': 'enhanced', 'x-idempotency-key': idempotencyKey, 'x-treeseed-csrf': csrfToken() }, body: JSON.stringify(payload(form)), credentials: 'same-origin' } };
	},
	async parseResponse(response) {
		const result = await response.json().catch(() => ({}));
		return { ok: response.ok && result.ok !== false, code: String(result.code ?? `http_${response.status}`), message: String(result.message ?? result.error ?? 'Feedback could not be sent.'), fieldErrors: result.fieldErrors, payload: result.payload, reset: result.reset };
	},
	afterSuccess(_result, { form }) {
		removeScreenshot(form, false); idempotencyByForm.delete(form);
		const panel = form.closest<HTMLElement>('[data-ts-feedback-panel]');
		if (panel) closePanel(panel);
	},
});

export function initializeFeedbackPanels(root: Document = document) {
	if (initialized.has(root)) return; initialized.add(root);
	matchMedia(desktopDock).addEventListener('change', () => {
		for (const panel of root.querySelectorAll<HTMLElement>('[data-ts-feedback-panel]:not([hidden])')) presentPanel(panel);
	});
	root.addEventListener('click', (event) => {
		const target = event.target instanceof Element ? event.target : null; if (!target) return;
		const opener = target.closest<HTMLElement>('[data-ts-feedback-open]');
		if (opener) { const id = opener.dataset.tsFeedbackOpen; const panel = id ? root.getElementById(id) : null; if (panel) { applyOpenerContext(panel, opener); openPanel(panel, opener); } return; }
		const panel = target.closest<HTMLElement>('[data-ts-feedback-panel]');
		if (panel && target.closest('[data-ts-feedback-close]')) { closePanel(panel); return; }
		const form = target.closest<HTMLFormElement>('[data-ts-feedback-form]'); if (!form) return;
		if (target.closest('[data-ts-feedback-capture]')) void captureScreenshot(form).catch((caught) => setStatus(form, caught instanceof Error ? caught.message : 'Screenshot capture failed.', 'danger'));
		if (target.closest('[data-ts-feedback-remove]')) removeScreenshot(form);
	});
	root.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !(event.target instanceof Element && event.target.closest('dialog[open]'))) { const panel = root.querySelector<HTMLElement>('[data-ts-feedback-panel]:popover-open, [data-ts-feedback-panel]:not([hidden])'); if (panel) { event.stopPropagation(); closePanel(panel); } } });
}
