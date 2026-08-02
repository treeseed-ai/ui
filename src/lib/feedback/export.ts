import { dismissToast, formActionUrl, registerFormAdapter, showToast } from '../../forms-client.ts';
import { waitForPlatformOperation } from '../app/platform-operation-status.ts';

function csrfToken() {
	return document.cookie.split('; ').find((entry) => entry.startsWith('ts_csrf='))?.split('=').slice(1).join('=') ?? '';
}

registerFormAdapter('feedback-export', {
	buildRequest(context) {
		const body: Record<string, unknown> = {};
		for (const [key, value] of context.formData.entries()) body[key] = value;
		body.includeScreenshots = context.formData.get('includeScreenshots') === 'true';
		return { url: formActionUrl(context.form), init: { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json', 'x-treeseed-form': 'enhanced', 'x-treeseed-csrf': csrfToken() }, body: JSON.stringify(body), credentials: 'same-origin' } };
	},
	async parseResponse(response) {
		const envelope = await response.json().catch(() => null);
		if (!response.ok || envelope?.ok === false) return { ok: false, code: envelope?.code ?? `http_${response.status}`, message: envelope?.message ?? 'Feedback export could not be queued.' };
		const progressId = showToast({ id: `feedback-export-${envelope.payload?.id}`, tone: 'progress', message: 'Preparing privacy-safe feedback export…', duration: null });
		try {
			await waitForPlatformOperation(envelope, { fallbackHref: window.location.href, timeoutMs: 120_000 });
			const exportId = String(envelope.payload.id);
			const result = document.querySelector<HTMLElement>('[data-feedback-export-result]');
			if (result) {
				result.replaceChildren();
				const link = document.createElement('a'); link.className = 'ts-button'; link.dataset.variant = 'secondary'; link.href = `/v1/admin/feedback/exports/${encodeURIComponent(exportId)}/download`; link.textContent = 'Download export';
				const note = document.createElement('span'); note.textContent = 'Available for 7 days.';
				result.append(link, note);
			}
			showToast({ id: progressId, tone: 'success', message: 'Privacy-safe feedback export is ready.' });
			return { ok: true, code: 'feedback_export_ready', message: 'Privacy-safe feedback export is ready.' };
		} catch (error) {
			dismissToast(progressId);
			return { ok: false, code: 'feedback_export_failed', message: error instanceof Error ? error.message : 'Feedback export failed.' };
		}
	},
});
