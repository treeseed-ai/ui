import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface Frame { top: number; left: number; width: number; height: number; }

interface Props {
	id: string;
	label: string;
	expanded: boolean;
	onExpand: (id: string) => void;
	onDismiss: () => void;
	children: ReactNode;
	className?: string;
}

export function ExpandableMonitorSurface({ id, label, expanded, onExpand, onDismiss, children, className = '' }: Props) {
	const [frame, setFrame] = useState<Frame | null>(null);
	const surfaceRef = useRef<HTMLDivElement | null>(null);
	const expandButtonRef = useRef<HTMLButtonElement | null>(null);
	const closeButtonRef = useRef<HTMLButtonElement | null>(null);
	const captureFrame = useCallback((element: HTMLElement) => {
		const content = element.closest<HTMLElement>('.ts-control-surface') ?? element.closest<HTMLElement>('main') ?? element;
		const header = document.querySelector<HTMLElement>('.ts-product-shell__header');
		const rect = content.getBoundingClientRect();
		const top = Math.max(rect.top, header?.getBoundingClientRect().bottom ?? 0, 0);
		const left = Math.max(0, rect.left);
		setFrame({ top, left, width: Math.min(rect.width, window.innerWidth - left), height: Math.max(1, window.innerHeight - top) });
	}, []);
	const expand = useCallback((element: HTMLElement) => {
		if (expanded) return;
		captureFrame(element);
		onExpand(id);
	}, [captureFrame, expanded, id, onExpand]);
	const dismiss = useCallback(() => {
		onDismiss();
		requestAnimationFrame(() => expandButtonRef.current?.focus({ preventScroll: true }));
	}, [onDismiss]);
	useEffect(() => {
		if (!expanded) return;
		const surface = surfaceRef.current;
		const update = () => { if (surface) captureFrame(surface); };
		const dismissEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss(); };
		closeButtonRef.current?.focus({ preventScroll: true });
		window.addEventListener('resize', update);
		document.addEventListener('keydown', dismissEscape);
		return () => {
			window.removeEventListener('resize', update);
			document.removeEventListener('keydown', dismissEscape);
		};
	}, [captureFrame, dismiss, expanded]);
	const style = expanded && frame ? {
		'--ts-monitor-expanded-top': `${Math.max(0, frame.top)}px`,
		'--ts-monitor-expanded-left': `${Math.max(0, frame.left)}px`,
		'--ts-monitor-expanded-width': `${frame.width}px`,
		'--ts-monitor-expanded-height': `${frame.height}px`,
	} as CSSProperties : undefined;
	return <div
		className={`ts-monitor-surface ${className}`.trim()}
		data-expanded={expanded ? 'true' : 'false'}
		data-monitor-surface={id}
		role={expanded ? 'dialog' : undefined}
		aria-label={expanded ? `Expanded ${label}` : undefined}
		ref={surfaceRef}
		style={style}
	>
		{children}
		{expanded ? <button ref={closeButtonRef} className="ts-monitor-surface__close" type="button" onClick={dismiss} aria-label={`Close expanded ${label}`}><span aria-hidden="true">×</span><span>Close</span></button> : <button ref={expandButtonRef} className="ts-monitor-surface__expand" type="button" onClick={(event) => expand(event.currentTarget.parentElement as HTMLElement)} aria-label={`Expand ${label}`}><span aria-hidden="true">＋</span></button>}
	</div>;
}
