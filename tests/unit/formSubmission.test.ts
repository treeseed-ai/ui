import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formSubmissionResponse } from '../../src/forms';
import {
	applyFieldErrors,
	initializeFormSubmissions,
	initializeToasts,
	requestJson,
	showToast,
	submitForm,
	updateToast,
} from '../../src/forms-client';

function mountForm(attributes = '') {
	document.body.innerHTML = `
		<section data-ts-toast-region></section>
		<form action="/account" method="post" data-ts-submit="enhanced" ${attributes}>
			<label data-ts-field>
				Email
				<input id="email" name="email" type="email" required>
				<p id="email-error" data-ts-field-error hidden></p>
			</label>
			<input name="csrfToken" value="csrf-value">
			<button type="submit" name="intent" value="save">Save</button>
		</form>
	`;
	return document.querySelector('form') as HTMLFormElement;
}

describe('form response negotiation', () => {
	it('returns structured JSON and meaningful validation status for enhanced requests', async () => {
		const response = formSubmissionResponse(
			new Request('https://example.test/account', {
				headers: { accept: 'application/json', 'x-treeseed-form': 'enhanced' },
			}),
			{
				ok: false,
				code: 'email_invalid',
				message: 'Enter a valid email.',
				fieldErrors: { email: 'Enter a valid email.' },
			},
			{ fallbackRedirect: '/account' },
		);

		expect(response.status).toBe(422);
		expect(await response.json()).toMatchObject({
			ok: false,
			code: 'email_invalid',
			fieldErrors: { email: 'Enter a valid email.' },
		});
	});

	it('preserves POST/303 fallback and rejects cross-origin redirects', () => {
		const response = formSubmissionResponse(
			new Request('https://example.test/account'),
			{
				ok: true,
				code: 'saved',
				message: 'Account saved.',
				redirect: 'https://attacker.test/collect',
			},
			{ fallbackRedirect: '/account?tab=identity' },
		);

		expect(response.status).toBe(303);
		expect(response.headers.get('location')).toBe('/account?tab=identity&tsToastSuccess=Account+saved.');
	});

	it('falls back to the origin root when both declared redirects are unsafe', () => {
		const response = formSubmissionResponse(
			new Request('https://example.test/account'),
			{ ok: true, code: 'saved', message: 'Saved.', redirect: 'https://attacker.test/result' },
			{ fallbackRedirect: 'https://attacker.test/fallback' },
		);
		expect(response.headers.get('location')).toBe('/?tsToastSuccess=Saved.');
	});
});

