import { useCallback, useEffect, useMemo, useState } from 'react';
import { AgentActivityGantt } from './AgentActivityGantt.tsx';
import { MetricHistoryChart } from './MetricHistoryChart.tsx';
import { AllocationManagementPanel } from './allocation/AllocationManagementPanel.tsx';
import { MonitorToggleRail, OperationsMonitorDock, OperationsStatusBar, VitalMetricRail } from './MonitorPrimitives.tsx';
import { ExpandableMonitorSurface } from './ExpandableMonitorSurface.tsx';
import type { ActivityIntervalItem, AllocationSnapshot, DeltaPayload, MetricSeriesPoint, MonitorOverview, RealtimePreference, VitalMetricItem } from './types.ts';
import { mergeVersioned, useRealtimeResource } from './use-realtime-resource.ts';
import '../../styles/operations-monitor.css';

interface Props {
	initialOverview: MonitorOverview; initialActivity: DeltaPayload<ActivityIntervalItem>; initialSeries: DeltaPayload<MetricSeriesPoint>;
	initialAllocation: AllocationSnapshot; endpoints: { overview: string; activity: string; metricSeries: string; allocation: string }; preference: RealtimePreference; csrfToken: string; logoSrc?: string;
	metricDestinations: Record<string, string>;
}
const labels: Record<string, string> = { agents: 'Agents', workdays: 'Workdays', systemEvents: 'System events', assignments: 'Assignments', executions: 'Executions', artifacts: 'Artifacts', passed: 'Passed', failed: 'Failed', running: 'Running' };

function storedToggles() { if (typeof window === 'undefined') return { allocation: false, activity: false, metrics: false }; try { return JSON.parse(window.localStorage.getItem('treeseed.agent-lab.monitors') ?? '{}'); } catch { return { allocation: false, activity: false, metrics: false }; } }

export default function OperationsMonitorHeader({ initialOverview, initialActivity, initialSeries, initialAllocation, endpoints, preference, metricDestinations, csrfToken, logoSrc }: Props) {
	const [showAllocation, setShowAllocation] = useState(false); const [showActivity, setShowActivity] = useState(false); const [showMetrics, setShowMetrics] = useState(false);
	const [density,setDensity]=useState<'expanded'|'compact'>('expanded');
	const [expandedSurface, setExpandedSurface] = useState<string | null>(null);
	const dismissSurface = useCallback(() => setExpandedSurface(null), []);
	useEffect(() => { const saved = storedToggles(); setShowAllocation(saved.allocation === true); setShowActivity(saved.activity === true); setShowMetrics(saved.metrics === true); try{setDensity(localStorage.getItem('treeseed.agent-lab.vitals-density')==='compact'?'compact':'expanded')}catch{} }, []);
	const toggleDensity=()=>setDensity(current=>{const next=current==='compact'?'expanded':'compact';try{localStorage.setItem('treeseed.agent-lab.vitals-density',next)}catch{}return next});
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
	return <section className="ts-operations-monitor" data-density={density} data-expanded-surface={expandedSurface ?? undefined} data-scene="agent-lab.monitoring-header">
		<OperationsStatusBar connection={connection} teamName={overview.data.team.name} logoSrc={logoSrc} workdayTitle={overview.data.workdayContext.workdays.find((workday) => workday.id === overview.data.workdayContext.selectedWorkdayId)?.title} activeWorkdays={overview.data.activeWorkdays} activeProviders={overview.data.activeProviders} executionProviders={overview.data.executionProviders} timeZone={overview.data.timeZone} observedAt={checkedAt} onReconnect={liveStatuses.some((status) => status === 'offline' || status === 'degraded') ? reconnect : undefined} density={density} onDensityChange={toggleDensity} />
		<div className="ts-vital-rail">
			<MonitorToggleRail allocation={showAllocation} activity={showActivity} metrics={showMetrics} onAllocation={() => persist(!showAllocation, showActivity, showMetrics)} onActivity={() => persist(showAllocation, !showActivity, showMetrics)} onMetrics={() => persist(showAllocation, showActivity, !showMetrics)} />
			<VitalMetricRail metrics={metrics} observedAt={observedAt} timeZone={overview.data.timeZone} />
		</div>
		{showAllocation || showActivity || showMetrics ? <OperationsMonitorDock panels={(showAllocation ? 3 : 0) + Number(showActivity) + Number(showMetrics)}>
			{showAllocation ? <AllocationManagementPanel initialSnapshot={initialAllocation} endpoint={endpoints.allocation} csrfToken={csrfToken} realtime={{ enabled: preference.enabled, intervalMs: baseMs }} expandedSurface={expandedSurface} onExpand={setExpandedSurface} onDismiss={dismissSurface} /> : null}
			{showActivity ? <ExpandableMonitorSurface id="chart:activity" label="agent activity chart" expanded={expandedSurface === 'chart:activity'} onExpand={setExpandedSurface} onDismiss={dismissSurface}><AgentActivityGantt intervals={activity.data} start={overview.data.operatingDay.start} end={overview.data.operatingDay.end} timeZone={overview.data.timeZone} /></ExpandableMonitorSurface> : null}
			{showMetrics ? <ExpandableMonitorSurface id="chart:metrics" label="metric history chart" expanded={expandedSurface === 'chart:metrics'} onExpand={setExpandedSurface} onDismiss={dismissSurface}><MetricHistoryChart points={series.data} metrics={metrics} timeZone={overview.data.timeZone} /></ExpandableMonitorSurface> : null}
		</OperationsMonitorDock> : null}
	</section>;
}
