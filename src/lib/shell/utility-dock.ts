export type UtilityDockPlacement = 'dock-end' | 'dock-bottom' | 'full-screen';

const sideDock = '(min-width: 48rem)';
const dockStateKey = 'treeseed.utility-dock.state.v1';
const initialized = new WeakSet<Document>();
const openerByPanel = new WeakMap<HTMLElement, HTMLElement>();

interface PersistedUtilityDockState {
	open: boolean;
	applicationId?: string;
	placement?: UtilityDockPlacement;
	size?: number;
	returnFocusId?: string;
}

function storageKey(applicationId: string, placement: UtilityDockPlacement) {
	return `treeseed.utility-dock.${applicationId}.${placement}.size`;
}

function storedSize(applicationId: string, placement: UtilityDockPlacement) {
	try {
		const value = Number(localStorage.getItem(storageKey(applicationId, placement)));
		return Number.isFinite(value) && value > 0 ? value : undefined;
	} catch { return undefined; }
}

function storedDockState(): PersistedUtilityDockState | null {
	try {
		const value = JSON.parse(localStorage.getItem(dockStateKey) ?? 'null') as PersistedUtilityDockState | null;
		return value && typeof value === 'object' && typeof value.open === 'boolean' ? value : null;
	} catch { return null; }
}

function persistDockState(panel: HTMLElement, open: boolean, size?: number) {
	const applicationId = panel.dataset.tsUtilityApplication;
	const placement = panel.dataset.tsUtilityPlacement as UtilityDockPlacement | undefined;
	const returnFocusId = openerByPanel.get(panel)?.id || storedDockState()?.returnFocusId;
	try { localStorage.setItem(dockStateKey, JSON.stringify({ open, applicationId, placement, size, returnFocusId } satisfies PersistedUtilityDockState)); } catch { /* Persistence is optional. */ }
}

function shellFor(panel: HTMLElement) {
	return panel.closest<HTMLElement>('.ts-shell-workspace');
}

export function resolveUtilityDockPlacement(width = window.innerWidth): UtilityDockPlacement {
	if (typeof matchMedia === 'function') return matchMedia(sideDock).matches ? 'dock-end' : 'dock-bottom';
	return width >= 768 ? 'dock-end' : 'dock-bottom';
}

export function presentUtilityApplication(panel: HTMLElement, applicationId: string, forceFullScreen = false) {
	const shell = shellFor(panel);
	for (const sibling of shell?.querySelectorAll<HTMLElement>(':scope > [data-ts-utility-application]:not([hidden])') ?? []) {
		if (sibling === panel) continue;
		sibling.hidden = true;
		delete sibling.dataset.tsUtilityPlacement;
		delete sibling.dataset.tsFeedbackPresentation;
		delete sibling.dataset.tsDiscussionPresentation;
	}
	const placement = forceFullScreen ? 'full-screen' : resolveUtilityDockPlacement();
	panel.hidden = false;
	panel.dataset.tsUtilityApplication = applicationId;
	panel.dataset.tsUtilityPlacement = placement;
	if (applicationId === 'feedback') panel.dataset.tsFeedbackPresentation = placement === 'dock-end' ? 'docked' : placement === 'dock-bottom' ? 'bottom' : 'overlay';
	if (applicationId === 'chat') panel.dataset.tsDiscussionPresentation = placement === 'dock-end' ? 'docked' : placement === 'dock-bottom' ? 'bottom' : 'overlay';
	if (placement === 'full-screen') panel.setAttribute('popover', 'manual');
	else panel.removeAttribute('popover');
	panel.querySelector<HTMLElement>('[data-ts-utility-resize]')?.setAttribute('aria-orientation', placement === 'dock-end' ? 'vertical' : 'horizontal');
	const size = storedSize(applicationId, placement);
	if (shell && size) shell.style.setProperty(placement === 'dock-end' ? '--ts-utility-dock-inline-size' : '--ts-utility-dock-block-size', `${size}px`);
	persistDockState(panel, true, size);
	shell?.dispatchEvent(new CustomEvent('treeseed:utility-open', { bubbles: true, detail: { applicationId, placement } }));
	return placement;
}

