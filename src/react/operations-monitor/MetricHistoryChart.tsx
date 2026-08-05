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
		for (const metric of metrics) { const statistic = point.statistics?.[metric.key]; const value = statistic?.semantic === 'exact-total' ? statistic.exactTotal : statistic?.mean ?? point.values[metric.key] ?? 0; const low = statistic?.low ?? value; const high = statistic?.high ?? value; row[metric.key] = toLogScale(value); row[`${metric.key}Low`] = toLogScale(low); row[`${metric.key}Band`] = Math.max(0, toLogScale(high) - toLogScale(low)); }
		return row;
	}), [from, metrics, points]);
	const domain = useMemo(() => metricLogDomain(rows, visible), [rows, visible]);
	return <section className="ts-metric-history" aria-label="Portfolio vital metrics over time">
		<header className="ts-monitor-chart-header"><div><small>Portfolio signal history</small><strong>Operational variation</strong><span>Logarithmic scale · visible data range · deviation bands where applicable.</span></div><TimeRangeControl value={range} onChange={setRange} label="Metric history time range" /></header>
		<div className="ts-metric-history__legend">{metrics.map((metric) => { const statistic = points.at(-1)?.statistics?.[metric.key]; const semantic = statistic?.semantic ?? metric.semantic; const selected = visible.includes(metric.key); return <label key={metric.key} data-selected={selected} title={seriesLabel(semantic)} style={{ '--ts-series-color': colors[metric.key] } as CSSProperties}><input type="checkbox" checked={selected} onChange={() => setVisible((current) => current.includes(metric.key) ? current.filter((key) => key !== metric.key) : [...current, metric.key])} /><i aria-hidden="true" /><strong>{metric.label}</strong><small>{seriesCode(semantic)}{statistic && statistic.sampleSize > 1 ? ` · ${statistic.sampleSize}` : ''}</small></label>; })}</div>
		<div className="ts-metric-history__chart">{rows.length ? <ResponsiveContainer height="100%" width="100%"><ComposedChart data={rows} margin={{ top: 8, right: 14, bottom: 4, left: -8 }}><CartesianGrid stroke="var(--ts-color-grid)" strokeDasharray="3 4" /><XAxis dataKey="timestamp" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={(value) => formatTimestamp(value, { timeZone, style: 'time' })} /><YAxis allowDecimals domain={domain} tickFormatter={(value) => formatNumber(fromLogScale(Number(value)))} /><Tooltip contentStyle={{ background: 'var(--ts-color-surface)', border: '1px solid var(--ts-color-border-strong)', color: 'var(--ts-color-text)' }} labelFormatter={(value) => formatTimestamp(Number(value), { timeZone, style: 'time' })} formatter={(value, name) => [formatNumber(fromLogScale(Number(value))), name]} />{visible.flatMap((key) => points.at(-1)?.statistics?.[key]?.semantic === 'exact-total' ? [] : [<Area key={`${key}-low`} dataKey={`${key}Low`} stackId={`${key}-deviation`} fill="transparent" stroke="none" tooltipType="none" isAnimationActive={false} />, <Area key={`${key}-band`} dataKey={`${key}Band`} stackId={`${key}-deviation`} fill={`color-mix(in srgb, ${colors[key]} 13%, transparent)`} stroke="none" tooltipType="none" isAnimationActive={false} />])}{visible.map((key) => <Line key={key} dataKey={key} name={metrics.find((metric) => metric.key === key)?.label ?? key} dot={false} isAnimationActive={false} stroke={colors[key]} strokeWidth={2.2} type="monotone" />)}</ComposedChart></ResponsiveContainer> : <p>No metric history has been recorded for this workday.</p>}</div>
	</section>;
}

function seriesLabel(semantic: VitalMetricItem['semantic']) { return semantic === 'exact-total' ? 'exact total' : semantic === 'instantaneous' ? 'current mean ± σ' : semantic === 'configured' ? 'configured mean ± σ' : 'cumulative mean ± σ'; }
function seriesCode(semantic: VitalMetricItem['semantic']) { return semantic === 'exact-total' ? 'TOTAL' : semantic === 'instantaneous' ? 'LIVE' : semantic === 'configured' ? 'ROSTER' : 'FLOW'; }
function formatNumber(value: number) { return value >= 1000 ? Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value) : Number.isInteger(value) ? String(value) : value.toFixed(value < 10 ? 1 : 0); }
export function toLogScale(value: number) { return Math.log10(Math.max(0, value) + 1); }
export function fromLogScale(value: number) { return Math.max(0, (10 ** value) - 1); }
export function metricLogDomain(rows: Array<Record<string, number>>, visible: string[]): [number, number] {
	const values = rows.flatMap((row) => visible.map((key) => row[key]).filter(Number.isFinite));
	if (!values.length) return [0, 1];
	const minimum = Math.min(...values); const maximum = Math.max(...values);
	if (minimum === maximum) { const padding = Math.max(.08, maximum * .08); return [Math.max(0, minimum - padding), maximum + padding]; }
	const padding = (maximum - minimum) * .06;
	return [Math.max(0, minimum - padding), maximum + padding];
}
