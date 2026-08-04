import type { CSSProperties } from 'react';
import type { CommandEntity, CommandRelation, CommandTimelineEntry } from './types.ts';
import { CommandOverlayTrigger } from './CommandOverlayStack.tsx';

export function CommandMetricStrip({ metrics }: { metrics: Array<{ label: string; value: string | number; detail?: string | null; tone?: string }> }) {
	return <div className="ts-command-metric-strip">{metrics.map((metric) => <div key={metric.label} data-tone={metric.tone}><small>{metric.label}</small><strong>{metric.value}</strong>{metric.detail ? <span>{metric.detail}</span> : null}</div>)}</div>;
}

export function CommandThroughput({ assignments, executions }: { assignments: CommandEntity[]; executions: CommandEntity[] }) {
	const values = Array.from({ length: 12 }, (_, index) => { const cutoff = Date.now() - (11 - index) * 300_000; return { assignments: assignments.filter((item) => Date.parse(item.occurredAt ?? '') <= cutoff).length, executions: executions.filter((item) => Date.parse(item.occurredAt ?? '') <= cutoff).length }; });
	const max = Math.max(1, ...values.flatMap((value) => [value.assignments, value.executions])); const points = (key: 'assignments' | 'executions') => values.map((value, index) => `${index * (100 / 11)},${100 - value[key] / max * 86}`).join(' ');
	return <figure className="ts-command-throughput"><figcaption><span>Intake</span><span>Execution starts</span></figcaption><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Assignment intake and execution throughput"><polyline className="intake" points={points('assignments')} /><polyline className="execution" points={points('executions')} /></svg></figure>;
}

export function CommandRelationGraph({ items, relations }: { items: CommandEntity[]; relations: CommandRelation[] }) {
	const connectedIds = new Set(relations.flatMap((relation) => [relation.from, relation.to]));
	const nodes = items.filter((item) => connectedIds.has(item.id));
	const agents = nodes.filter((item) => item.kind === 'agent');
	const inputs = nodes.filter((item) => item.kind !== 'agent' && relations.some((relation) => relation.from === item.id && agents.some((agent) => agent.id === relation.to)));
	const outputs = nodes.filter((item) => item.kind !== 'agent' && !inputs.some((input) => input.id === item.id));
	const columns = [inputs, agents, outputs]; const width = 960; const gap = 82; const height = Math.max(360, ...columns.map((column) => column.length * gap + 36));
	const position = new Map<string,{ x: number; y: number }>();
	columns.forEach((column, columnIndex) => column.forEach((item, index) => position.set(item.id, { x: 34 + columnIndex * 320, y: 24 + index * gap })));
	return <div className="ts-command-graph"><div className="ts-command-graph__canvas" style={{ '--graph-width': `${width}px`, '--graph-height': `${height}px` } as CSSProperties}><svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`}>{relations.map((relation) => { const from = position.get(relation.from); const to = position.get(relation.to); if (!from || !to) return null; const bend = (from.x + to.x) / 2; return <path key={relation.id} d={`M${from.x + 144},${from.y + 27} H${bend} V${to.y + 27} H${to.x}`} data-tone={relation.tone} />; })}</svg>{nodes.map((item) => { const point = position.get(item.id)!; return <CommandOverlayTrigger className="ts-command-graph__node" dataKind={item.kind} key={item.id} target={item} style={{ '--node-x': `${point.x}px`, '--node-y': `${point.y}px` } as CSSProperties}><span>{item.kind}</span><strong>{item.title}</strong></CommandOverlayTrigger>; })}</div></div>;
}

export function CommandAuditTrail({ entries, timeZone }: { entries: CommandTimelineEntry[]; timeZone: string }) { const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium', timeZone }); return <ol className="ts-command-timeline">{entries.map((entry) => <li key={entry.id}><time dateTime={entry.timestamp}>{formatter.format(new Date(entry.timestamp))}</time><strong>{entry.title}</strong>{entry.description ? <p>{entry.description}</p> : null}</li>)}</ol>; }