export function rememberUtilityApplicationOpener(panel: HTMLElement, opener: HTMLElement) {
	openerByPanel.set(panel, opener);
}

export function dismissUtilityApplication(panel: HTMLElement) {
	const applicationId = panel.dataset.tsUtilityApplication;
	const placement = panel.dataset.tsUtilityPlacement as UtilityDockPlacement | undefined;
	const size = applicationId && placement ? storedSize(applicationId, placement) : undefined;
	persistDockState(panel, false, size);
	panel.hidden = true;
	delete panel.dataset.tsUtilityPlacement;
	shellFor(panel)?.dispatchEvent(new CustomEvent('treeseed:utility-close', { bubbles: true, detail: { applicationId } }));
	openerByPanel.get(panel)?.focus();
}

function resize(panel: HTMLElement, delta: number, startingSize?: number) {
	const shell = shellFor(panel);
	const placement = panel.dataset.tsUtilityPlacement as UtilityDockPlacement | undefined;
	const applicationId = panel.dataset.tsUtilityApplication;
	if (!shell || !applicationId || placement === 'full-screen' || !placement) return;
	const rect = panel.getBoundingClientRect();
	const base = startingSize ?? (placement === 'dock-end' ? rect.width : rect.height);
	const size = Math.round(Math.max(240, Math.min(720, base + delta)));
	const property = placement === 'dock-end' ? '--ts-utility-dock-inline-size' : '--ts-utility-dock-block-size';
	shell.style.setProperty(property, `${size}px`);
	try { localStorage.setItem(storageKey(applicationId, placement), String(size)); } catch { /* Persistence is optional. */ }
	persistDockState(panel, true, size);
}

export function initializeUtilityDock(root: Document = document) {
	if (initialized.has(root)) return;
	initialized.add(root);
	const synchronize = () => {
		for (const panel of root.querySelectorAll<HTMLElement>('[data-ts-utility-application]:not([hidden])')) {
			if (panel.dataset.tsUtilityPlacement === 'full-screen') continue;
			presentUtilityApplication(panel, panel.dataset.tsUtilityApplication ?? 'utility');
		}
	};
	matchMedia(sideDock).addEventListener?.('change', synchronize);
	const persisted = storedDockState();
	if (persisted?.open && persisted.applicationId) {
		const panel = [...root.querySelectorAll<HTMLElement>('[data-ts-utility-application]')]
			.find((candidate) => candidate.dataset.tsUtilityApplication === persisted.applicationId);
		if (panel) {
			const opener = persisted.returnFocusId ? root.getElementById(persisted.returnFocusId) : null;
			if (opener) rememberUtilityApplicationOpener(panel, opener);
			presentUtilityApplication(panel, persisted.applicationId, persisted.placement === 'full-screen');
		}
	}
	root.addEventListener('keydown', (event) => {
		const handle = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-ts-utility-resize]') : null;
		if (!handle || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
		const panel = handle.closest<HTMLElement>('[data-ts-utility-application]');
		if (!panel) return;
		event.preventDefault();
		const placement = panel.dataset.tsUtilityPlacement;
		const grows = placement === 'dock-end' ? event.key === 'ArrowLeft' : event.key === 'ArrowUp';
		resize(panel, grows ? 24 : -24);
	});
	root.addEventListener('pointerdown', (event) => {
		const handle = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-ts-utility-resize]') : null;
		const panel = handle?.closest<HTMLElement>('[data-ts-utility-application]');
		if (!handle || !panel) return;
		const placement = panel.dataset.tsUtilityPlacement;
		const start = placement === 'dock-end' ? event.clientX : event.clientY;
		const bounds = panel.getBoundingClientRect();
		const startingSize = placement === 'dock-end' ? bounds.width : bounds.height;
		const move = (next: PointerEvent) => resize(panel, placement === 'dock-end' ? start - next.clientX : start - next.clientY, startingSize);
		const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); };
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', stop);
	});
}
