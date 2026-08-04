import type { CSSProperties, ReactNode } from 'react';
import type { CommandEntityKind } from './types.ts';

export interface InspectTarget { kind: CommandEntityKind; id: string }

function encode(target: InspectTarget) {
	return `${target.kind}~${btoa(unescape(encodeURIComponent(target.id))).replace(/=+$/u, '').replace(/\+/gu, '-').replace(/\//gu, '_')}`;
}

function decode(value: string): InspectTarget | null {
	const split = value.indexOf('~');
	if (split < 1) return null;
	try {
		const raw = value.slice(split + 1).replace(/-/gu, '+').replace(/_/gu, '/');
		return { kind: value.slice(0, split) as CommandEntityKind, id: decodeURIComponent(escape(atob(raw.padEnd(Math.ceil(raw.length / 4) * 4, '=')))) };
	} catch {
		return null;
	}
}

export function readInspectStack(search?: string) {
	const value = search ?? (typeof window === 'undefined' ? '' : window.location.search);
	return new URLSearchParams(value).getAll('inspect').flatMap((entry) => {
		const item = decode(entry);
		return item ? [item] : [];
	});
}

export function openCommandOverlay(target: InspectTarget) {
	const url = new URL(window.location.href);
	url.searchParams.append('inspect', encode(target));
	history.pushState({ ...history.state, tsCommandOverlay: true }, '', url);
	window.dispatchEvent(new PopStateEvent('popstate'));
}

export function CommandOverlayTrigger({ target, children, className, style, dataKind }: { target: InspectTarget; children: ReactNode; className?: string; style?: CSSProperties; dataKind?: string }) {
	return <button type="button" aria-haspopup="dialog" className={className} style={style} data-kind={dataKind} onClick={() => openCommandOverlay(target)}>{children}</button>;
}
