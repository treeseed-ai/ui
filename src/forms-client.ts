import {
	initializeFormSubmissions as initializeSubmissions,
	registerFormAdapter as registerAdapter,
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
