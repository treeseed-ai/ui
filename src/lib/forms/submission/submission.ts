import { applyFieldErrors, clearChangedField, validateForm } from './validation.js';
import { showToast } from './toast.js';
import type {
	FormRequest,
	FormSubmissionAdapter,
	FormSubmissionContext,
	FormSubmissionResponse,
} from './types.js';

const adapters = new Map<string, FormSubmissionAdapter>();
const pending = new WeakSet<HTMLFormElement>();
const initialized = new WeakSet<Document>();

function csrfToken(formData: FormData) {
	return String(formData.get('csrfToken') ?? '') || document.cookie
		.split('; ')
		.find((entry) => entry.startsWith('ts_csrf='))
		?.split('=')
		.slice(1)
		.join('=') || '';
}

function ensureRequestIds(form: HTMLFormElement) {
	for (const input of form.querySelectorAll<HTMLInputElement>('input[data-ts-request-id]')) {
		if (!input.value) input.value = crypto.randomUUID();
	}
}

function formDataWithSubmitter(form: HTMLFormElement, submitter: HTMLElement | null) {
	ensureRequestIds(form);
	const formData = new FormData(form);
	if (submitter instanceof HTMLButtonElement && submitter.name) formData.set(submitter.name, submitter.value);
	return formData;
}

export function formActionUrl(form: HTMLFormElement) {
	return form.getAttribute('action') || window.location.href;
}

function defaultRequest(context: FormSubmissionContext): FormRequest {
	const method = (context.form.method || 'POST').toUpperCase();
	const headers = new Headers({ accept: 'application/json', 'x-treeseed-form': 'enhanced' });
	const token = csrfToken(context.formData);
	if (token) headers.set('x-treeseed-csrf', token);
	return {
		url: formActionUrl(context.form),
		init: {
			method,
			headers,
			body: ['GET', 'HEAD'].includes(method) ? undefined : context.formData,
			credentials: 'same-origin',
		},
	};
}

function jsonRequest(context: FormSubmissionContext): FormRequest {
	const headers = new Headers({
		accept: 'application/json',
		'content-type': 'application/json',
		'x-treeseed-form': 'enhanced',
	});
	const token = csrfToken(context.formData);
	if (token) headers.set('x-treeseed-csrf', token);
	const body: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
	for (const [name, value] of context.formData.entries()) {
		const previous = body[name];
		body[name] = previous === undefined ? value : Array.isArray(previous) ? [...previous, value] : [previous, value];
	}
	return {
		url: formActionUrl(context.form),
		init: {
			method: (context.form.dataset.tsMethod || context.form.method || 'POST').toUpperCase(),
			headers,
			body: JSON.stringify(body),
			credentials: 'same-origin',
		},
	};
}

function normalized(payload: any, response: Response): FormSubmissionResponse {
	const source = payload?.payload && typeof payload.payload === 'object' && typeof payload.payload.ok === 'boolean'
		? payload.payload
		: payload;
	const ok = response.ok && source?.ok !== false;
	return {
		ok,
		code: String(source?.code ?? (ok ? 'success' : `http_${response.status}`)),
		message: String(source?.message ?? source?.error?.message ?? source?.error ?? (ok ? 'Saved.' : 'The request could not be completed.')),
		fieldErrors: source?.fieldErrors ?? source?.details?.fields,
		redirect: source?.redirect,
		payload: source?.payload ?? payload?.payload,
		reset: source?.reset,
		refreshTargets: source?.refreshTargets,
	};
}

async function defaultParse(response: Response) {
	const contentType = response.headers.get('content-type') ?? '';
	if (contentType.includes('application/json')) return normalized(await response.json().catch(() => null), response);
	if (response.redirected) {
		return { ok: true, code: 'redirect', message: 'Continuing…', redirect: response.url };
	}
	return {
		ok: response.ok,
		code: response.ok ? 'success' : `http_${response.status}`,
		message: response.ok ? 'Saved.' : 'The server returned an unexpected response.',
	} satisfies FormSubmissionResponse;
}

function setPending(form: HTMLFormElement, value: boolean) {
	form.toggleAttribute('aria-busy', value);
	for (const button of form.querySelectorAll<HTMLButtonElement>('button[type="submit"], input[type="submit"]')) {
		if (value) {
			button.dataset.tsWasDisabled = button.disabled ? 'true' : 'false';
			button.disabled = true;
		} else {
			button.disabled = button.dataset.tsWasDisabled === 'true';
			delete button.dataset.tsWasDisabled;
		}
	}
}

function safeRedirect(candidate: string) {
	const target = new URL(candidate, window.location.href);
	return target.origin === window.location.origin ? target.href : null;
}

function followRedirect(target: string) {
	const link = document.createElement('a');
	link.href = target;
	link.setAttribute('data-astro-reload', '');
	link.hidden = true;
	document.body.append(link);
	link.click();
	link.remove();
}

function preserveRefreshState(current: Element, replacement: Element) {
	if (current.getAttribute('role') === 'tabpanel' && replacement.getAttribute('role') === 'tabpanel') {
		(replacement as HTMLElement).hidden = (current as HTMLElement).hidden;
	}
}

