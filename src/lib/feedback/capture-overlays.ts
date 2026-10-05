export interface CaptureBounds {
	width: number;
	height: number;
}

export interface OverlaySnapshot {
	marker: string;
	kind: 'dialog' | 'popover';
	modal: boolean;
	left: number;
	top: number;
	width: number;
	height: number;
	backdropColor: string;
	backdropFilter: string;
}

const markerAttribute = 'data-ts-feedback-capture-overlay';
let markerSequence = 0;

function visibleFeedbackDock(root: Document) {
	return root.querySelector<HTMLElement>(
		'[data-ts-feedback-panel][data-ts-feedback-presentation="docked"]:not([hidden])',
	);
}

export function captureDocumentBounds(root: Document = document): CaptureBounds {
	const documentRoot = root.documentElement;
	const body = root.body;
	const content = visibleFeedbackDock(root)
		?.parentElement?.querySelector<HTMLElement>(':scope > .ts-shell-workspace__content');
	const contentWidth = content?.getBoundingClientRect().width;
	return {
		width: Math.max(320, Math.round(contentWidth || 0), content ? 0 : window.innerWidth, content ? 0 : documentRoot.scrollWidth, content ? 0 : body.scrollWidth),
		height: Math.max(240, window.innerHeight, documentRoot.scrollHeight, body.scrollHeight, content?.scrollHeight ?? 0),
	};
}

function isModal(dialog: HTMLDialogElement) {
	try {
		return dialog.matches(':modal');
	} catch {
		return document.body.classList.contains('ts-modal-open');
	}
}

function activePopovers(root: Document) {
	return [...root.querySelectorAll<HTMLElement>('[popover]')].filter((item) => {
		try {
			return item.matches(':popover-open');
		} catch {
			return item.dataset.tsFeedbackCapturePopover === 'open';
		}
	});
}

function backdropStyle(dialog: HTMLDialogElement) {
	try {
		const style = getComputedStyle(dialog, '::backdrop');
		return {
			color: style.backgroundColor || 'rgb(15 23 42 / 52%)',
			filter: style.backdropFilter || 'none',
		};
	} catch {
		return { color: 'rgb(15 23 42 / 52%)', filter: 'none' };
	}
}

export function snapshotActiveOverlays(root: Document = document) {
	const candidates: Array<{ element: HTMLElement; kind: OverlaySnapshot['kind']; modal: boolean }> = [
		...[...root.querySelectorAll<HTMLDialogElement>('dialog[open]')].map((element) => ({ element, kind: 'dialog' as const, modal: isModal(element) })),
		...activePopovers(root).map((element) => ({ element, kind: 'popover' as const, modal: false })),
	].filter(({ element }) => !element.closest('[data-ts-feedback-panel]'));
	const snapshots = candidates.map(({ element, kind, modal }) => {
		const marker = `overlay-${markerSequence += 1}`;
		const rect = element.getBoundingClientRect();
		const backdrop = kind === 'dialog' && modal ? backdropStyle(element as HTMLDialogElement) : { color: '', filter: '' };
		element.setAttribute(markerAttribute, marker);
		return {
			marker,
			kind,
			modal,
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height,
			backdropColor: backdrop.color,
			backdropFilter: backdrop.filter,
		} satisfies OverlaySnapshot;
	});
	return {
		snapshots,
		clear() {
			for (const { element } of candidates) element.removeAttribute(markerAttribute);
		},
	};
}

function setImportant(element: HTMLElement, property: string, value: string) {
	element.style.setProperty(property, value, 'important');
}

function freezeOverlayMotion(overlay: HTMLElement) {
	for (const element of [overlay, ...overlay.querySelectorAll<HTMLElement>('*')]) {
		setImportant(element, 'animation', 'none');
		setImportant(element, 'transition', 'none');
	}
}

export function materializeActiveOverlays(clone: HTMLElement, snapshots: OverlaySnapshot[], bounds: CaptureBounds) {
	if (!snapshots.length) return 0;
	const body = clone.querySelector('body');
	if (!(body instanceof HTMLElement)) return 0;
	const layer = document.createElement('div');
	layer.setAttribute('data-ts-feedback-capture-overlay-layer', 'true');
	layer.style.cssText = `height:${bounds.height}px;left:0;overflow:hidden;pointer-events:none;position:absolute;top:0;width:${bounds.width}px;z-index:2147483000`;
	let count = 0;
	for (const [index, snapshot] of snapshots.entries()) {
		const overlay = clone.querySelector<HTMLElement>(`[${markerAttribute}="${snapshot.marker}"]`);
		if (!overlay) continue;
		if (snapshot.modal) {
			const backdrop = document.createElement('div');
			backdrop.setAttribute('data-ts-feedback-capture-backdrop', snapshot.marker);
			backdrop.style.cssText = `backdrop-filter:${snapshot.backdropFilter};background:${snapshot.backdropColor};height:${window.innerHeight}px;left:0;position:absolute;top:${window.scrollY}px;width:${bounds.width}px;z-index:${index * 2}`;
			layer.append(backdrop);
		}
		overlay.removeAttribute(markerAttribute);
		if (snapshot.kind === 'popover') overlay.removeAttribute('popover');
		overlay.setAttribute('data-ts-feedback-captured-overlay', snapshot.kind);
		freezeOverlayMotion(overlay);
		setImportant(overlay, 'display', 'block');
		setImportant(overlay, 'position', 'absolute');
		setImportant(overlay, 'inset', 'auto');
		setImportant(overlay, 'left', `${snapshot.left}px`);
		setImportant(overlay, 'top', `${window.scrollY + snapshot.top}px`);
		setImportant(overlay, 'margin', '0');
		setImportant(overlay, 'width', `${snapshot.width}px`);
		setImportant(overlay, 'height', `${snapshot.height}px`);
		setImportant(overlay, 'max-width', 'none');
		setImportant(overlay, 'max-height', 'none');
		setImportant(overlay, 'transform', 'none');
		setImportant(overlay, 'z-index', String(index * 2 + 1));
		layer.append(overlay);
		count += 1;
	}
	body.append(layer);
	return count;
}

export function freezeCaptureLayout(clone: HTMLElement, bounds: CaptureBounds, docked: boolean) {
	const body = clone.querySelector<HTMLElement>('body');
	if (body) {
		body.classList.remove('ts-modal-open');
		setImportant(body, 'overflow', 'visible');
		setImportant(body, 'width', `${bounds.width}px`);
	}
	if (!docked) return;
	const workspace = clone.querySelector<HTMLElement>('[data-ts-shell-workspace]');
	const content = workspace?.querySelector<HTMLElement>(':scope > .ts-shell-workspace__content');
	if (workspace) {
		setImportant(workspace, 'display', 'block');
		setImportant(workspace, 'width', `${bounds.width}px`);
	}
	if (content) setImportant(content, 'width', `${bounds.width}px`);
}
