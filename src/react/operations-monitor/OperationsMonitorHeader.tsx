import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { requestJson } from '../../forms-client.ts';
import { AgentActivityGantt } from './AgentActivityGantt.tsx';
import { MetricHistoryChart } from './MetricHistoryChart.tsx';
import { AllocationManagementPanel } from './allocation/AllocationManagementPanel.tsx';
import { MonitorToggleRail, OperationsMonitorDock, OperationsStatusBar, VitalMetricRail } from './MonitorPrimitives.tsx';
import { WorkspaceFocusSurface } from '../workspace-surfaces/WorkspaceFocusSurface.tsx';
import type { ActivityIntervalItem, AllocationSnapshot, DeltaPayload, MetricSeriesPoint, MonitorOverview, RealtimePreference, VitalMetricItem } from './types.ts';
import { mergeVersioned, useRealtimeResource } from './use-realtime-resource.ts';
import '../../styles/operations-monitor.css';

interface Props {
	initialOverview: MonitorOverview; initialActivity: DeltaPayload<ActivityIntervalItem>; initialSeries: DeltaPayload<MetricSeriesPoint>;
		initialAllocation: AllocationSnapshot; endpoints: { overview: string; activity: string; metricSeries: string; allocation: string; viewState?: string }; preference: RealtimePreference; csrfToken: string; logoSrc?: string;
	metricDestinations: Record<string, string>;
}
const labels: Record<string, string> = { agents: 'Agents', workdays: 'Workdays', systemEvents: 'System events', assignments: 'Assignments', executions: 'Executions', artifacts: 'Artifacts', passed: 'Passed', failed: 'Failed', running: 'Running' };

function storedToggles() { if (typeof window === 'undefined') return { allocation: false, activity: false, metrics: false }; try { return JSON.parse(window.localStorage.getItem('treeseed.agent-lab.monitors') ?? '{}'); } catch { return { allocation: false, activity: false, metrics: false }; } }

