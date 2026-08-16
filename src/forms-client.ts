import {
	initializeFormSubmissions as initializeSubmissions,
	formActionUrl as resolveFormActionUrl,
	registerFormAdapter as registerAdapter,
	refreshContentTargets as refreshTargets,
	sendFormRequest as sendRequest,
	submitForm as submit,
} from './lib/forms/submission/submission.js';
import {
	dismissToast as dismiss,
	initializeToasts as initializeToastController,
	showToast as show,
	updateToast as update,
} from './lib/forms/submission/toast.js';
import {
	applyFieldErrors as applyErrors,
	clearFieldError as clearError,
	setFieldError as setError,
	validateForm as validate,
} from './lib/forms/submission/validation.js';
import type { FormSubmissionAdapter, ToastMessage } from './forms.js';

export function initializeFormSubmissions(root: Document = document) {
	return initializeSubmissions(root);
}

export function registerFormAdapter(name: string, adapter: FormSubmissionAdapter) {
	return registerAdapter(name, adapter);
}

export function submitForm(form: HTMLFormElement, submitter: HTMLElement | null = null) {
	return submit(form, submitter);
}

export function sendFormRequest(request: import('./forms.js').FormRequest) {
	return sendRequest(request);
}

function browserCsrfToken() {
	if (typeof document === 'undefined') return '';
	const encoded = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith('ts_csrf='))?.slice('ts_csrf='.length) ?? '';
	try { return decodeURIComponent(encoded); } catch { return ''; }
}

export function requestJson(url: string | URL, init: RequestInit = {}) {
	const headers = new Headers(init.headers);
	headers.set('accept', 'application/json');
	const method = (init.method ?? 'GET').toUpperCase();
	if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !headers.has('x-treeseed-csrf')) {
		const csrfToken = browserCsrfToken();
		if (csrfToken) headers.set('x-treeseed-csrf', csrfToken);
	}
	return sendRequest({ url: String(url), init: { credentials: 'same-origin', ...init, headers } });
}

export function formActionUrl(form: HTMLFormElement) {
	return resolveFormActionUrl(form);
}

export function refreshContentTargets(selectors: string[]) {
	return refreshTargets(selectors);
}

export function initializeToasts() {
	return initializeToastController();
}

export function showToast(message: ToastMessage) {
	return show(message);
}

export function dismissToast(id: string) {
	return dismiss(id);
}

export function updateToast(id: string, message: Partial<Omit<ToastMessage, 'id'>>) {
	return update(id, message);
}

export const validateForm = validate;
export const applyFieldErrors = applyErrors;
export const setFieldError = setError;
export const clearFieldError = clearError;
