import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';

interface Frame { top: number; left: number; width: number; height: number; viewportWidth: number; viewportHeight: number; }

interface Props {
	id: string;
	label: string;
	expanded: boolean;
	onExpand: (id: string) => void;
	onDismiss: () => void;
	children: ReactNode;
	className?: string;
}

const interactiveSelector = 'a,button,input,select,textarea,summary,[role="button"],[role="link"],[contenteditable="true"]';

export function ExpandableMonitorSurface({ id, label, expanded, onExpand, onDismiss, children, className = '' }: Props) {
	const [frame, setFrame] = useState<Frame | null>(null);
	const surfaceRef = useRef<HTMLDivElement | null>(null);
	const captureFrame = useCallback((element: HTMLElement) => {
		const monitor = element.closest<HTMLElement>('.ts-operations-monitor');
		if (!monitor) return;
		const rect = monitor.getBoundingClientRect();
		setFrame({ top: rect.top, left: rect.left, width: rect.width, height: rect.height, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight });
	}, []);
	const expand = useCallback((element: HTMLElement) => {
		if (expanded) return;
		captureFrame(element);
		onExpand(id);
	}, [captureFrame, expanded, id, onExpand]);
	useEffect(() => {
		if (!expanded) return;
		const surface = surfaceRef.current;
		const update = () => { if (surface) captureFrame(surface); };
		const dismissOutside = (event: globalThis.PointerEvent) => {
			if (surface && event.target instanceof Node && !surface.contains(event.target)) onDismiss();
		};
		const dismissEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onDismiss(); };
		window.addEventListener('resize', update);
		window.addEventListener('scroll', update, true);
		document.addEventListener('pointerdown', dismissOutside, true);
		document.addEventListener('keydown', dismissEscape);
		return () => {
			window.removeEventListener('resize', update);
			window.removeEventListener('scroll', update, true);
			document.removeEventListener('pointerdown', dismissOutside, true);
			document.removeEventListener('keydown', dismissEscape);
		};
	}, [captureFrame, expanded, onDismiss]);
	const touchExpand = (event: PointerEvent<HTMLDivElement>) => {
		if (event.pointerType !== 'touch' || (event.target instanceof Element && event.target.closest(interactiveSelector))) return;
		expand(event.currentTarget);
	};
	const style = expanded && frame ? {
		'--ts-monitor-expanded-top': `${Math.max(0, frame.top)}px`,
		'--ts-monitor-expanded-left': `${Math.max(0, frame.left)}px`,
		'--ts-monitor-expanded-width': `${Math.min(frame.width, frame.viewportWidth)}px`,
		'--ts-monitor-expanded-height': `${Math.min(Math.max(frame.height, 320), frame.viewportHeight)}px`,
	} as CSSProperties : undefined;
	return <div
		className={`ts-monitor-surface ${className}`.trim()}
		data-expanded={expanded ? 'true' : 'false'}
		data-monitor-surface={id}
		onMouseEnter={(event) => expand(event.currentTarget)}
		onPointerUp={touchExpand}
		ref={surfaceRef}
		style={style}
	>
		{children}
		{expanded ? <button className="ts-monitor-surface__close" type="button" onClick={onDismiss} aria-label={`Close expanded ${label}`}>×<span>Close</span></button> : <button className="ts-monitor-surface__expand" type="button" onClick={(event) => expand(event.currentTarget.parentElement as HTMLElement)} aria-label={`Expand ${label}`}>↗</button>}
	</div>;
}