describe('enhanced form controller', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		document.body.innerHTML = '';
		initializeFormSubmissions(document);
		initializeToasts();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('places native and server errors beside fields and focuses the first error', async () => {
		const form = mountForm();
		const email = form.elements.namedItem('email') as HTMLInputElement;

		expect(await submitForm(form)).toBeNull();
		expect(email).toHaveAttribute('aria-invalid', 'true');
		expect(document.activeElement).toBe(email);
		expect(document.querySelector('#email-error')).toHaveTextContent('This field is required.');

		email.value = 'person@example.test';
		applyFieldErrors(form, { email: 'This email is already in use.' });
		expect(document.querySelector('#email-error')).toHaveTextContent('This email is already in use.');
		email.dispatchEvent(new Event('input', { bubbles: true }));
		expect(email).not.toHaveAttribute('aria-invalid');
	});

	it('serializes JSON, CSRF, and submitter values while blocking duplicate submission', async () => {
		const form = mountForm('data-ts-form-adapter="json"');
		form.insertAdjacentHTML('beforeend', '<input name="scope" value="one"><input name="scope" value="two">');
		const email = form.elements.namedItem('email') as HTMLInputElement;
		const button = form.querySelector('button') as HTMLButtonElement;
		email.value = 'person@example.test';
		let resolveRequest!: (response: Response) => void;
		const request = new Promise<Response>((resolve) => { resolveRequest = resolve; });
		const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) => request);
		vi.stubGlobal('fetch', fetchMock);

		const first = submitForm(form, button);
		const duplicate = await submitForm(form, button);
		expect(duplicate).toBeNull();
		expect(button).toBeDisabled();
		resolveRequest(new Response(JSON.stringify({
			ok: true,
			code: 'saved',
			message: 'Saved.',
		}), { headers: { 'content-type': 'application/json' } }));
		await first;

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const init = fetchMock.mock.calls[0]![1]!;
		expect(init.headers).toBeInstanceOf(Headers);
		expect((init.headers as Headers).get('x-treeseed-csrf')).toBe('csrf-value');
		expect(JSON.parse(String(init.body))).toMatchObject({
			email: 'person@example.test',
			csrfToken: 'csrf-value',
			intent: 'save',
			scope: ['one', 'two'],
		});
		expect(button).not.toBeDisabled();
		expect(document.querySelector('[data-ts-toast-region]')).toHaveTextContent('Saved.');
	});

	it('adds the browser CSRF cookie to direct same-origin JSON mutations', async () => {
		document.cookie = 'ts_csrf=workspace-csrf; path=/';
		const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ ok: true }), {
			headers: { 'content-type': 'application/json' },
		}));
		vi.stubGlobal('fetch', fetchMock);

		await requestJson('/v1/teams/team-1/agent-lab/view-state', { method: 'PATCH' });

		const headers = fetchMock.mock.calls[0]![1]!.headers as Headers;
		expect(headers.get('x-treeseed-csrf')).toBe('workspace-csrf');
	});

	it('creates one request identifier per rendered form and preserves it across retries', async () => {
		const form = mountForm('data-ts-form-adapter="json"');
		form.insertAdjacentHTML('beforeend', '<input type="hidden" name="requestId" value="" data-ts-request-id>');
		(form.elements.namedItem('email') as HTMLInputElement).value = 'person@example.test';
		const fetchMock = vi.fn()
			.mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, code: 'retry', message: 'Try again.' }), {
				status: 503, headers: { 'content-type': 'application/json' },
			}))
			.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, code: 'saved', message: 'Saved.' }), {
				headers: { 'content-type': 'application/json' },
			}));
		vi.stubGlobal('fetch', fetchMock);

		await submitForm(form);
		await submitForm(form);

		const first = JSON.parse(String(fetchMock.mock.calls[0]![1]!.body));
		const second = JSON.parse(String(fetchMock.mock.calls[1]![1]!.body));
		expect(first.requestId).toMatch(/^[0-9a-f-]{36}$/u);
		expect(second.requestId).toBe(first.requestId);
	});

	it('shows problem+json diagnostics instead of the unexpected-response toast', async () => {
		const form = mountForm();
		(form.elements.namedItem('email') as HTMLInputElement).value = 'person@example.test';
		vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
			title: 'Credential custody unavailable', detail: 'Core OpenBao is not ready.', status: 503,
		}), { status: 503, headers: { 'content-type': 'application/problem+json; charset=utf-8' } })));
		const result = await submitForm(form);
		expect(result).toMatchObject({ok:false,message:'Core OpenBao is not ready.'});
	});

	it('preserves multipart FormData while attaching CSRF to the request', async () => {
		const form = mountForm();
		const email = form.elements.namedItem('email') as HTMLInputElement;
		email.value = 'person@example.test';
		const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) => Promise.resolve(
			new Response(JSON.stringify({ ok: true, code: 'saved', message: 'Saved.' }), {
				headers: { 'content-type': 'application/json' },
			}),
		));
		vi.stubGlobal('fetch', fetchMock);

		await submitForm(form);
		const init = fetchMock.mock.calls[0]![1]!;
		expect(init.body).toBeInstanceOf(FormData);
		expect((init.headers as Headers).get('x-treeseed-csrf')).toBe('csrf-value');
		expect((init.headers as Headers).has('content-type')).toBe(false);
	});

	it('uses the declared endpoint when a named control shadows the native form action property', async () => {
		const form = mountForm();
		form.insertAdjacentHTML('beforeend', '<input type="hidden" name="action" value="leave">');
		(form.elements.namedItem('email') as HTMLInputElement).value = 'person@example.test';
		const fetchMock = vi.fn(() => Promise.resolve(
			new Response(JSON.stringify({ ok: true, code: 'left', message: 'You left the team.' }), {
				headers: { 'content-type': 'application/json' },
			}),
		));
		vi.stubGlobal('fetch', fetchMock);

		await submitForm(form);

		expect(fetchMock).toHaveBeenCalledWith('/account', expect.any(Object));
	});

	it('bypasses the client router for explicit server redirects', async () => {
		const form = mountForm();
		(form.elements.namedItem('email') as HTMLInputElement).value = 'person@example.test';
		vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify({
			ok: true,
			code: 'continuing',
			message: 'Continuing.',
			redirect: '/account/complete',
		}), { headers: { 'content-type': 'application/json' } }))));
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

		await submitForm(form);

		expect(click).toHaveBeenCalledOnce();
		const link = click.mock.instances[0] as HTMLAnchorElement;
		expect(link.href).toBe('http://localhost:3000/account/complete?tsToastSuccess=Continuing.');
		expect(link).toHaveAttribute('data-astro-reload');
	});

	it('preserves the active state of a refreshed tab panel', async () => {
		const form = mountForm('data-ts-refresh-target="#credentials-panel"');
		form.insertAdjacentHTML('afterend', '<section id="credentials-panel" role="tabpanel"><p>Old credentials</p></section>');
		(form.elements.namedItem('email') as HTMLInputElement).value = 'person@example.test';
		const fetchMock = vi.fn()
			.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, code: 'saved', message: 'Saved.' }), {
				headers: { 'content-type': 'application/json' },
			}))
			.mockResolvedValueOnce(new Response(
				'<html><body><section id="credentials-panel" role="tabpanel" hidden><p>Updated credentials</p></section></body></html>',
				{ headers: { 'content-type': 'text/html' } },
			));
		vi.stubGlobal('fetch', fetchMock);

		await submitForm(form);

		const panel = document.querySelector<HTMLElement>('#credentials-panel');
		expect(panel).toHaveTextContent('Updated credentials');
		expect(panel?.hidden).toBe(false);
	});

	it('announces success before a slow server-rendered target refresh completes', async () => {
		const form = mountForm('data-ts-refresh-target="#credentials-panel"');
		(form.elements.namedItem('email') as HTMLInputElement).value = 'person@example.test';
		let finishRefresh!: (response: Response) => void;
		const refresh = new Promise<Response>((resolve) => { finishRefresh = resolve; });
		vi.stubGlobal('fetch', vi.fn()
			.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, code: 'saved', message: 'Saved now.' }), {
				headers: { 'content-type': 'application/json' },
			}))
			.mockReturnValueOnce(refresh));

		const submission = submitForm(form);
		await vi.waitFor(() => expect(document.querySelector('[data-ts-toast-region]')).toHaveTextContent('Saved now.'));
		finishRefresh(new Response('<html><body></body></html>', { headers: { 'content-type': 'text/html' } }));
		await submission;
	});

	it('delegates enhanced submissions once at the document boundary', () => {
		const form = mountForm();
		const button = form.querySelector('button') as HTMLButtonElement;
		button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		expect(form.noValidate).toBe(true);
		const preventDefault = vi.spyOn(Event.prototype, 'preventDefault');
		form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
		expect(preventDefault).toHaveBeenCalled();
	});

	it('queues no more than four visible notifications', () => {
		mountForm();
		for (let index = 0; index < 6; index += 1) {
			showToast({ id: `toast-${index}`, tone: 'progress', message: `Message ${index}` });
		}
		expect(document.querySelectorAll('[data-ts-toast-id]')).toHaveLength(4);
	});

	it('updates a persistent progress notification in place', () => {
		mountForm();
		showToast({ id: 'operation', tone: 'progress', message: 'Working…' });
		expect(updateToast('operation', { tone: 'success', message: 'Complete.' })).toBe(true);
		const toast = document.querySelector('[data-ts-toast-id="operation"]');
		expect(toast).toHaveAttribute('data-tone', 'success');
		expect(toast).toHaveTextContent('Complete.');
	});

	it('expires success before error and pauses expiration while focused', () => {
		vi.useFakeTimers();
		vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
		mountForm();
		showToast({ id: 'success-timer', tone: 'success', message: 'Saved.' });
		showToast({ id: 'error-timer', tone: 'error', message: 'Failed.' });
		const success = document.querySelector<HTMLElement>('[data-ts-toast-id="success-timer"]')!;
		success.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

		vi.advanceTimersByTime(5_000);
		expect(success).toBeInTheDocument();
		expect(document.querySelector('[data-ts-toast-id="error-timer"]')).toBeInTheDocument();
		success.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
		vi.advanceTimersByTime(5_000);
		vi.advanceTimersByTime(200);

		expect(success).not.toBeInTheDocument();
		expect(document.querySelector('[data-ts-toast-id="error-timer"]')).not.toBeInTheDocument();
	});
});
