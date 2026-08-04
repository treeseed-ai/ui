import { useMemo, useState, type CSSProperties } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatTimestamp } from '../../timestamps.ts';
import type { MetricSeriesPoint, VitalMetricItem } from './types.ts';
import { rangeStart, TimeRangeControl, type MonitorTimeRange } from './controls/TimeRangeControl.tsx';

const colors: Record<string, string> = {
	agents: 'var(--ts-color-accent)', workdays: 'var(--ts-color-info)', systemEvents: 'var(--ts-color-warning)',
	assignments: '#8b7cff', executions: '#20c7e8', artifacts: '#f0a84b', passed: 'var(--ts-color-success)',
	failed: 'var(--ts-color-danger)', running: '#7ce7c4',
};

export function MetricHistoryChart({ points, metrics, timeZone }: { points: MetricSeriesPoint[]; metrics: VitalMetricItem[]; timeZone: string }) {
	const defaults = ['assignments', 'running', 'passed', 'failed']; const [visible, setVisible] = useState(defaults); const [range, setRange] = useState<MonitorTimeRange>('workday');
	const bounds = useMemo(() => ({ start: Math.min(...points.map((point) => Date.parse(point.timestamp))), end: Math.max(...points.map((point) => Date.parse(point.timestamp))) }), [points]);
	const from = Number.isFinite(bounds.start) ? rangeStart(range, bounds.start, bounds.end) : 0;
	const rows = useMemo(() => points.filter((point) => Date.parse(point.timestamp) >= from).map((point) => {
		const row: Record<string, number> = { timestamp: Date.parse(point.timestamp) };
		for (const metric of metrics) { const statistic = point.statistics?.[metric.key]; const value = statistic?.semantic === 'exact-total' ? statistic.exactTotal : statistic?.mean ?? point.values[metric.key] ?? 0; row[metric.key] = value; row[`${metric.key}Low`] = statistic?.low ?? value; row[`${metric.key}Band`] = Math.max(0, (statistic?.high ?? value) - (statistic?.low ?? value)); }
		return row;
	}), [from, metrics, points]);
	return <section className="ts-metric-history" aria-label="Portfolio vital metrics over time">
		<header className="ts-monitor-chart-header"><div><small>Portfolio signal history</small><strong>Project mean and deviation</strong><span>Workdays and system events remain exact team totals.</span></div><TimeRangeControl value={range} onChange={setRange} label="Metric history time range" /></header>
		<div className="ts-metric-history__legend">{metrics.map((metric) => { const statistic = points.at(-1)?.statistics?.[metric.key]; return <label key={metric.key} style={{ '--ts-series-color': colors[metric.key] } as CSSProperties}><input type="checkbox" checked={visible.includes(metric.key)} onChange={() => setVisible((current) => current.includes(metric.key) ? current.filter((key) => key !== metric.key) : [...current, metric.key])} /><i aria-hidden="true" /><span>{metric.label}</span><small>{seriesLabel(statistic?.semantic ?? metric.semantic)}{statistic && statistic.sampleSize > 1 ? ` · n=${statistic.sampleSize}` : ''}</small></label>; })}</div>
		<div className="ts-metric-history__chart">{rows.length ? <ResponsiveContainer height="100%" width="100%"><ComposedChart data={rows} margin={{ top: 8, right: 14, bottom: 4, left: -16 }}><CartesianGrid stroke="var(--ts-color-grid)" strokeDasharray="3 4" /><XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={(value) => formatTimestamp(value, { timeZone, style: 'time' })} /><YAxis allowDecimals={false} /><Tooltip contentStyle={{ background: 'var(--ts-color-surface)', border: '1px solid var(--ts-color-border-strong)', color: 'var(--ts-color-text)' }} labelFormatter={(value) => formatTimestamp(Number(value), { timeZone, style: 'time' })} />{visible.flatMap((key) => points.at(-1)?.statistics?.[key]?.semantic === 'exact-total' ? [] : [<Area key={`${key}-low`} dataKey={`${key}Low`} stackId={`${key}-deviation`} fill="transparent" stroke="none" isAnimationActive={false} />, <Area key={`${key}-band`} dataKey={`${key}Band`} stackId={`${key}-deviation`} fill={`color-mix(in srgb, ${colors[key]} 13%, transparent)`} stroke="none" isAnimationActive={false} />])}{visible.map((key) => <Line key={key} dataKey={key} name={metrics.find((metric) => metric.key === key)?.label ?? key} dot={false} isAnimationActive={false} stroke={colors[key]} strokeWidth={2.2} type="monotone" />)}</ComposedChart></ResponsiveContainer> : <p>No metric history has been recorded for this workday.</p>}</div>
	</section>;
}

function seriesLabel(semantic: VitalMetricItem['semantic']) { return semantic === 'exact-total' ? 'exact total' : semantic === 'instantaneous' ? 'current mean ± σ' : semantic === 'configured' ? 'configured mean ± σ' : 'cumulative mean ± σ'; }
