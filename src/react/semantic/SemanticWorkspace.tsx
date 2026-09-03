import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ROOT_WORKSPACES, activeSurface, coreUiRegistry, createWorkspaceState, workspaceReducer, type WorkspaceId } from '../../lib/foundation/contracts.ts';
import type { SemanticItem, SemanticRegionData, SemanticWorkspaceProps } from './types.ts';

function Item({ item, onOpen }: { item: SemanticItem; onOpen: () => void }) {
	const body = <><strong>{item.title}</strong>{item.status ? <span className="ts-semantic-item__status">{item.status}</span> : null}{item.description ? <p>{item.description}</p> : null}{item.meta ? <small>{item.meta}</small> : null}</>;
	return item.href ? <a className="ts-semantic-item" href={item.href}>{body}</a> : <button className="ts-semantic-item" type="button" onClick={onOpen}>{body}</button>;
}

function Region({ definition, data, onOpen }: { definition: ReturnType<typeof coreUiRegistry.view>['regions'][number]; data?: SemanticRegionData; onOpen: (item: SemanticItem) => void }) {
	const items = data?.items ?? [];
	return <section className="ts-semantic-region" data-region-type={definition.type} aria-labelledby={`region-${definition.id}`}>
		<header><span>{definition.type}</span><h2 id={`region-${definition.id}`}>{definition.label ?? definition.id}</h2></header>
		{data?.content ? <div className="ts-semantic-region__content">{data.content}</div> : null}
		{items.length ? <div className="ts-semantic-region__items">{items.map((item) => <Item key={item.id} item={item} onOpen={() => onOpen(item)} />)}</div> : !data?.content ? <div className="ts-semantic-empty"><strong>{data?.emptyTitle ?? 'Nothing to show'}</strong><p>{data?.emptyDescription ?? 'This surface has no visible items.'}</p></div> : null}
	</section>;
}

export function SemanticWorkspace({ viewId, context = {}, regions = {}, onAction, onNavigate, className = '' }: SemanticWorkspaceProps) {
	const initialRoot = ROOT_WORKSPACES.includes(viewId as WorkspaceId) ? viewId as WorkspaceId : 'team';
	const [state, dispatch] = useReducer(workspaceReducer, createWorkspaceState(context));
	const [paletteOpen, setPaletteOpen] = useState(false), [query, setQuery] = useState(''), [busy, setBusy] = useState<string>();
	const paletteRef = useRef<HTMLInputElement>(null), view = coreUiRegistry.view(viewId), current = activeSurface(state);
	const commands = useMemo(() => coreUiRegistry.search(query), [query]);
	useEffect(() => { dispatch({ type: 'switch', workspace: initialRoot }); }, [initialRoot]);
	useEffect(() => {
		const keydown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setPaletteOpen((value) => !value); }
			else if (event.key === 'Escape') { if (paletteOpen) setPaletteOpen(false); else dispatch({ type: 'close' }); }
		};
		document.addEventListener('keydown', keydown); return () => document.removeEventListener('keydown', keydown);
	}, [paletteOpen]);
	useEffect(() => { if (paletteOpen) paletteRef.current?.focus(); }, [paletteOpen]);
	const navigate = (target: string) => { setPaletteOpen(false); if (onNavigate) onNavigate(target); else { const targetView = coreUiRegistry.view(target); if (targetView.route) window.location.assign(targetView.route); else dispatch({ type: 'open', route: { kind: target as typeof current.route.kind, viewId: target } }); } };
	const act = async (id: string) => { if (!onAction) return; setBusy(id); try { await onAction(id, context.focusedResource?.id); } finally { setBusy(undefined); } };
	return <section className={`ts-semantic-workspace ${className}`.trim()} data-view={view.id} data-layout={view.layout}>
		<header className="ts-semantic-workspace__header"><div><span>{view.context}</span><h1>{view.label}</h1></div><nav aria-label="Core workspaces">{ROOT_WORKSPACES.map((root) => <button key={root} type="button" aria-current={view.id === root ? 'page' : undefined} onClick={() => navigate(root)}>{coreUiRegistry.view(root).label}</button>)}</nav><button type="button" onClick={() => setPaletteOpen(true)} aria-keyshortcuts="Control+K Meta+K">Search commands</button></header>
		<div className="ts-semantic-workspace__regions">{view.regions.map((region) => <Region key={region.id} definition={region} data={regions[region.id]} onOpen={(item) => dispatch({ type: 'open', route: { kind: (region.resource ?? 'content') as typeof current.route.kind, id: item.id }, focusId: item.id })} />)}</div>
		{view.actions?.length ? <footer className="ts-semantic-workspace__actions">{view.actions.map((id) => { const definition = coreUiRegistry.action(id); return <button key={id} type="button" data-intent={definition.intent ?? 'default'} disabled={busy === id || !onAction} onClick={() => void act(id)}>{busy === id ? 'Working…' : definition.label}</button>; })}</footer> : null}
		{current.route.kind !== state.activeWorkspace ? <aside className="ts-semantic-overlay" role="dialog" aria-modal="true" aria-label={`${current.route.kind} detail`}><button type="button" onClick={() => dispatch({ type: 'close' })}>Close</button><h2>{current.route.id ?? current.route.kind}</h2><p>This resource remains in the current workspace stack so closing it restores the prior selection.</p></aside> : null}
		{paletteOpen ? <div className="ts-semantic-palette" role="dialog" aria-modal="true" aria-label="Command search"><label>Search commands<input ref={paletteRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div>{commands.map((command) => <button key={command.id} type="button" onClick={() => navigate(command.target)}>{command.label}</button>)}</div><button type="button" onClick={() => setPaletteOpen(false)}>Close</button></div> : null}
	</section>;
}

export default SemanticWorkspace;
