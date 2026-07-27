import { initializeMarkdownFields } from './markdown-field.ts';
import { dismissToast, registerFormAdapter, showToast } from '../../forms-client.ts';
import { waitForPlatformOperation } from './platform-operation-status.ts';

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

registerFormAdapter('related-operation', {
	buildRequest(context) {
		return {
			url: context.form.action,
			init: {
				method: 'POST',
				headers: { accept: 'application/json', 'content-type': 'application/json', 'x-treeseed-form': 'enhanced' },
				body: JSON.stringify(Object.fromEntries(context.formData.entries())),
				credentials: 'same-origin',
			},
		};
	},
	async parseResponse(response) {
		const payload = await response.json().catch(() => null);
		if (!response.ok || payload?.ok === false) {
			return { ok: false, code: String(payload?.code ?? `http_${response.status}`), message: String(payload?.error ?? 'Related content could not be created.') };
		}
		const toastId = showToast({ id: 'related-content-operation', tone: 'progress', message: 'Creating linked content…', duration: null });
		try {
			const redirect = await waitForPlatformOperation(payload, { fallbackHref: `${window.location.pathname}?related=${Date.now()}` });
			showToast({ id: toastId, tone: 'success', message: 'Related content created.' });
			return { ok: true, code: 'related_content_created', message: 'Related content created.', redirect };
		} catch (error) {
			dismissToast(toastId);
			return { ok: false, code: 'related_content_failed', message: error instanceof Error ? error.message : 'Related content could not be created.' };
		}
	},
});

function initializeDrag(windowElement: HTMLElement, handle: HTMLElement) {
	let dragging = false;
	let startX = 0;
	let startY = 0;
	let startLeft = 0;
	let startTop = 0;

	handle.addEventListener('pointerdown', (event) => {
		const target = event.target as HTMLElement | null;
		if (target?.closest('button, a, input, select, textarea, summary, details')) return;
		const rect = windowElement.getBoundingClientRect();
		dragging = true;
		startX = event.clientX;
		startY = event.clientY;
		startLeft = rect.left;
		startTop = rect.top;
		handle.setPointerCapture(event.pointerId);
	});

	handle.addEventListener('pointermove', (event) => {
		if (!dragging) return;
		const rect = windowElement.getBoundingClientRect();
		const left = clamp(startLeft + event.clientX - startX, 8, window.innerWidth - Math.min(180, rect.width));
		const top = clamp(startTop + event.clientY - startY, 8, window.innerHeight - Math.min(96, rect.height));
		windowElement.style.left = `${left}px`;
		windowElement.style.top = `${top}px`;
		windowElement.style.right = 'auto';
		windowElement.style.bottom = 'auto';
	});

	handle.addEventListener('pointerup', (event) => {
		if (!dragging) return;
		dragging = false;
		handle.releasePointerCapture(event.pointerId);
	});
}

function initializeRelatedContentCreator(root: HTMLElement) {
	if (root.dataset.relatedCreatorReady === 'true') return;
	root.dataset.relatedCreatorReady = 'true';

	const float = root.querySelector<HTMLElement>('[data-related-float]') ?? document.querySelector<HTMLElement>('[data-related-float]');
	const windowElement = root.querySelector<HTMLElement>('[data-related-window]') ?? document.querySelector<HTMLElement>('[data-related-window]');
	const title = root.querySelector<HTMLElement>('[data-related-title]') ?? document.querySelector<HTMLElement>('[data-related-title]');
	const handle = root.querySelector<HTMLElement>('[data-related-drag-handle]') ?? document.querySelector<HTMLElement>('[data-related-drag-handle]');
	if (!float || !windowElement || !handle) return;
	const floatingLayer = float;

	initializeDrag(windowElement, handle);

	function activeForm() {
		return document.querySelector<HTMLFormElement>('.ts-related-form:not([hidden])');
	}

	function closeWindow() {
		const form = activeForm();
		form?.reset();
		floatingLayer.hidden = true;
		document.querySelectorAll<HTMLFormElement>('.ts-related-form').forEach((candidate) => {
			candidate.hidden = true;
		});
	}

	function openWindow(collection: string, label: string) {
		document.querySelectorAll<HTMLFormElement>('.ts-related-form').forEach((candidate) => {
			candidate.hidden = candidate.dataset.relatedForm !== collection;
		});
		if (title) title.textContent = label;
		floatingLayer.hidden = false;
		initializeMarkdownFields();
		requestAnimationFrame(() => {
			const input = activeForm()?.querySelector<HTMLInputElement>('input[name="title"]');
			input?.focus();
		});
	}

	root.addEventListener('click', (event) => {
		const target = event.target as HTMLElement | null;
		const openButton = target?.closest<HTMLElement>('[data-related-create-open], .ts-related-create__button');
		if (openButton) {
			const trigger = openButton.matches('[data-related-create-open]')
				? openButton
				: openButton.querySelector<HTMLElement>('[data-related-create-open]');
			const collection = String(trigger?.dataset.relatedCreateOpen ?? '');
			if (!collection) return;
			openWindow(
				collection,
				trigger?.textContent?.trim() || openButton.textContent?.trim() || 'New related content',
			);
			return;
		}
		if (target?.closest('[data-related-close], .ts-related-cancel')) {
			closeWindow();
		}
	});
	document.addEventListener('click', (event) => {
		const target = event.target as HTMLElement | null;
		if (target?.closest('[data-related-close], .ts-related-cancel')) {
			closeWindow();
		}
	});

}

export function initializeRelatedContentCreators() {
	document
		.querySelectorAll<HTMLElement>('[data-related-create]')
		.forEach((root) => initializeRelatedContentCreator(root));
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initializeRelatedContentCreators, { once: true });
	} else {
		initializeRelatedContentCreators();
	}
	document.addEventListener('astro:page-load', initializeRelatedContentCreators);
}
