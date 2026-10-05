import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CommandEntityDetail, CommandRealtimePreference, CommandWorkspaceEndpoints } from './types.ts';
import { useRealtimeResource } from '../operations-monitor/use-realtime-resource.ts';
import { CommandDetailViews } from './CommandDetailViews.tsx';
import { DiscussionComposer } from './detail/DiscussionComposer.tsx';
import { ProposalGovernanceActions } from './detail/ProposalGovernanceActions.tsx';
import { QuestionAnswerComposer } from './detail/QuestionAnswerComposer.tsx';
import { readInspectStack, type InspectTarget } from './overlay-navigation.tsx';
import { WorkspaceOverlay } from '../workspace-surfaces/WorkspaceOverlay.tsx';
import { closeTopWorkspaceOverlay, requestWorkspaceExit } from '../workspace-surfaces/workspace-navigation.ts';

export { CommandOverlayTrigger, openCommandOverlay, readInspectStack } from './overlay-navigation.tsx';

export function CommandActionRail({ detail, onRefresh, endpoints }: { detail: CommandEntityDetail; onRefresh: () => void; endpoints: CommandWorkspaceEndpoints }) {
	const [composer,setComposer] = useState<'support'|'concern'|'question'|'answer'|null>(null);
	const returnTo = encodeURIComponent(typeof window === 'undefined' ? '/app/work' : `${window.location.pathname}${window.location.search}`); const relation = encodeURIComponent(`${detail.kind}:${detail.id}`); const project = encodeURIComponent(detail.projectId ?? '');
	return <div className="ts-command-action-rail">{detail.kind === 'proposal' ? <ProposalGovernanceActions detail={detail} onSaved={onRefresh} /> : null}{detail.permissions?.answer?<button type="button" data-tone="positive" onClick={()=>setComposer('answer')}>Answer question</button>:null}{detail.kind === 'proposal' && detail.permissions?.note ? <button type="button" onClick={() => setComposer('support')}>Add note</button> : detail.permissions?.note ? <a href={`/app/knowledge?create=note&project=${project}&subject=${relation}&returnTo=${returnTo}`}>Add note</a> : null}{detail.kind === 'proposal' && detail.permissions?.question ? <button type="button" onClick={() => setComposer('question')}>Ask question</button> : detail.permissions?.question ? <a href={`/app/work/inbox?create=question&project=${project}&subject=${relation}&returnTo=${returnTo}`}>Ask question</a> : null}{composer&&composer!=='answer' ? <DiscussionComposer detail={detail} initialKind={composer} onClose={() => setComposer(null)} onSaved={onRefresh} /> : null}{composer==='answer'?<QuestionAnswerComposer detail={detail} endpoint={`${endpoints.actions.replace(/\/surfaces\/[^/]+$/u,'')}/questions/answer`} onClose={()=>setComposer(null)} onSaved={onRefresh}/>:null}</div>;
}

function CommandOverlay({ target, index, top, endpoints, realtime, timeZone }: { target: InspectTarget; index: number; top: boolean; endpoints: CommandWorkspaceEndpoints; realtime: CommandRealtimePreference; timeZone: string }) {
	const endpoint = useCallback(() => `${endpoints.detailBase}/${encodeURIComponent(target.kind)}/${encodeURIComponent(target.id)}`, [endpoints.detailBase, target]);
	const parse = useCallback((payload: unknown) => ({ data: payload as CommandEntityDetail }), []);
	const detail = useRealtimeResource<CommandEntityDetail | null>({ initialData: null, endpoint, intervalMs: realtime.intervalMs, enabled: top && realtime.enabled, parse });
	const item = detail.data;
	return <WorkspaceOverlay reference={{kind:target.kind==='simulation'?'simulation':target.kind==='agent'?'designer':'detail',id:target.id}} label={item?.title ?? `${target.kind} details`} top={top} depth={index} onClose={closeTopWorkspaceOverlay} className="ts-command-overlay">
		<header className="ts-command-overlay__header"><div><span>{target.kind.replace(/-/gu, ' ')}</span><h2>{item?.title ?? 'Loading command record…'}</h2>{item?.description ? <p>{item.description}</p> : null}</div><div className="ts-command-overlay__controls"><button type="button" onClick={() => navigator.clipboard?.writeText(target.id)}>Copy ID</button><button type="button" className="ts-command-overlay__close" onClick={closeTopWorkspaceOverlay} aria-label="Close detail">×</button></div></header>
		<div className="ts-command-overlay__body">{detail.error ? <div className="ts-command-alert" data-tone="danger">{detail.error}<button type="button" onClick={detail.reconnect}>Reconnect</button></div> : null}{item ? <CommandDetailViews detail={item} timeZone={timeZone} authoringEndpoint={`${endpoints.actions}/authoring`} onRefresh={detail.reconnect} /> : <div className="ts-command-loading">Retrieving the latest evidence…</div>}</div>
		<footer className="ts-command-overlay__footer"><span>{detail.status === 'live' ? 'Live evidence' : detail.status}</span>{item ? <CommandActionRail detail={item} onRefresh={detail.reconnect} endpoints={endpoints} /> : null}</footer>
		</WorkspaceOverlay>;
}

export function CommandOverlayStack({ endpoints, realtime, timeZone }: { endpoints: CommandWorkspaceEndpoints; realtime: CommandRealtimePreference; timeZone: string }) {
	const [stack, setStack] = useState<InspectTarget[]>(() => readInspectStack());
	const stackRef = useRef(stack);
	useEffect(() => { stackRef.current = stack; }, [stack]);
	useEffect(() => {
		const update = () => {
			const next = readInspectStack();
			const previousTop = stackRef.current.at(-1);
			const removedByBrowser = previousTop && !next.some((target) => target.kind === previousTop.kind && target.id === previousTop.id);
			if (removedByBrowser && !requestWorkspaceExit(previousTop.id)) { history.forward(); return; }
			stackRef.current = next; setStack(next);
		};
		window.addEventListener('popstate', update);
		return () => window.removeEventListener('popstate', update);
	}, []);
	const backdrop = useMemo(() => stack.length ? <button type="button" className="ts-command-overlay-backdrop" onClick={closeTopWorkspaceOverlay} aria-label="Close detail overlay" /> : null, [stack.length]);
	return <div className="ts-command-overlay-stack" data-open={stack.length ? 'true' : 'false'}>{backdrop}{stack.map((target, index) => <CommandOverlay key={`${index}:${target.kind}:${target.id}`} target={target} index={index} top={index === stack.length - 1} endpoints={endpoints} realtime={realtime} timeZone={timeZone} />)}</div>;
}
