import { useEffect } from 'react';

type AvailabilityKind = 'username' | 'email';

export interface AvailabilityIslandProps {
	rootId: string;
	endpoints: Partial<Record<AvailabilityKind, string>>;
	mode: 'registration' | 'username-claim';
}

export function AvailabilityIsland({ rootId, endpoints, mode }: AvailabilityIslandProps) {
	useEffect(() => {
		const form = document.getElementById(rootId);
		if (!(form instanceof HTMLFormElement)) return;
		const controllers = new Map<AvailabilityKind, AbortController>();
		const timers = new Map<AvailabilityKind, number>();
		const states: Partial<Record<AvailabilityKind, boolean>> = {};
		const kinds: AvailabilityKind[] = mode === 'registration' ? ['username', 'email'] : ['username'];
		const submit = form.querySelector<HTMLButtonElement>(mode === 'registration' ? '[data-registration-submit]' : '[data-claim-submit]');
		const syncTheme = (event?: Event) => {
			if (mode !== 'registration') return;
			const detail = event instanceof CustomEvent ? event.detail ?? {} : {};
			const scheme = form.querySelector<HTMLInputElement>('[data-auth-theme-scheme-field]');
			const themeMode = form.querySelector<HTMLInputElement>('[data-auth-theme-mode-field]');
			if (scheme) scheme.value = detail.scheme ?? document.documentElement.dataset.tsScheme ?? scheme.value;
			if (themeMode) themeMode.value = detail.mode ?? (document.documentElement.dataset.tsModeSource === 'system' ? 'system' : document.documentElement.dataset.tsMode) ?? themeMode.value;
		};
		const validateSubmit = (event: SubmitEvent) => {
			syncTheme();
			if (kinds.some((kind) => states[kind] !== true) || !form.checkValidity()) {
				event.preventDefault();
				form.reportValidity();
			}
		};

		const updateSubmit = () => {
			if (submit) submit.disabled = kinds.some((kind) => states[kind] !== true);
		};
		const check = async (kind: AvailabilityKind) => {
			const input = form.querySelector<HTMLInputElement>(mode === 'registration' ? `[data-availability-input="${kind}"]` : '[data-claim-input]');
			const status = form.querySelector<HTMLElement>(mode === 'registration' ? `[data-availability-status="${kind}"]` : '[data-claim-status]');
			const endpoint = endpoints[kind];
			if (!input || !status || !endpoint) return;
			controllers.get(kind)?.abort();
			states[kind] = false;
			updateSubmit();
			const value = input.value.trim();
			if (!value || !input.checkValidity()) {
				status.textContent = value ? `Enter a valid ${kind}.` : '';
				if (value) status.setAttribute('data-tone', 'danger');
				else status.removeAttribute('data-tone');
				input.setAttribute('aria-invalid', value ? 'true' : 'false');
				return;
			}
			const controller = new AbortController();
			controllers.set(kind, controller);
			status.textContent = mode === 'username-claim' ? 'Checking username availability…' : '';
			status.setAttribute('aria-busy', 'true');
			try {
				const response = await fetch(`${endpoint}?value=${encodeURIComponent(value)}`, {
					headers: { accept: 'application/json' },
					signal: controller.signal,
				});
				if (!response.ok) throw new Error('Availability request failed');
				const result = await response.json();
				if (input.value.trim() !== value) return;
				const payload = result?.payload ?? result;
				states[kind] = payload.available === true;
				status.textContent = states[kind]
					? (mode === 'username-claim' ? payload.message ?? 'Username is available.' : '')
					: payload.status === 'taken' ? `This ${kind} isn’t available for registration.`
						: payload.status === 'throttled' ? 'Please wait before continuing registration.'
							: payload.message ?? `This ${kind} can’t be used.`;
				status.setAttribute('data-tone', states[kind] ? 'success' : 'danger');
				input.setAttribute('aria-invalid', states[kind] ? 'false' : 'true');
			} catch (error) {
				if (controller.signal.aborted) return;
				status.textContent = `${kind === 'username' ? 'Username' : 'Email'} availability could not be checked.`;
				status.setAttribute('data-tone', 'danger');
			} finally {
				if (!controller.signal.aborted) status.removeAttribute('aria-busy');
				updateSubmit();
			}
		};
		const cleanups = kinds.map((kind) => {
			const input = form.querySelector<HTMLInputElement>(mode === 'registration' ? `[data-availability-input="${kind}"]` : '[data-claim-input]');
			const schedule = () => {
				window.clearTimeout(timers.get(kind));
				timers.set(kind, window.setTimeout(() => void check(kind), 350));
			};
			input?.addEventListener('input', schedule);
			input?.addEventListener('change', schedule);
			if (input?.value) void check(kind);
			return () => { input?.removeEventListener('input', schedule); input?.removeEventListener('change', schedule); };
		});
		window.addEventListener('treeseed:theme-change', syncTheme);
		form.addEventListener('submit', validateSubmit);
		return () => {
			cleanups.forEach((cleanup) => cleanup());
			timers.forEach((timer) => window.clearTimeout(timer));
			controllers.forEach((controller) => controller.abort());
			window.removeEventListener('treeseed:theme-change', syncTheme);
			form.removeEventListener('submit', validateSubmit);
		};
	}, [endpoints.email, endpoints.username, mode, rootId]);
	return null;
}
