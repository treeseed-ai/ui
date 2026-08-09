import { useEffect, useState, type ReactNode } from 'react';
import { formatTimestamp } from '../../timestamps.ts';
import type { LiveConnectionState, VitalMetricItem } from './types.ts';

export function OperationsStatusBar({ connection, teamName, logoSrc, workdayTitle, activeWorkdays, activeProviders, executionProviders, timeZone, observedAt, onReconnect, density, onDensityChange }: {
	connection: LiveConnectionState | 'connecting'; teamName: string; activeWorkdays: number; activeProviders: number;
	logoSrc?: string; workdayTitle?: string | null; executionProviders: string[]; timeZone: string; observedAt: number; onReconnect?: () => void; density?: 'expanded'|'compact'; onDensityChange?:()=>void;
}) {
	const [lagSeconds, setLagSeconds] = useState(0);
	useEffect(() => {
		const update = () => setLagSeconds(Math.max(0, Math.round((Date.now() - observedAt) / 1_000)));
		update();
		const timer = window.setInterval(update, 1_000);
		return () => window.clearInterval(timer);
	}, [observedAt]);
	return <div className="ts-operations-status" data-status={connection}>
		<a className="ts-operations-status__brand" href="/app/work">{logoSrc ? <img src={logoSrc} alt="" width="25" height="25" /> : null}<span><small>Agent Lab</small><strong>{teamName}</strong></span></a>
		{onDensityChange?<button className="ts-operations-density" type="button" onClick={onDensityChange} aria-label={`${density==='compact'?'Expand':'Compress'} vital metrics`}>{density==='compact'?'Expand':'Compress'}</button>:null}
		<div className="ts-operations-status__primary"><span className="ts-operations-status__connection"><i aria-hidden="true" />{connection === 'live' ? 'Live' : connection === 'snapshot' ? 'Snapshot' : connection}</span><span>{workdayTitle ?? `${activeWorkdays} active workday${activeWorkdays === 1 ? '' : 's'}`}</span><span>{activeProviders} provider{activeProviders === 1 ? '' : 's'}</span><span>Updated {formatTimestamp(observedAt, { timeZone, style: 'time' })} · {lagSeconds < 2 ? 'current' : `${lagSeconds}s lag`}</span></div>
		<details className="ts-operations-status__details"><summary>System info</summary><div><span><small>Execution</small><strong>{executionProviders.join(', ') || 'No provider active'}</strong></span><span><small>Timezone</small><strong>{timeZone}</strong></span><span><small>Connection</small><strong>{connection}</strong></span>{onReconnect ? <button type="button" onClick={onReconnect}>Reconnect</button> : null}</div></details>
		<span className="ts-visually-hidden" aria-live="polite">Connection {connection}</span>
	</div>;
}

export function MonitorToggleRail({ allocation, activity, metrics, onAllocation, onActivity, onMetrics }: { allocation: boolean; activity: boolean; metrics: boolean; onAllocation: () => void; onActivity: () => void; onMetrics: () => void }) {
	return <div className="ts-monitor-toggles" aria-label="Monitoring views">
		<button type="button" aria-pressed={allocation} onClick={onAllocation} title="Toggle capacity allocation"><span aria-hidden="true">◒</span><small>Allocation</small></button>
		<button type="button" aria-pressed={activity} onClick={onActivity} title="Toggle agent activity monitor"><span aria-hidden="true">⌁</span><small>Activity</small></button>
		<button type="button" aria-pressed={metrics} onClick={onMetrics} title="Toggle metric history"><span aria-hidden="true">⌇</span><small>Metrics</small></button>
	</div>;
}

export function VitalMetricRail({ metrics, observedAt, timeZone }: { metrics: VitalMetricItem[]; observedAt: number; timeZone: string }) {
	const groups = [
		{ label: 'Activity', keys: ['agents', 'workdays', 'systemEvents'] },
		{ label: 'Direction', keys: ['assignments', 'executions', 'artifacts'] },
		{ label: 'Status', keys: ['passed', 'failed', 'running'] },
	];
	return <div className="ts-vital-rail__metrics">{groups.map((group) => <section key={group.label} className="ts-vital-bank" data-bank={group.label.toLowerCase()}><h2>{group.label}</h2><div>{group.keys.flatMap((key) => { const metric = metrics.find((item) => item.key === key); const updated = metric?.observedAt ? Date.parse(metric.observedAt) : observedAt; return metric ? [<article key={metric.key} className="ts-vital-metric" data-tone={metric.tone}><small>{metric.label}</small><strong>{metric.value}</strong><span>{metric.secondary ?? semanticLabel(metric.semantic)}</span><time dateTime={new Date(updated).toISOString()}>Data {formatTimestamp(updated, { timeZone, style: 'time' })}</time><a className="ts-vital-metric__link" href={metric.href}>Inspect {metric.label}</a></article>] : []; })}</div></section>)}</div>;
}

function semanticLabel(value: VitalMetricItem['semantic']) { return value === 'instantaneous' ? 'Current state' : value === 'configured' ? 'Configured roster' : value === 'exact-total' ? 'Team total' : 'Cumulative'; }

export function OperationsMonitorDock({ panels, children }: { panels: number; children: ReactNode }) {
	return <div className="ts-monitor-dock" data-panels={panels}>{children}</div>;
}
