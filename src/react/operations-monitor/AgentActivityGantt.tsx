import { useMemo, useState, type CSSProperties } from 'react';
import { formatTimestamp } from '../../timestamps.ts';
import type { ActivityIntervalItem } from './types.ts';
import { rangeStart, TimeRangeControl, type MonitorTimeRange } from './controls/TimeRangeControl.tsx';

const kernelOrder = ['planning', 'estimating', 'researching', 'reviewing', 'acting', 'reporting'];

export function AgentActivityGantt({ intervals, start, end, timeZone }: { intervals: ActivityIntervalItem[]; start: string; end: string; timeZone: string }) {
	const [range, setRange] = useState<MonitorTimeRange>('workday'); const workdayStart = Date.parse(start); const endMs = Math.max(workdayStart + 1, Date.parse(end)); const now = Math.min(Date.now(), endMs); const startMs = rangeStart(range, workdayStart, now); const width = Math.max(1, now - startMs);
	const profiles = useMemo(() => [...kernelOrder, ...[...new Set(intervals.map((item) => item.activityProfile))].filter((profile) => !kernelOrder.includes(profile)).sort()], [intervals]);
	const visible = useMemo(() => intervals.filter((interval) => Date.parse(interval.startedAt) <= now && Date.parse(interval.finishedAt ?? new Date(now).toISOString()) >= startMs), [intervals, now, startMs]);
	const groups = useMemo(() => {
		const values = new Map<string, { project: string; agent: string; classId: string; intervals: ActivityIntervalItem[] }>();
		for (const interval of visible) {
			const key = `${interval.projectId}:${interval.agentId}`; const current = values.get(key) ?? { project: interval.projectName, agent: interval.agentName, classId: interval.agentClassId, intervals: [] };
			current.intervals.push(interval); values.set(key, current);
		}
		return [...values.entries()].sort(([, left], [, right]) => left.project.localeCompare(right.project) || left.agent.localeCompare(right.agent));
	}, [visible]);
	const format = (value: number) => formatTimestamp(value, { timeZone, style: 'time' });
	return <section className="ts-activity-gantt" aria-label="Team agent activity">
		<header className="ts-monitor-chart-header"><div><small>Portfolio execution field</small><strong>Agent activity by kernel profile</strong></div><TimeRangeControl value={range} onChange={setRange} label="Agent activity time range" /></header>
		<div className="ts-activity-gantt__axis" aria-hidden="true"><span>{format(startMs)}</span><span>{format(startMs + width / 2)}</span><span>{format(now)}</span></div>
		<div className="ts-activity-gantt__scroll">
			{groups.length ? groups.map(([key, group]) => <div className="ts-activity-gantt__row" key={key} style={{ '--ts-profile-count': profiles.length } as CSSProperties}>
				<div className="ts-activity-gantt__identity" style={{ '--ts-agent-hue': `${Math.abs(hash(group.classId)) % 360}` } as CSSProperties}><small>{group.project}</small><strong>{group.agent}</strong></div>
				<div className="ts-activity-gantt__track">{group.intervals.map((interval) => {
					const left = Math.max(0, (Date.parse(interval.startedAt) - startMs) / width * 100); const finish = interval.finishedAt ? Date.parse(interval.finishedAt) : now;
					const right = Math.min(100, (finish - startMs) / width * 100); const lane = Math.max(0, profiles.indexOf(interval.activityProfile));
					return <a key={interval.id} className={`ts-activity-gantt__bar is-${interval.activityProfile} is-${interval.status}`} style={{ left: `${left}%`, width: `${Math.max(.5, right - left)}%`, top: `${lane * .78 + .25}rem` }} href={`/app/work/assignments?q=${encodeURIComponent(interval.assignmentId)}`} title={`${interval.activityProfile} · ${interval.status}`} aria-label={`${group.agent}, ${interval.activityProfile}, ${interval.status}, ${format(Date.parse(interval.startedAt))} to ${interval.finishedAt ? format(Date.parse(interval.finishedAt)) : 'now'}`} />;
				})}<span className="ts-activity-gantt__now" style={{ left: `${Math.max(0, Math.min(100, (now - startMs) / width * 100))}%` }} /></div>
			</div>) : <p className="ts-activity-gantt__empty">No agent executions intersect the current operating day.</p>}
		</div>
		<details className="ts-activity-gantt__accessible"><summary><span>Activity index</span><small>{visible.length} execution interval{visible.length === 1 ? '' : 's'} in this view</small></summary><div><p>Keyboard-accessible equivalent of the activity field, grouped by the same profile lanes.</p><ul>{visible.map((interval) => <li key={interval.id}><a href={`/app/work/assignments?q=${encodeURIComponent(interval.assignmentId)}`}>{interval.projectName} · {interval.agentName}</a><span>{interval.activityProfile}</span><span>{interval.status}</span><time dateTime={interval.startedAt}>{format(Date.parse(interval.startedAt))}</time><span aria-hidden="true">→</span><time dateTime={interval.finishedAt ?? undefined}>{interval.finishedAt ? format(Date.parse(interval.finishedAt)) : 'now'}</time></li>)}</ul></div></details>
	</section>;
}

function hash(value: string) { let result = 0; for (const character of value) result = ((result << 5) - result + character.charCodeAt(0)) | 0; return result; }
