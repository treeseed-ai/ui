import { showToast } from '../../forms-client.js';

type TurnstileApi = {
	render: (container: HTMLElement, options: Record<string, unknown>) => void;
	reset?: () => void;
};
let turnstileLoader: Promise<void> | null = null;

function turnstile() {
	return (window as unknown as { turnstile?: TurnstileApi }).turnstile;
}

function loadTurnstile() {
	if (turnstile()?.render) return Promise.resolve();
	if (turnstileLoader) return turnstileLoader;
	turnstileLoader = new Promise<void>((resolve, reject) => {
		const existing = document.querySelector<HTMLScriptElement>('script[data-ts-turnstile-loader]');
		const script = existing ?? document.createElement('script');
		const complete = () => turnstile()?.render ? resolve() : reject(new Error('Turnstile did not become available.'));
		script.addEventListener('load', complete, { once: true });
		script.addEventListener('error', () => reject(new Error('Turnstile could not be loaded.')), { once: true });
		if (!existing) {
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.defer = true;
			script.dataset.tsTurnstileLoader = '';
			document.head.append(script);
		}
	});
	return turnstileLoader;
}

async function initializeSecureForm(form: HTMLFormElement) {
	if (form.dataset.tsSecureReady === 'true') return;
	form.dataset.tsSecureReady = 'true';
	const formType = form.dataset.formType ?? '';
	const endpoint = form.dataset.securityEndpoint ?? '';
	const siteKey = form.dataset.turnstileSiteKey ?? '';
	const bypass = form.dataset.turnstileBypass === 'true';
	const action = form.dataset.turnstileAction ?? '';
	const tokenField = form.elements.namedItem('formToken');
	const sessionField = form.elements.namedItem('formSession');
	const submitButton = form.querySelector<HTMLButtonElement>('.js-submit');
	const widgetContainer = form.querySelector<HTMLElement>('.js-turnstile');

	const enableSubmit = () => {
		if (submitButton) submitButton.disabled = !(tokenField instanceof HTMLInputElement && tokenField.value);
	};
	const assignToken = async () => {
		const response = await fetch(`${endpoint}?formType=${encodeURIComponent(formType)}`, {
			headers: { accept: 'application/json' },
			credentials: 'same-origin',
		});
		const data = await response.json().catch(() => null);
		if (!response.ok || !data?.formToken) throw new Error('The secure form token could not be loaded.');
		if (tokenField instanceof HTMLInputElement) tokenField.value = data.formToken;
		if (sessionField instanceof HTMLInputElement && data.sessionId) sessionField.value = data.sessionId;
		enableSubmit();
	};
	const renderWidget = () => {
		const api = turnstile();
		if (bypass || !siteKey || !widgetContainer || !api?.render || widgetContainer.dataset.rendered === 'true') return;
		api.render(widgetContainer, { sitekey: siteKey, action, theme: 'light' });
		widgetContainer.dataset.rendered = 'true';
	};
	const renewSecurity = () => {
		if (tokenField instanceof HTMLInputElement) tokenField.value = '';
		enableSubmit();
		turnstile()?.reset?.();
		void assignToken().catch((error) => {
			showToast({ tone: 'error', message: error instanceof Error ? error.message : 'The secure form could not be renewed.' });
		});
	};

	enableSubmit();
	await assignToken();
	if (siteKey && !bypass) await loadTurnstile();
	renderWidget();
	form.addEventListener('treeseed:form-success', renewSecurity);
	form.addEventListener('treeseed:form-error', ((event: CustomEvent) => {
		if (['token_invalid', 'token_expired', 'token_replayed'].includes(event.detail?.code)) renewSecurity();
	}) as EventListener);
}

export function initializeSecureForms() {
	for (const form of document.querySelectorAll<HTMLFormElement>('[data-ts-secure-form]')) {
		void initializeSecureForm(form).catch((error) => {
			showToast({ tone: 'error', message: error instanceof Error ? error.message : 'The secure form could not be initialized.' });
		});
	}
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeSecureForms, { once: true });
	} else {
		initializeSecureForms();
	}
	document.addEventListener('astro:page-load', initializeSecureForms);
	document.addEventListener('treeseed:content-updated', initializeSecureForms);
}
