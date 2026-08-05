import { useCallback, useEffect, useState } from 'react';
import type * as React from 'react';
import DynamicPieAllocationInput, { type PieAllocationSlice, type PieAllocationValidity } from '../../pie-allocation/DynamicPieAllocationInput.tsx';
import type { AllocationSnapshot } from '../types.ts';
import { useRealtimeResource } from '../use-realtime-resource.ts';
import { ExpandableMonitorSurface } from '../ExpandableMonitorSurface.tsx';

type Scope = 'portfolio' | 'agent-class' | 'workday-time';
function groups(snapshot: AllocationSnapshot) { return Object.fromEntries(snapshot.projects.map((project) => [project.id, snapshot.agentClasses.filter((item) => item.projectId === project.id)])); }
function defaultProject(snapshot: AllocationSnapshot) { return snapshot.projects.find((project) => snapshot.agentClasses.some((item) => item.projectId === project.id))?.id ?? snapshot.projects[0]?.id ?? ''; }
function same(left: PieAllocationSlice[], right: PieAllocationSlice[]) { return left.length === right.length && left.every((item) => Math.abs(item.percentage - (right.find((entry) => entry.id === item.id)?.percentage ?? -1)) < .001); }
function duration(seconds: number | null) { if (seconds == null) return '—'; const hours = Math.floor(seconds / 3600); const minutes = Math.round((seconds % 3600) / 60); return hours ? `${hours}h ${minutes}m` : `${minutes}m`; }

export function AllocationManagementPanel({ initialSnapshot, endpoint, csrfToken, realtime, expandedSurface, onExpand, onDismiss }: { initialSnapshot: AllocationSnapshot; endpoint: string; csrfToken: string; realtime: { enabled: boolean; intervalMs: number }; expandedSurface: string | null; onExpand: (id: string) => void; onDismiss: () => void }) {
	const target = useCallback(() => endpoint, [endpoint]);
	const resource = useRealtimeResource({ initialData: initialSnapshot, endpoint: target, intervalMs: Math.max(10_000, realtime.intervalMs * 2), enabled: realtime.enabled, parse: useCallback((payload: unknown) => ({ data: payload as AllocationSnapshot }), []) });
	const [projectId, setProjectId] = useState(defaultProject(initialSnapshot));
	const [portfolio, setPortfolio] = useState<PieAllocationSlice[]>(initialSnapshot.projects);
	const [classDrafts, setClassDrafts] = useState<Record<string, PieAllocationSlice[]>>(() => groups(initialSnapshot));
	const [workday, setWorkday] = useState<PieAllocationSlice[]>(initialSnapshot.workdayTime);
	const [dirty, setDirty] = useState<Record<string, boolean>>({});
	const [valid, setValid] = useState<Record<string, boolean>>({});
	const [messages, setMessages] = useState<Partial<Record<Scope, string>>>({});
	useEffect(() => {
		if (!dirty.portfolio) setPortfolio(resource.data.projects);
		if (!dirty.workday) setWorkday(resource.data.workdayTime);
		setProjectId((current) => resource.data.projects.some((item) => item.id === current) ? current : defaultProject(resource.data));
		setClassDrafts((current) => { const next = { ...current }; for (const project of resource.data.projects) if (!dirty[`class:${project.id}`]) next[project.id] = resource.data.agentClasses.filter((item) => item.projectId === project.id); return next; });
	}, [dirty, resource.data]);
	const change = (scope: string, baseline: PieAllocationSlice[], update: (next: PieAllocationSlice[]) => void) => (next: PieAllocationSlice[], state: PieAllocationValidity) => { update(next); setDirty((value) => ({ ...value, [scope]: !same(next, baseline) })); setValid((value) => ({ ...value, [scope]: state.valid })); };
	const save = async (scope: Scope) => {
		const key = scope === 'agent-class' ? `class:${projectId}` : scope === 'workday-time' ? 'workday' : 'portfolio';
		const slices = scope === 'portfolio' ? portfolio : scope === 'agent-class' ? classDrafts[projectId] ?? [] : workday;
		setMessages((value) => ({ ...value, [scope]: 'Saving…' }));
		const response = await fetch(endpoint, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-treeseed-csrf': csrfToken }, body: JSON.stringify({ scope, projectId: scope === 'agent-class' ? projectId : undefined, slices, expectedActiveAllocationSetId: resource.data.activeAllocationSetId, requestId: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}` }) });
		const body = await response.json().catch(() => ({}));
		if (!response.ok) { setMessages((value) => ({ ...value, [scope]: body.error ?? 'Could not save.' })); return; }
		resource.replaceData((body.payload ?? body) as AllocationSnapshot); setDirty((value) => ({ ...value, [key]: false })); setMessages((value) => ({ ...value, [scope]: 'Active' }));
	};
	const classes = classDrafts[projectId] ?? [];
	const module = (scope: Scope, eyebrow: string, title: string, content: React.ReactNode, key: string) => { const surfaceId = `allocation:${scope}`; return <ExpandableMonitorSurface id={surfaceId} label={title} expanded={expandedSurface === surfaceId} onExpand={onExpand} onDismiss={onDismiss}><section className="ts-allocation-module" aria-label={title} data-scope={scope}><header><span><small>{eyebrow}</small><strong>{title}</strong></span>{scope === 'portfolio' ? <span><small>Available / remaining</small><b>{duration(resource.data.time.availableSeconds)} / {duration(resource.data.time.remainingSeconds)}</b></span> : null}</header><div className="ts-allocation-module__body">{content}</div><footer><span role="status">{messages[scope]}</span>{resource.data.canManage ? <button type="button" disabled={!dirty[key] || !valid[key]} onClick={() => void save(scope)}>Save</button> : <small>Read only</small>}</footer></section></ExpandableMonitorSurface>; };
	return <>
		{module('portfolio', 'Portfolio time', 'Projects', portfolio.length ? <DynamicPieAllocationInput density="monitor" name="projectAllocation" initialValue={portfolio} disabled={!resource.data.canManage} onChange={change('portfolio', resource.data.projects, setPortfolio)} /> : <p>No project allocation.</p>, 'portfolio')}
		{module('agent-class', 'Project time', 'Agent classes', <><label className="ts-allocation-project"><span>Project</span><select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{resource.data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>{classes.length ? <DynamicPieAllocationInput density="monitor" key={projectId} name="classAllocation" initialValue={classes} disabled={!resource.data.canManage} onChange={change(`class:${projectId}`, resource.data.agentClasses.filter((item) => item.projectId === projectId), (next) => setClassDrafts((value) => ({ ...value, [projectId]: next })))} /> : <p>No agent classes.</p>}</>, `class:${projectId}`)}
		{module('workday-time', 'Workday time', 'Plan · Execute · Reserve', <DynamicPieAllocationInput density="monitor" name="workdayTimeAllocation" initialValue={workday} disabled={!resource.data.canManage} onChange={change('workday', resource.data.workdayTime, setWorkday)} />, 'workday')}
	</>;
}