async function replaceContentTargets(selectors: string[], activeId?: string, activeName?: string) {
	if (!selectors.length) return;
	const response = await fetch(window.location.href, {
		headers: { accept: 'text/html', 'x-treeseed-fragment': 'refresh' },
		credentials: 'same-origin',
	});
	if (!response.ok) return;
	const next = new DOMParser().parseFromString(await response.text(), 'text/html');
	let focusTarget: HTMLElement | null = null;
	for (const selector of selectors) {
		const current = document.querySelector(selector);
		const replacement = next.querySelector(selector);
		if (current && replacement) {
			preserveRefreshState(current, replacement);
			current.replaceWith(replacement);
			focusTarget ??= activeId
				? replacement.querySelector<HTMLElement>(`#${CSS.escape(activeId)}`)
				: activeName
					? replacement.querySelector<HTMLElement>(`[name="${CSS.escape(activeName)}"]`)
					: null;
		}
	}
	document.dispatchEvent(new CustomEvent('treeseed:content-updated', { detail: { selectors } }));
	focusTarget?.focus();
}

export function refreshContentTargets(selectors: string[]) {
	return replaceContentTargets([...new Set(selectors.map((value) => value.trim()).filter(Boolean))]);
}

async function replaceTargets(form: HTMLFormElement, result: FormSubmissionResponse) {
	const declared = (form.dataset.tsRefreshTarget ?? '').split(',').map((value) => value.trim()).filter(Boolean);
	const selectors = [...new Set([...(result.refreshTargets ?? []), ...declared])];
	const active = document.activeElement instanceof HTMLElement && form.contains(document.activeElement)
		? document.activeElement
		: null;
	await replaceContentTargets(selectors, active?.id, active?.getAttribute('name') ?? undefined);
}

export function registerFormAdapter(name: string, adapter: FormSubmissionAdapter) {
	adapters.set(name, adapter);
	return () => adapters.delete(name);
}

export function sendFormRequest(request: FormRequest) {
	return fetch(request.url, request.init);
}

export async function submitForm(form: HTMLFormElement, submitter: HTMLElement | null = null) {
	if (pending.has(form)) return null;
	if (!validateForm(form)) {
		showToast({ tone: 'error', message: 'Please correct the highlighted fields.' });
		return null;
	}
	const context: FormSubmissionContext = { form, submitter, formData: formDataWithSubmitter(form, submitter) };
	const adapter = adapters.get(form.dataset.tsFormAdapter ?? '');
	pending.add(form);
	setPending(form, true);
	form.dispatchEvent(new CustomEvent('treeseed:form-start', { bubbles: true, detail: context }));
	try {
		const request = await (adapter?.buildRequest?.(context) ?? (form.dataset.tsFormAdapter === 'json' ? jsonRequest(context) : defaultRequest(context)));
		const response = await sendFormRequest(request);
		const result = await (adapter?.parseResponse?.(response, context) ?? defaultParse(response));
		if (result.ok && form.dataset.tsSuccessMessage) result.message = form.dataset.tsSuccessMessage;
		if (!result.ok && form.dataset.tsErrorMessage && !result.message) result.message = form.dataset.tsErrorMessage;
		if (!result.ok) {
			applyFieldErrors(form, result.fieldErrors);
			showToast({ tone: 'error', message: result.message });
			form.dispatchEvent(new CustomEvent('treeseed:form-error', { bubbles: true, detail: result }));
			return result;
		}
		if (result.redirect) {
			const redirect = safeRedirect(result.redirect);
			if (!redirect) throw new Error('The server returned an unsafe redirect.');
			followRedirect(redirect);
			return result;
		}
		if (result.reset ?? form.dataset.tsResetOnSuccess === 'true') form.reset();
		showToast({ tone: 'success', message: result.message });
		await replaceTargets(form, result);
		await adapter?.afterSuccess?.(result, context);
		form.dispatchEvent(new CustomEvent('treeseed:form-success', { bubbles: true, detail: result }));
		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : 'The request could not be completed.';
		showToast({ tone: 'error', message });
		form.dispatchEvent(new CustomEvent('treeseed:form-error', { bubbles: true, detail: { ok: false, code: 'network_error', message } }));
		return { ok: false, code: 'network_error', message } satisfies FormSubmissionResponse;
	} finally {
		pending.delete(form);
		setPending(form, false);
	}
}

function enableEnhancedValidation(root: ParentNode) {
	for (const form of root.querySelectorAll<HTMLFormElement>('form[data-ts-submit="enhanced"]')) {
		form.noValidate = true;
		ensureRequestIds(form);
	}
}

export function initializeFormSubmissions(root: Document = document) {
	if (initialized.has(root)) return;
	initialized.add(root);
	enableEnhancedValidation(root);
	root.addEventListener('click', (event) => {
		const target = event.target instanceof Element ? event.target : null;
		const submitter = target?.closest<HTMLButtonElement | HTMLInputElement>('button[type="submit"], input[type="submit"]');
		if (submitter?.form?.dataset.tsSubmit === 'enhanced') submitter.form.noValidate = true;
	}, { capture: true });
	root.addEventListener('submit', (event) => {
		const form = event.target;
		if (!(form instanceof HTMLFormElement) || form.dataset.tsSubmit !== 'enhanced') return;
		event.preventDefault();
		void submitForm(form, event instanceof SubmitEvent ? event.submitter : null);
	}, { capture: true });
	root.addEventListener('input', clearChangedField);
	root.addEventListener('change', clearChangedField);
	root.addEventListener('astro:page-load', () => enableEnhancedValidation(root));
	root.addEventListener('treeseed:content-updated', () => enableEnhancedValidation(root));
}
