import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import type { WorkspaceFocusSurfaceProps } from './types.ts';
import '../../styles/workspace-surfaces.css';

interface Frame { top: number; left: number; width: number; height: number; }

interface InertSnapshot { element: HTMLElement; inert: boolean; ariaHidden: string | null; }

function boundaryElement(element: HTMLElement, boundary: WorkspaceFocusSurfaceProps['boundary']) {
	const selector = boundary === 'workspace-content' ? '[data-ts-workspace-content]' : '.ts-control-surface';
	return element.closest<HTMLElement>(selector) ?? element.closest<HTMLElement>('.ts-control-surface') ?? element.closest<HTMLElement>('main') ?? element;
}

function isolateSurface(surface: HTMLElement, boundary: HTMLElement) {
	const snapshots: InertSnapshot[] = [];
	let branch: HTMLElement = surface;
	while (branch !== boundary) {
		const parent = branch.parentElement;
		if (!parent) break;
		for (const sibling of Array.from(parent.children)) {
			if (!(sibling instanceof HTMLElement) || sibling === branch) continue;
			snapshots.push({ element: sibling, inert: sibling.inert, ariaHidden: sibling.getAttribute('aria-hidden') });
			sibling.inert = true;
			sibling.setAttribute('aria-hidden', 'true');
		}
		branch = parent;
	}
	return () => snapshots.forEach(({ element, inert, ariaHidden }) => {
		element.inert = inert;
		if (ariaHidden === null) element.removeAttribute('aria-hidden');
		else element.setAttribute('aria-hidden', ariaHidden);
	});
}

export function WorkspaceExpandButton({ label, onClick, buttonRef }: { label: string; onClick(): void; buttonRef?: RefObject<HTMLButtonElement | null> }) {
	return <button ref={buttonRef} className="ts-workspace-surface__expand" type="button" onClick={onClick} aria-label={`Expand ${label}`} title={`Expand ${label}`}><span aria-hidden="true">↗</span><span className="ts-visually-hidden">Expand</span></button>;
}

export function WorkspaceShrinkButton({ label, onClick, buttonRef }: { label: string; onClick(): void; buttonRef?: RefObject<HTMLButtonElement | null> }) {
	return <button ref={buttonRef} className="ts-workspace-surface__shrink" type="button" onClick={onClick} aria-label={`Shrink ${label}`} title={`Shrink ${label}`}><span aria-hidden="true">↙</span><span>Shrink</span></button>;
}

export function WorkspaceFocusSurface({ id, label, mode, boundary = 'control-surface', onModeChange, headerContext, children, className = '' }: WorkspaceFocusSurfaceProps) {
	const focused = mode === 'focused';
	const [frame, setFrame] = useState<Frame | null>(null);
	const surfaceRef = useRef<HTMLDivElement | null>(null);
	const expandButtonRef = useRef<HTMLButtonElement | null>(null);
	const shrinkButtonRef = useRef<HTMLButtonElement | null>(null);
	const onModeChangeRef = useRef(onModeChange);
	onModeChangeRef.current = onModeChange;
	const captureFrame = useCallback(() => {
		const surface = surfaceRef.current;
		if (!surface) return;
		const content = boundaryElement(surface, boundary);
		const header = document.querySelector<HTMLElement>('.ts-product-shell__header');
		const rect = content.getBoundingClientRect();
		const top = Math.max(rect.top, header?.getBoundingClientRect().bottom ?? 0, 0);
		const left = Math.max(0, rect.left);
		setFrame({ top, left, width: Math.max(1, Math.min(rect.width, window.innerWidth - left)), height: Math.max(1, window.innerHeight - top) });
	}, [boundary]);
	const expand = useCallback(() => {
		captureFrame();
		onModeChangeRef.current('focused');
	}, [captureFrame]);
	const shrink = useCallback(() => {
		onModeChangeRef.current('inline');
		requestAnimationFrame(() => expandButtonRef.current?.focus({ preventScroll: true }));
	}, []);
	useEffect(() => {
		if (!focused) return;
		const surface = surfaceRef.current;
		const content = surface ? boundaryElement(surface, boundary) : null;
		captureFrame();
		const restoreIsolation = surface && content ? isolateSurface(surface, content) : undefined;
		if (content) content.dataset.tsFocusedSurface = id;
		document.documentElement.dataset.tsFocusedWorkspace = id;
		shrinkButtonRef.current?.focus({ preventScroll: true });
		const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(captureFrame) : null;
		if (content) resize?.observe(content);
		const onResize = () => captureFrame();
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || event.defaultPrevented) return;
			if (surface?.querySelector('[data-workspace-overlay-active="true"]')) return;
			event.preventDefault();
			event.stopImmediatePropagation();
			shrink();
		};
		window.addEventListener('resize', onResize);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			resize?.disconnect();
			restoreIsolation?.();
			window.removeEventListener('resize', onResize);
			document.removeEventListener('keydown', onKeyDown);
			if (content?.dataset.tsFocusedSurface === id) delete content.dataset.tsFocusedSurface;
			if (document.documentElement.dataset.tsFocusedWorkspace === id) delete document.documentElement.dataset.tsFocusedWorkspace;
		};
	}, [boundary, captureFrame, focused, id, shrink]);
	const style = focused && frame ? {
		'--ts-workspace-focus-top': `${frame.top}px`,
		'--ts-workspace-focus-left': `${frame.left}px`,
		'--ts-workspace-focus-width': `${frame.width}px`,
		'--ts-workspace-focus-height': `${frame.height}px`,
	} as CSSProperties : undefined;
	return <div className={`ts-workspace-surface ${className}`.trim()} data-workspace-surface={id} data-mode={mode} aria-label={focused ? `Focused ${label}` : undefined} ref={surfaceRef} style={style}>
		{focused && headerContext ? <div className="ts-workspace-surface__context">{headerContext}</div> : null}
		{children}
		{focused ? <WorkspaceShrinkButton label={label} onClick={shrink} buttonRef={shrinkButtonRef} /> : <WorkspaceExpandButton label={label} onClick={expand} buttonRef={expandButtonRef} />}
	</div>;
}
