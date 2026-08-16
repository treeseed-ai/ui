import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import type { WorkspaceOverlayReference } from './types.ts';

function focusableElements(element: HTMLElement) {
	return Array.from(element.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter((candidate) => !candidate.hidden && candidate.getAttribute('aria-hidden') !== 'true');
}

export function WorkspaceOverlay({ reference, label, top = true, depth = 0, onClose, children, header, className = '' }: {
	reference: WorkspaceOverlayReference;
	label: string;
	top?: boolean;
	depth?: number;
	onClose(): void;
	children: ReactNode;
	header?: ReactNode;
	className?: string;
}) {
	const pane = useRef<HTMLElement | null>(null);
	useEffect(() => {
		if (!top) return;
		const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const frame = requestAnimationFrame(() => { if (!pane.current?.closest('[inert]')) pane.current?.focus({ preventScroll: true }); });
		const onKeyDown = (event: KeyboardEvent) => {
			if (pane.current?.closest('[inert]')) return;
			if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); onClose(); return; }
			if (event.key !== 'Tab' || !pane.current) return;
			const focusable = focusableElements(pane.current);
			if (!focusable.length) { event.preventDefault(); pane.current.focus(); return; }
			const first = focusable[0]; const last = focusable.at(-1)!;
			if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
			else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
		};
		document.addEventListener('keydown', onKeyDown);
		return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', onKeyDown); previous?.focus({ preventScroll: true }); };
	}, [onClose, top]);
	return <section ref={pane} className={`ts-workspace-overlay ${className}`.trim()} data-workspace-overlay={`${reference.kind}:${reference.id}`} data-workspace-overlay-active={top ? 'true' : 'false'} role="dialog" aria-modal={top ? 'true' : undefined} aria-hidden={!top} aria-label={label} tabIndex={-1} style={{ '--ts-workspace-overlay-depth': depth, '--ts-overlay-depth': depth } as CSSProperties} {...(!top ? { inert: '' as unknown as boolean } : {})}>
		{header}{children}
	</section>;
}

export function WorkspaceOverlayStack({ overlays, render }: { overlays: WorkspaceOverlayReference[]; render(reference: WorkspaceOverlayReference, index: number, top: boolean): ReactNode; }) {
	return <div className="ts-workspace-overlay-stack" data-open={overlays.length > 0}>{overlays.map((reference, index) => render(reference, index, index === overlays.length - 1))}</div>;
}