export default function OperationsMonitorHeader({ initialOverview, initialActivity, initialSeries, initialAllocation, endpoints, preference, metricDestinations, csrfToken, logoSrc }: Props) {
	const [showAllocation, setShowAllocation] = useState(false); const [showActivity, setShowActivity] = useState(false); const [showMetrics, setShowMetrics] = useState(false);
	const [density,setDensity]=useState<'expanded'|'compact'>('expanded');
	const [densityReady,setDensityReady]=useState(!endpoints.viewState);
	const densityTouched=useRef(false);
	const [expandedSurface, setExpandedSurface] = useState<string | null>(null);
	const dismissSurface = useCallback(() => setExpandedSurface(null), []);
	useEffect(() => { const saved = storedToggles(); setShowAllocation(saved.allocation === true); setShowActivity(saved.activity === true); setShowMetrics(saved.metrics === true); }, []);
	useEffect(() => {
		let active=true; let localDensity:'expanded'|'compact'='expanded';
		try { localDensity=localStorage.getItem('treeseed.agent-lab.vitals-density')==='compact'?'compact':'expanded'; } catch {}
		if (!endpoints.viewState) { setDensity(localDensity); setDensityReady(true); return; }
		void fetch(`${endpoints.viewState}?namespace=atlas`,{headers:{accept:'application/json'}}).then(response=>{
			if(!response.ok) throw new Error('view state unavailable'); return response.json();
		}).then(envelope=>{
			if(!active||densityTouched.current)return; const entry=(envelope.payload??[]).find((item:{kind?:string;id?:string})=>item.kind==='atlas-workspace'&&item.id===initialOverview.team.id); const savedDensity=entry?.layout?.vitalDensity;
			if(savedDensity==='expanded'||savedDensity==='compact') setDensity(savedDensity);
			else { setDensity(localDensity); void requestJson(endpoints.viewState!,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({namespace:'atlas',kind:'atlas-workspace',id:initialOverview.team.id,layoutPatch:{vitalDensity:localDensity}})}); }
		}).catch(()=>{if(active&&!densityTouched.current)setDensity(localDensity)}).finally(()=>{if(active)setDensityReady(true)});
		return()=>{active=false};
	},[endpoints.viewState,initialOverview.team.id]);
	const toggleDensity=()=>setDensity(current=>{densityTouched.current=true;const next=current==='compact'?'expanded':'compact';try{localStorage.setItem('treeseed.agent-lab.vitals-density',next)}catch{}if(endpoints.viewState)void requestJson(endpoints.viewState,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({namespace:'atlas',kind:'atlas-workspace',id:initialOverview.team.id,layoutPatch:{vitalDensity:next}})});return next});
	const persist = (allocation: boolean, activity: boolean, metrics: boolean) => { setShowAllocation(allocation); setShowActivity(activity); setShowMetrics(metrics); try { window.localStorage.setItem('treeseed.agent-lab.monitors', JSON.stringify({ allocation, activity, metrics })); } catch {} };
	const baseMs = preference.intervalSeconds * 1_000;
	const overviewEndpoint = useCallback(() => endpoints.overview, [endpoints.overview]);
	const parseOverview = useCallback((payload: unknown) => ({ data: payload as MonitorOverview }), []);
	const overview = useRealtimeResource({ initialData: initialOverview, endpoint: overviewEndpoint, intervalMs: initialOverview.activeWorkdays ? baseMs : Math.max(10_000, baseMs * 2), enabled: preference.enabled, parse: parseOverview });
	const activityEndpoint = useCallback((cursor: string | null) => `${endpoints.activity}${cursor ? `${endpoints.activity.includes('?') ? '&' : '?'}cursor=${encodeURIComponent(cursor)}` : ''}`, [endpoints.activity]);
	const seriesEndpoint = useCallback((cursor: string | null) => `${endpoints.metricSeries}${cursor ? `${endpoints.metricSeries.includes('?') ? '&' : '?'}cursor=${encodeURIComponent(cursor)}` : ''}`, [endpoints.metricSeries]);
	const parseActivity = useCallback((payload: unknown) => { const delta = payload as DeltaPayload<ActivityIntervalItem>; return { data: delta.upserts, cursor: delta.cursor, removedIds: delta.removedIds }; }, []);
	const parseSeries = useCallback((payload: unknown) => { const delta = payload as DeltaPayload<MetricSeriesPoint>; return { data: delta.upserts, cursor: delta.cursor, removedIds: delta.removedIds }; }, []);
	const activity = useRealtimeResource({ initialData: initialActivity.upserts, endpoint: activityEndpoint, intervalMs: overview.data.activeWorkdays ? baseMs : Math.max(10_000, baseMs * 2), enabled: preference.enabled && showActivity, parse: parseActivity, merge: mergeVersioned });
	const series = useRealtimeResource({ initialData: initialSeries.upserts, endpoint: seriesEndpoint, intervalMs: Math.max(10_000, baseMs * 2), enabled: preference.enabled && showMetrics, parse: parseSeries, merge: mergeVersioned });
	const metrics = useMemo<VitalMetricItem[]>(() => overview.data.metrics.map((metric) => ({ ...metric, label: labels[metric.key] ?? metric.key, href: metricDestinations[metric.key] ?? '/app/work', tone: metric.key === 'failed' && metric.value ? 'danger' : metric.key === 'running' && metric.value ? 'positive' : 'default' })), [overview.data.metrics, metricDestinations]);
	const liveStatuses = [overview.status, ...(showActivity ? [activity.status] : []), ...(showMetrics ? [series.status] : [])];
	const connection = !preference.enabled ? 'snapshot' : liveStatuses.includes('offline') ? 'offline' : liveStatuses.includes('degraded') ? 'degraded' : liveStatuses.includes('connecting') ? 'connecting' : overview.data.connectivity;
	const reconnect = () => { overview.reconnect(); if (showActivity) activity.reconnect(); if (showMetrics) series.reconnect(); };
	const checkedAt = overview.lastUpdatedAt ?? Date.parse(overview.data.generatedAt); const observedAt = Date.parse(overview.data.generatedAt);
	return <section className="ts-operations-monitor" data-density={density} data-density-ready={densityReady} data-expanded-surface={expandedSurface ?? undefined} data-scene="agent-lab.monitoring-header">
		<OperationsStatusBar connection={connection} teamName={overview.data.team.name} logoSrc={logoSrc} workdayTitle={overview.data.workdayContext.workdays.find((workday) => workday.id === overview.data.workdayContext.selectedWorkdayId)?.title} activeWorkdays={overview.data.activeWorkdays} activeProviders={overview.data.activeProviders} executionProviders={overview.data.executionProviders} timeZone={overview.data.timeZone} observedAt={checkedAt} onReconnect={liveStatuses.some((status) => status === 'offline' || status === 'degraded') ? reconnect : undefined} density={density} onDensityChange={toggleDensity} />
		<div className="ts-vital-rail">
			<MonitorToggleRail allocation={showAllocation} activity={showActivity} metrics={showMetrics} onAllocation={() => persist(!showAllocation, showActivity, showMetrics)} onActivity={() => persist(showAllocation, !showActivity, showMetrics)} onMetrics={() => persist(showAllocation, showActivity, !showMetrics)} />
			<VitalMetricRail metrics={metrics} observedAt={observedAt} timeZone={overview.data.timeZone} />
		</div>
		{showAllocation || showActivity || showMetrics ? <OperationsMonitorDock panels={(showAllocation ? 3 : 0) + Number(showActivity) + Number(showMetrics)}>
			{showAllocation ? <AllocationManagementPanel initialSnapshot={initialAllocation} endpoint={endpoints.allocation} csrfToken={csrfToken} realtime={{ enabled: preference.enabled, intervalMs: baseMs }} expandedSurface={expandedSurface} onExpand={setExpandedSurface} onDismiss={dismissSurface} /> : null}
			{showActivity ? <WorkspaceFocusSurface id="chart:activity" label="agent activity chart" mode={expandedSurface === 'chart:activity' ? 'focused' : 'inline'} onModeChange={(mode) => mode === 'focused' ? setExpandedSurface('chart:activity') : dismissSurface()}><AgentActivityGantt intervals={activity.data} start={overview.data.operatingDay.start} end={overview.data.operatingDay.end} timeZone={overview.data.timeZone} /></WorkspaceFocusSurface> : null}
			{showMetrics ? <WorkspaceFocusSurface id="chart:metrics" label="metric history chart" mode={expandedSurface === 'chart:metrics' ? 'focused' : 'inline'} onModeChange={(mode) => mode === 'focused' ? setExpandedSurface('chart:metrics') : dismissSurface()}><MetricHistoryChart points={series.data} metrics={metrics} timeZone={overview.data.timeZone} /></WorkspaceFocusSurface> : null}
		</OperationsMonitorDock> : null}
	</section>;
}
