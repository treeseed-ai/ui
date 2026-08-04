import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatTimestamp } from '../../timestamps.ts';
import type { DeltaPayload, MetricSeriesPoint, VitalMetricItem } from './types.ts';
import { mergeVersioned, useRealtimeResource } from './use-realtime-resource.ts';
import { rangeStart, TimeRangeControl, type MonitorTimeRange } from './controls/TimeRangeControl.tsx';

interface Props {
	initialSeries: DeltaPayload<MetricSeriesPoint>; endpoint: string; metrics: VitalMetricItem[]; timeZone: string;
	targets: Record<string, number>; targetRevision: string | null; targetEndpoint: string; csrfToken: string;
	canManage: boolean; realtime: { enabled: boolean; intervalMs: number };
}

export function MetricHistoryDashboard({ initialSeries, endpoint, metrics, timeZone, targets: initialTargets, targetRevision: initialRevision, targetEndpoint, csrfToken, canManage, realtime }: Props) {
	const [targets, setTargets] = useState(initialTargets); const [revision, setRevision] = useState(initialRevision); const [message, setMessage] = useState('');
	const [range, setRange] = useState<MonitorTimeRange>('workday');
	const [chartsReady, setChartsReady] = useState(false);
	useEffect(() => setChartsReady(true), []);
	const seriesEndpoint = useCallback((cursor: string | null) => `${endpoint}${cursor ? `${endpoint.includes('?') ? '&' : '?'}cursor=${encodeURIComponent(cursor)}` : ''}`, [endpoint]);
	const parse = useCallback((payload: unknown) => { const delta = payload as DeltaPayload<MetricSeriesPoint>; return { data: delta.upserts, cursor: delta.cursor, removedIds: delta.removedIds }; }, []);
	const series = useRealtimeResource({ initialData: initialSeries.upserts, endpoint: seriesEndpoint, intervalMs: realtime.intervalMs, enabled: realtime.enabled, parse, merge: mergeVersioned });
	const saveTarget = async (event: FormEvent<HTMLFormElement>, key: string) => {
		event.preventDefault(); const form = new FormData(event.currentTarget); const raw = String(form.get('target') ?? '').trim();
		setMessage('Saving target…');
		const response = await fetch(targetEndpoint, { method: 'PATCH', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-treeseed-csrf': csrfToken }, body: JSON.stringify({ targets: { ...targets, [key]: raw ? Number(raw) : null }, expectedRevision: revision }) });
		const body = await response.json().catch(() => ({})); if (!response.ok) { setMessage(body.error ?? 'Target could not be saved.'); return; }
		const payload = body.payload ?? body; setTargets(payload.targets ?? targets); setRevision(payload.revision ?? revision); setMessage(`${metrics.find((metric) => metric.key === key)?.label ?? key} target saved.`);
	};
	const bounds = { start: Math.min(...series.data.map((point) => Date.parse(point.timestamp))), end: Math.max(...series.data.map((point) => Date.parse(point.timestamp))) };
	const visiblePoints = Number.isFinite(bounds.start) ? series.data.filter((point) => Date.parse(point.timestamp) >= rangeStart(range, bounds.start, bounds.end)) : series.data;
	return <section className="ts-metric-dashboard" aria-label="Project metric history">
		<header><div><small>Selected workday telemetry</small><h1>Project signal field</h1><p>Mean activity across every team project, including zero-activity projects. Shaded bands show one population standard deviation.</p></div><div><TimeRangeControl value={range} onChange={setRange} label="Metric grid time range" /><span aria-live="polite">{message}</span></div></header>
		<div className="ts-metric-dashboard__grid">{metrics.map((metric) => <MetricPanel key={metric.key} metric={metric} points={visiblePoints} timeZone={timeZone} target={targets[metric.key]} canManage={canManage} chartsReady={chartsReady} onSave={(event) => saveTarget(event, metric.key)} />)}</div>
	</section>;
}

function MetricPanel({ metric, points, timeZone, target, canManage, chartsReady, onSave }: { metric: VitalMetricItem; points: MetricSeriesPoint[]; timeZone: string; target?: number; canManage: boolean; chartsReady: boolean; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
	const rows = useMemo(() => points.map((point) => { const statistic = point.statistics?.[metric.key]; const value = statistic?.semantic === 'exact-total' ? statistic.exactTotal : statistic?.mean ?? point.values[metric.key] ?? 0; return { timestamp: Date.parse(point.timestamp), mean: value, low: statistic?.low ?? value, range: Math.max(0, (statistic?.high ?? value) - (statistic?.low ?? value)), deviation: statistic?.standardDeviation, semantic: statistic?.semantic ?? metric.semantic, sampleSize: statistic?.sampleSize ?? 0 }; }), [metric.key, metric.semantic, points]);
	const latest = rows.at(-1); const deviation = latest?.deviation;
	return <article className="ts-metric-panel" data-tone={metric.tone}>
		<header><div><small>{metric.label}</small><strong>{formatNumber(latest?.mean ?? metric.value)}</strong></div><span>{latest?.semantic === 'exact-total' ? 'Exact team total · σ n/a' : `${latest?.semantic === 'instantaneous' ? 'Current' : latest?.semantic === 'configured' ? 'Configured' : 'Cumulative'} mean · σ ${formatNumber(deviation ?? 0)} · n=${latest?.sampleSize ?? 0}`}</span></header>
		<div className="ts-metric-panel__chart">{chartsReady && rows.length ? <ResponsiveContainer width="100%" height="100%"><ComposedChart data={rows} margin={{ top: 8, right: 7, bottom: 0, left: -26 }}><CartesianGrid vertical={false} stroke="var(--ts-color-grid)" /><XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} hide /><YAxis allowDecimals /><Tooltip contentStyle={{ background: 'var(--ts-color-surface)', border: '1px solid var(--ts-color-border-strong)', color: 'var(--ts-color-text)' }} labelFormatter={(value) => formatTimestamp(Number(value), { timeZone, style: 'time' })} formatter={(value, name) => [formatNumber(Number(value)), name === 'mean' ? 'Mean' : 'Deviation range']} /><Area dataKey="low" stackId="deviation" fill="transparent" stroke="none" /><Area dataKey="range" stackId="deviation" fill="var(--ts-monitor-band)" stroke="none" isAnimationActive={false} /><Line dataKey="mean" dot={false} stroke="var(--ts-monitor-signal)" strokeWidth={2.4} isAnimationActive={false} type="monotone" />{target !== undefined ? <ReferenceLine y={target} stroke="var(--ts-color-warning)" strokeDasharray="4 3" /> : null}</ComposedChart></ResponsiveContainer> : <p>{rows.length ? `Current ${seriesLabel(latest?.semantic)}: ${formatNumber(latest?.mean ?? metric.value)}` : 'Awaiting telemetry'}</p>}</div>
		<footer><span>{target === undefined ? 'No target' : `Target ${formatNumber(target)}`}</span>{canManage ? <form onSubmit={onSave}><label><span className="ts-visually-hidden">{metric.label} target</span><input name="target" type="number" min="0" step="any" defaultValue={target} placeholder="Target" /></label><button type="submit">Set</button></form> : null}</footer>
	</article>;
}

function formatNumber(value: number) { return Number.isInteger(value) ? String(value) : value.toFixed(1); }
function seriesLabel(semantic: VitalMetricItem['semantic'] | undefined) { return semantic === 'exact-total' ? 'team total' : semantic === 'instantaneous' ? 'state' : semantic === 'configured' ? 'roster mean' : 'cumulative mean'; }
