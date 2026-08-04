import { useCallback, useMemo, useState } from 'react';
import { useRealtimeResource } from '../operations-monitor/use-realtime-resource.ts';
import { CommandCollection } from './CommandCollection.tsx';
import { CommandOverlayStack } from './CommandOverlayStack.tsx';
import { CommandMetricStrip, CommandRelationGraph, CommandThroughput } from './CommandVisuals.tsx';
import { StructuredSourceEditor } from './SourceEditor.tsx';
import type { CommandCollectionPage, CommandEntity, CommandRealtimePreference, CommandWorkspaceEndpoints } from './types.ts';

export interface CommandWorkspaceProps {
	surface: CommandCollectionPage['surface']; initial: CommandCollectionPage; endpoints: CommandWorkspaceEndpoints;
	realtime: CommandRealtimePreference; timeZone: string; query?: string;
}

function SurfaceLead({ surface, data }: { surface: CommandCollectionPage['surface']; data: CommandCollectionPage }) {
	if (surface === 'direction') { const assignments = data.items.filter((item) => item.kind === 'assignment'); const executions = [...data.items, ...(data.secondaryItems ?? [])].filter((item) => item.kind === 'execution'); return <CommandThroughput assignments={assignments} executions={executions} />; }
	if ((surface === 'build' || surface === 'find') && data.relations?.length) return <CommandRelationGraph items={[...data.items, ...(data.secondaryItems ?? [])]} relations={data.relations} />;
	return data.metrics?.length ? <CommandMetricStrip metrics={data.metrics} /> : null;
}

function SimulationLauncher({ endpoint, projectId }: { endpoint?: string; projectId?: string }) { const [scenePath, setScenePath] = useState('scenes/agent-lab/guide-steward.yaml'); const [immutableRef, setImmutableRef] = useState(''); const [message, setMessage] = useState(''); async function launch() { if (!endpoint) return; setMessage('Loading the immutable scene through TreeDX…'); const response = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scenePath, immutableRef, projectId }) }); const result = await response.json(); setMessage(response.ok ? `Production simulation ${String(result.payload?.id ?? '').slice(0, 12)} queued.` : result.error ?? 'Simulation could not be queued.'); } return <form className="ts-command-launcher" onSubmit={(event) => { event.preventDefault(); void launch(); }}><label><span>Scene path</span><input value={scenePath} onChange={(event) => setScenePath(event.target.value)} /></label><label><span>Immutable commit SHA</span><input value={immutableRef} onChange={(event) => setImmutableRef(event.target.value)} /></label><button type="submit" disabled={!endpoint || !immutableRef}>Launch production simulation</button>{message ? <p role="status">{message}</p> : null}</form>; }

function BuildBay({ items, endpoint, stateEndpoint, simulationEndpoint, timeZone }: { items: CommandEntity[]; endpoint: string; stateEndpoint: string; simulationEndpoint?: string; timeZone: string }) {
	const simulations = items.filter((item) => item.kind === 'simulation');
	const projectId = items.find((item) => item.projectId)?.projectId;
	const projectName = items.find((item) => item.projectId === projectId)?.projectName ?? 'Selected project';
	return <section className="ts-command-bay"><header><div><span>Production path</span><h2>Simulation Bay</h2><p>Validate and launch repository scenes against the selected seeded team and workday context.</p></div></header><SimulationLauncher endpoint={simulationEndpoint} projectId={projectId ?? undefined} />{simulations.length ? <CommandCollection items={simulations} splitLabel="simulations" stateEndpoint={stateEndpoint} timeZone={timeZone} /> : <div className="ts-command-empty">No retained simulations match this workday.</div>}<details><summary>Edit a scene or seed definition</summary><StructuredSourceEditor title="Simulation definition" description="Validated at the repository ref and committed with expected-base concurrency." source={'schemaVersion: treeseed.scene/v1\nsetup:\n  seeds: []\n'} projectId={projectId ?? ''} projectName={projectName} path="scenes/agent-lab/browser-draft.yaml" saveEndpoint={`${endpoint}/authoring`} /></details></section>;
}

export function CommandWorkspace({ surface, initial, endpoints, realtime, timeZone, query = '' }: CommandWorkspaceProps) {
	const endpoint = useCallback(() => endpoints.collection, [endpoints.collection]); const parse = useCallback((payload: unknown) => ({ data: payload as CommandCollectionPage }), []);
	const live = useRealtimeResource({ initialData: initial, endpoint, intervalMs: realtime.intervalMs, enabled: realtime.enabled, parse }); const data = live.data;
	const primary = useMemo(() => surface === 'build' ? data.items.filter((item) => item.kind !== 'simulation') : data.items, [data.items, surface]);
	return <div className="ts-command-workspace" data-surface={surface}>
		<header className="ts-command-workspace__lead"><div><span>Agent Lab / {surface}</span><h1>{data.title}</h1><p>{data.description}</p></div><div className="ts-command-workspace__signal" data-status={live.status}><i />{live.status}{live.error ? <button type="button" onClick={live.reconnect}>Reconnect</button> : null}</div></header>
		<SurfaceLead surface={surface} data={data} />
		{surface === 'decisions' ? <div className="ts-command-split"><section><h2>Open proposals</h2><CommandCollection items={primary} splitLabel="open proposals" initialQuery={query} stateEndpoint={endpoints.state} timeZone={timeZone} /></section><section><h2>Recent decisions</h2><CommandCollection items={data.secondaryItems ?? []} splitLabel="recent decisions" stateEndpoint={endpoints.state} timeZone={timeZone} /></section></div> : <CommandCollection items={primary} splitLabel={surface === 'inbox' ? 'actionable records' : `${surface} records`} initialQuery={query} stateEndpoint={endpoints.state} timeZone={timeZone} />}
		{surface === 'direction' && data.secondaryItems?.length ? <section className="ts-command-secondary"><h2>Execution provider stream</h2><CommandCollection items={data.secondaryItems} splitLabel="execution attempts" stateEndpoint={endpoints.state} timeZone={timeZone} /></section> : null}
		{surface === 'build' ? <BuildBay items={data.items} endpoint={endpoints.actions} stateEndpoint={endpoints.state} simulationEndpoint={endpoints.simulations} timeZone={timeZone} /> : null}
		<CommandOverlayStack endpoints={endpoints} realtime={realtime} timeZone={timeZone} />
	</div>;
}
