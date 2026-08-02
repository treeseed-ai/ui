const initialized = new WeakSet<Document>();
const openerByDialog = new WeakMap<HTMLDialogElement, HTMLElement>();

const focusableSelector = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableElements(dialog: HTMLDialogElement) {
	return [...dialog.querySelectorAll<HTMLElement>(focusableSelector)]
		.filter((item) => !item.hidden && item.getAttribute('aria-hidden') !== 'true');
}

export function openManagedDialog(dialog: HTMLDialogElement, opener: HTMLElement) {
	openerByDialog.set(dialog, opener);
	if (!dialog.open) dialog.showModal();
	document.body.classList.add('ts-modal-open');
	(dialog.querySelector<HTMLElement>('[data-ts-dialog-initial-focus]') ?? focusableElements(dialog)[0])?.focus();
}

export function closeManagedDialog(dialog: HTMLDialogElement) {
	if (dialog.open) dialog.close();
	if (!document.querySelector('dialog[open]')) document.body.classList.remove('ts-modal-open');
	openerByDialog.get(dialog)?.focus();
}

function trapFocus(event: KeyboardEvent, dialog: HTMLDialogElement) {
	if (event.key !== 'Tab') return;
	const focusable = focusableElements(dialog);
	if (!focusable.length) return;
	const first = focusable[0];
	const last = focusable.at(-1)!;
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

export function initializeDialogController(root: Document = document) {
	if (initialized.has(root)) return;
	initialized.add(root);
	root.addEventListener('click', (event) => {
		const target = event.target instanceof Element ? event.target : null;
		const opener = target?.closest<HTMLElement>('[data-dialog-open]');
		if (opener) {
			const dialog = root.getElementById(opener.dataset.dialogOpen ?? '');
			if (dialog instanceof HTMLDialogElement) openManagedDialog(dialog, opener);
			return;
		}
		const close = target?.closest<HTMLElement>('[data-dialog-close]');
		const dialog = close?.closest<HTMLDialogElement>('dialog');
		if (dialog) closeManagedDialog(dialog);
	});
	root.addEventListener('cancel', (event) => {
		const dialog = event.target;
		if (dialog instanceof HTMLDialogElement) {
			event.preventDefault();
			closeManagedDialog(dialog);
		}
	}, true);
	root.addEventListener('keydown', (event) => {
		const dialog = event.target instanceof Element ? event.target.closest<HTMLDialogElement>('dialog[open]') : null;
		if (dialog) trapFocus(event, dialog);
	});
	root.addEventListener('click', (event) => {
		const dialog = event.target;
		if (dialog instanceof HTMLDialogElement && dialog.hasAttribute('data-ts-dialog-backdrop-close')) {
			closeManagedDialog(dialog);
		}
	});
	root.addEventListener('astro:before-swap', () => {
		root.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((dialog) => dialog.close());
		root.body.classList.remove('ts-modal-open');
	}, { once: true });
}

