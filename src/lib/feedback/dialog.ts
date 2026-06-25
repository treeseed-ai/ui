import type { FeedbackContext, FeedbackSubmission, FeedbackSubmissionType } from '../foundation/contracts.ts';

const initialized = new WeakSet<Document>();
const screenshotByForm = new WeakMap<HTMLFormElement, FeedbackSubmission['screenshot']>();
const contextPatchByDialog = new WeakMap<HTMLElement, Partial<FeedbackContext>>();

function contextFor(form: HTMLFormElement): FeedbackContext {
	const script = form.querySelector<HTMLScriptElement>('[data-ts-feedback-context]');
	if (!script?.textContent) throw new Error('Feedback context is missing.');
	const context = JSON.parse(script.textContent) as FeedbackContext;
	const dialog = form.closest<HTMLElement>('[data-ts-feedback-dialog]');
	const patch = dialog ? contextPatchByDialog.get(dialog) : undefined;
	return patch ? { ...context, ...patch } : context;
}

function clientContext() {
	const viewport = {
		width: window.innerWidth,
		height: window.innerHeight,
		devicePixelRatio: window.devicePixelRatio || 1,
	};
	return {
		url: window.location.href,
		userAgent: navigator.userAgent,
		viewport,
		locale: navigator.language,
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		appearance: document.documentElement.dataset.theme ?? document.documentElement.dataset.colorScheme,
		reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
	};
}

function setStatus(form: HTMLFormElement, message: string, tone: 'neutral' | 'danger' | 'success' = 'neutral') {
	const status = form.querySelector<HTMLElement>('[data-ts-feedback-status]');
	if (!status) return;
	status.textContent = message;
	status.dataset.tone = tone;
}

function closeDialog(dialog: HTMLElement) {
	dialog.hidden = true;
	document.body.style.removeProperty('overflow');
}

function openDialog(dialog: HTMLElement) {
	dialog.hidden = false;
	document.body.style.overflow = 'hidden';
	const panel = dialog.querySelector<HTMLElement>('[role="dialog"]');
	panel?.focus();
}

function applyOpenerContext(dialog: HTMLElement, opener: HTMLElement) {
	const patchValue = opener.dataset.tsFeedbackContextPatch;
	if (patchValue) {
		try {
			contextPatchByDialog.set(dialog, JSON.parse(patchValue) as Partial<FeedbackContext>);
		} catch {
			contextPatchByDialog.delete(dialog);
		}
	} else {
		contextPatchByDialog.delete(dialog);
	}
	const type = opener.dataset.tsFeedbackType;
	if (!type) return;
	const select = dialog.querySelector<HTMLSelectElement>('select[name="type"]');
	if (select && [...select.options].some((option) => option.value === type)) select.value = type;
}

async function captureScreenshot(form: HTMLFormElement) {
	const preview = form.querySelector<HTMLImageElement>('[data-ts-feedback-preview]');
	const remove = form.querySelector<HTMLButtonElement>('[data-ts-feedback-remove]');
	const context = contextFor(form);
	setStatus(form, 'Preparing screenshot...', 'neutral');
	const { captureRedactedDomScreenshot } = await import('./dom-capture.ts');
	const capture = await captureRedactedDomScreenshot();
	const storagePolicy = context.attachmentStoragePolicy ?? (context.context === 'public' ? 'public' : 'private');
	const screenshot = {
		name: 'feedback-screenshot.png',
		type: capture.type,
		size: capture.size,
		dataUrl: capture.dataUrl,
		redacted: capture.redacted,
		storagePolicy,
	} satisfies FeedbackSubmission['screenshot'];
	screenshotByForm.set(form, screenshot);
	if (preview) {
		preview.src = capture.dataUrl;
		preview.hidden = false;
	}
	if (remove) remove.hidden = false;
	setStatus(form, 'Screenshot attached. Review it before sending.', 'success');
}

