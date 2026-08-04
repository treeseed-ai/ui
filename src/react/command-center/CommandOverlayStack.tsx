import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { CommandEntityDetail, CommandRealtimePreference, CommandWorkspaceEndpoints } from './types.ts';
import { useRealtimeResource } from '../operations-monitor/use-realtime-resource.ts';
import { CommandDetailViews } from './CommandDetailViews.tsx';
import { readInspectStack, type InspectTarget } from './overlay-navigation.tsx';

export { CommandOverlayTrigger, openCommandOverlay, readInspectStack } from './overlay-navigation.tsx';

function closeTop() { if (history.state?.tsCommandOverlay) { history.back(); return; } const url = new URL(window.location.href); const values = url.searchParams.getAll('inspect'); url.searchParams.delete('inspect'); values.slice(0, -1).forEach((value) => url.searchParams.append('inspect', value)); history.replaceState(history.state, '', url); window.dispatchEvent(new PopStateEvent('popstate')); }

export function CommandActionRail({ detail, onRefresh }: { detail: CommandEntityDetail; onRefresh: () => void }) {
	const [message, setMessage] = useState('');
	async function vote(value: 'support' | 'object') { if (!detail.projectId) return; const reason = window.prompt(`Why do you ${value} this proposal?`) ?? ''; if (!reason) return; setMessage('Recording vote…'); const response = await fetch(`/v1/projects/${encodeURIComponent(detail.projectId)}/proposals/${encodeURIComponent(detail.id)}/vote`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ vote: value, reason, expectedProposalVersion: detail.version }) }); const result = await response.json(); setMessage(response.ok ? `Vote recorded: ${value}.` : result.error ?? 'Vote could not be recorded.'); if (response.ok) onRefresh(); }
	const returnTo = encodeURIComponent(typeof window === 'undefined' ? '/app/work' : `${window.location.pathname}${window.location.search}`); const relation = encodeURIComponent(`${detail.kind}:${detail.id}`); const project = encodeURIComponent(detail.projectId ?? '');
	return <div className="ts-command-action-rail">{detail.permissions?.vote && detail.status === 'voting' ? <><button type="button" data-tone="positive" onClick={() => void vote('support')}>Support</button><button type="button" data-tone="danger" onClick={() => void vote('object')}>Object</button></> : null}{detail.permissions?.note ? <a href={`/app/knowledge?create=note&project=${project}&subject=${relation}&returnTo=${returnTo}`}>Add note</a> : null}{detail.permissions?.question ? <a href={`/app/focus/questions?create=question&project=${project}&subject=${relation}&returnTo=${returnTo}`}>Ask question</a> : null}{message ? <span role="status">{message}</span> : null}</div>;
}

function CommandOverlay({ target, index, top, endpoints, realtime, returnFocus, timeZone }: { target: InspectTarget; index: number; top: boolean; endpoints: CommandWorkspaceEndpoints; realtime: CommandRealtimePreference; returnFocus: HTMLElement | null; timeZone: string }) {
	const pane = useRef<HTMLElement>(null); const endpoint = useCallback(() => `${endpoints.detailBase}/${encodeURIComponent(target.kind)}/${encodeURIComponent(target.id)}`, [endpoints.detailBase, target]);
	const parse = useCallback((payload: unknown) => ({ data: payload as CommandEntityDetail }), []);
	const detail = useRealtimeResource<CommandEntityDetail | null>({ initialData: null, endpoint, intervalMs: realtime.intervalMs, enabled: top && realtime.enabled, parse });
	useEffect(() => { if (!top) return; const prior = returnFocus; const frame = requestAnimationFrame(() => pane.current?.focus()); return () => { cancelAnimationFrame(frame); prior?.focus({ preventScroll: true }); }; }, [returnFocus, top]);
	useEffect(() => { if (!top) return; const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); closeTop(); return; } if (event.key !== 'Tab' || !pane.current) return; const focusable = [...pane.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((element) => !element.hidden); if (!focusable.length) { event.preventDefault(); pane.current.focus(); return; } const first = focusable[0]; const last = focusable.at(-1)!; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }; document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey); }, [top]);
	const item = detail.data;
	return <section ref={pane} role="dialog" aria-modal={top ? 'true' : undefined} aria-label={item?.title ?? `${target.kind} details`} tabIndex={-1} className="ts-command-overlay" data-top={top ? 'true' : 'false'} style={{ '--ts-overlay-depth': index } as CSSProperties} aria-hidden={!top} {...(!top ? { inert: '' as unknown as boolean } : {})}>
		<header className="ts-command-overlay__header"><div><span>{target.kind.replace(/-/gu, ' ')}</span><h2>{item?.title ?? 'Loading command record…'}</h2>{item?.description ? <p>{item.description}</p> : null}</div><div className="ts-command-overlay__controls"><button type="button" onClick={() => navigator.clipboard?.writeText(target.id)}>Copy ID</button><button type="button" className="ts-command-overlay__close" onClick={closeTop} aria-label="Close detail">×</button></div></header>
		<div className="ts-command-overlay__body">{detail.error ? <div className="ts-command-alert" data-tone="danger">{detail.error}<button type="button" onClick={detail.reconnect}>Reconnect</button></div> : null}{item ? <CommandDetailViews detail={item} timeZone={timeZone} authoringEndpoint={`${endpoints.actions}/authoring`} /> : <div className="ts-command-loading">Retrieving the latest evidence…</div>}</div>
		<footer className="ts-command-overlay__footer"><span>{detail.status === 'live' ? 'Live evidence' : detail.status}</span>{item ? <CommandActionRail detail={item} onRefresh={detail.reconnect} /> : null}</footer>
	</section>;
}

export function CommandOverlayStack({ endpoints, realtime, timeZone }: { endpoints: CommandWorkspaceEndpoints; realtime: CommandRealtimePreference; timeZone: string }) {
	const [stack, setStack] = useState<InspectTarget[]>(() => readInspectStack()); const focus = useRef<HTMLElement | null>(null);
	useEffect(() => { const update = () => setStack(readInspectStack()); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update); }, []);
	useEffect(() => { if (stack.length) focus.current ??= document.activeElement as HTMLElement; else focus.current = null; }, [stack.length]);
	const backdrop = useMemo(() => stack.length ? <button type="button" className="ts-command-overlay-backdrop" onClick={closeTop} aria-label="Close detail overlay" /> : null, [stack.length]);
	return <div className="ts-command-overlay-stack" data-open={stack.length ? 'true' : 'false'}>{backdrop}{stack.map((target, index) => <CommandOverlay key={`${index}:${target.kind}:${target.id}`} target={target} index={index} top={index === stack.length - 1} endpoints={endpoints} realtime={realtime} returnFocus={focus.current} timeZone={timeZone} />)}</div>;
}
