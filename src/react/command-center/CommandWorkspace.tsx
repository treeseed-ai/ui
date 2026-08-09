import { useCallback, useMemo } from 'react';
import { useRealtimeResource } from '../operations-monitor/use-realtime-resource.ts';
import { CommandCollection } from './CommandCollection.tsx';
import { CommandOverlayStack } from './CommandOverlayStack.tsx';
import { CommandMetricStrip, CommandRelationGraph, CommandThroughput } from './CommandVisuals.tsx';
import { AgentFlowCanvas } from './flow/AgentFlowCanvas.tsx';
import { SimulationBay } from './simulation/SimulationBay.tsx';
import type { CommandCollectionPage, CommandEntity, CommandRealtimePreference, CommandWorkspaceEndpoints } from './types.ts';

export interface CommandWorkspaceProps {
	surface: CommandCollectionPage['surface']; initial: CommandCollectionPage; endpoints: CommandWorkspaceEndpoints;
	realtime: CommandRealtimePreference; timeZone: string; query?: string;
}

function SurfaceLead({ surface, data, stateEndpoint, authoringEndpoint }: { surface: CommandCollectionPage['surface']; data: CommandCollectionPage; stateEndpoint: string; authoringEndpoint: string }) {
	if (surface === 'direction') { const assignments = data.items.filter((item) => item.kind === 'assignment'); const executions = [...data.items, ...(data.secondaryItems ?? [])].filter((item) => item.kind === 'execution'); return <CommandThroughput assignments={assignments} executions={executions} />; }
	if (surface === 'build') return <AgentFlowCanvas items={[...data.items, ...(data.secondaryItems ?? [])]} relations={data.relations ?? []} stateEndpoint={stateEndpoint} authoringEndpoint={`${authoringEndpoint}/authoring`} />;
	if (surface === 'find' && data.relations?.length) return <CommandRelationGraph items={[...data.items, ...(data.secondaryItems ?? [])]} relations={data.relations} />;
	return data.metrics?.length ? <CommandMetricStrip metrics={data.metrics} /> : null;
}


export function CommandWorkspace({ surface, initial, endpoints, realtime, timeZone, query = '' }: CommandWorkspaceProps) {
	const endpoint = useCallback(() => endpoints.collection, [endpoints.collection]); const parse = useCallback((payload: unknown) => ({ data: payload as CommandCollectionPage }), []);
	const live = useRealtimeResource({ initialData: initial, endpoint, intervalMs: realtime.intervalMs, enabled: realtime.enabled, parse }); const data = live.data;
	const primary = useMemo(() => surface === 'build' ? data.items.filter((item) => item.kind !== 'simulation') : data.items, [data.items, surface]);
	return <div className="ts-command-workspace" data-surface={surface}>
		<header className="ts-command-workspace__lead"><div><span>Agent Lab / {surface}</span><h1>{data.title}</h1><p>{data.description}</p></div><div className="ts-command-workspace__signal" data-status={live.status}><i />{live.status}{live.error ? <button type="button" onClick={live.reconnect}>Reconnect</button> : null}</div></header>
		<SurfaceLead surface={surface} data={data} stateEndpoint={endpoints.state} authoringEndpoint={endpoints.actions} />
		{surface === 'decisions' ? <div className="ts-command-split"><section><h2>Open proposals</h2><CommandCollection items={primary} splitLabel="open proposals" initialQuery={query} stateEndpoint={endpoints.state} timeZone={timeZone} /></section><section><h2>Recent decisions</h2><CommandCollection items={data.secondaryItems ?? []} splitLabel="recent decisions" stateEndpoint={endpoints.state} timeZone={timeZone} /></section></div> : <CommandCollection items={primary} splitLabel={surface === 'inbox' ? 'actionable records' : `${surface} records`} initialQuery={query} stateEndpoint={endpoints.state} timeZone={timeZone} />}
		{surface === 'direction' && data.secondaryItems?.length ? <section className="ts-command-secondary"><h2>Execution provider stream</h2><CommandCollection items={data.secondaryItems} splitLabel="execution attempts" stateEndpoint={endpoints.state} timeZone={timeZone} /></section> : null}
		{surface === 'build' ? <SimulationBay items={data.items} endpoints={endpoints} stateEndpoint={endpoints.state} timeZone={timeZone} /> : null}
		<CommandOverlayStack endpoints={endpoints} realtime={realtime} timeZone={timeZone} />
	</div>;
}