function removeScreenshot(form: HTMLFormElement, options: { announce?: boolean } = {}) {
	screenshotByForm.delete(form);
	const preview = form.querySelector<HTMLImageElement>('[data-ts-feedback-preview]');
	const remove = form.querySelector<HTMLButtonElement>('[data-ts-feedback-remove]');
	if (preview) {
		preview.removeAttribute('src');
		preview.hidden = true;
	}
	if (remove) remove.hidden = true;
	if (options.announce !== false) setStatus(form, 'Screenshot removed.', 'neutral');
}

async function submitFeedback(form: HTMLFormElement) {
	const context = contextFor(form);
	const endpoint = context.submissionEndpoint ?? '/api/feedback/submit';
	const data = new FormData(form);
	const message = String(data.get('message') ?? '').trim();
	if (!message) {
		setStatus(form, 'Add a few details before sending.', 'danger');
		return;
	}
	const payload: FeedbackSubmission = {
		type: String(data.get('type') ?? 'bug') as FeedbackSubmissionType,
		message,
		contactEmail: String(data.get('contactEmail') ?? '').trim() || undefined,
		context: {
			...context,
			url: context.url || window.location.href,
		},
		client: clientContext(),
		screenshot: screenshotByForm.get(form),
	};
	setStatus(form, 'Sending feedback...', 'neutral');
	const response = await fetch(endpoint, {
		method: 'POST',
		headers: { accept: 'application/json', 'content-type': 'application/json' },
		body: JSON.stringify(payload),
	});
	const envelope = await response.json().catch(() => null);
	if (!response.ok || envelope?.ok === false) {
		setStatus(form, envelope?.error ?? 'Feedback could not be sent.', 'danger');
		return;
	}
	setStatus(form, 'Feedback sent. Thank you.', 'success');
	form.reset();
	removeScreenshot(form, { announce: false });
	setTimeout(() => {
		const dialog = form.closest<HTMLElement>('[data-ts-feedback-dialog]');
		if (dialog) closeDialog(dialog);
	}, 750);
}

export function initializeFeedbackDialogs(root: Document = document) {
	if (initialized.has(root)) return;
	initialized.add(root);

	root.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const opener = target.closest<HTMLElement>('[data-ts-feedback-open]');
		if (opener) {
			const id = opener.dataset.tsFeedbackOpen;
			const dialog = id ? root.querySelector<HTMLElement>(`[data-ts-feedback-dialog="${CSS.escape(id)}"]`) : null;
			if (dialog) {
				applyOpenerContext(dialog, opener);
				openDialog(dialog);
			}
			return;
		}
		if (target.closest('[data-ts-feedback-close]')) {
			const dialog = target.closest<HTMLElement>('[data-ts-feedback-dialog]');
			if (dialog) closeDialog(dialog);
			return;
		}
		const capture = target.closest<HTMLButtonElement>('[data-ts-feedback-capture]');
		if (capture) {
			const form = capture.closest<HTMLFormElement>('form');
			if (form) void captureScreenshot(form).catch((error) => setStatus(form, error instanceof Error ? error.message : 'Screenshot capture failed.', 'danger'));
			return;
		}
		const remove = target.closest<HTMLButtonElement>('[data-ts-feedback-remove]');
		if (remove) {
			const form = remove.closest<HTMLFormElement>('form');
			if (form) removeScreenshot(form);
		}
	});

	root.addEventListener('submit', (event) => {
		const form = event.target;
		if (!(form instanceof HTMLFormElement) || !form.matches('[data-ts-feedback-form]')) return;
		event.preventDefault();
		void submitFeedback(form).catch((error) => setStatus(form, error instanceof Error ? error.message : 'Feedback could not be sent.', 'danger'));
	});

	root.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape') return;
		const openDialog = root.querySelector<HTMLElement>('[data-ts-feedback-dialog]:not([hidden])');
		if (openDialog) closeDialog(openDialog);
	});
}
