import { useState } from 'react';
import type * as React from 'react';
import DynamicPieAllocationInput from '../../pie-allocation/DynamicPieAllocationInput.tsx';
import type { AllocationSnapshot } from '../types.ts';
import { WorkspaceFocusSurface } from '../../workspace-surfaces/WorkspaceFocusSurface.tsx';

type Scope = 'portfolio' | 'agent-class' | 'workday-time';
function duration(seconds: number | null) { if (seconds == null) return '—'; const hours = Math.floor(seconds / 3600); const minutes = Math.round((seconds % 3600) / 60); return hours ? `${hours}h ${minutes}m` : `${minutes}m`; }

export function AllocationManagementPanel({ snapshot, expandedSurface, onExpand, onDismiss }: {
	snapshot: AllocationSnapshot; expandedSurface: string | null; onExpand: (id: string) => void; onDismiss: () => void;
}) {
	const [projectId, setProjectId] = useState(snapshot.projects[0]?.id ?? '');
	const classes = snapshot.agentClasses.filter((item) => item.projectId === projectId);
	const module = (scope: Scope, eyebrow: string, title: string, content: React.ReactNode) => {
		const surfaceId = `allocation:${scope}`;
		return <WorkspaceFocusSurface id={surfaceId} label={title} mode={expandedSurface === surfaceId ? 'focused' : 'inline'} onModeChange={(mode) => mode === 'focused' ? onExpand(surfaceId) : onDismiss()}>
			<section className="ts-allocation-module" aria-label={title} data-scope={scope}>
				<header><span><small>{eyebrow}</small><strong>{title}</strong></span>{scope === 'portfolio' ? <span><small>Available / remaining</small><b>{duration(snapshot.time.availableSeconds)} / {duration(snapshot.time.remainingSeconds)}</b></span> : null}</header>
				<div className="ts-allocation-module__body">{content}</div>
			</section>
		</WorkspaceFocusSurface>;
	};
	return <>
		{module('portfolio', 'Portfolio time', 'Projects', snapshot.projects.length ? <DynamicPieAllocationInput density="monitor" name="projectAllocation" initialValue={snapshot.projects} disabled /> : <p>No project allocation.</p>)}
		{module('agent-class', 'Project time', 'Agent classes', <><label className="ts-allocation-project"><span>Project</span><select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{snapshot.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>{classes.length ? <DynamicPieAllocationInput density="monitor" key={projectId} name="classAllocation" initialValue={classes} disabled /> : <p>No agent classes.</p>}</>)}
		{module('workday-time', 'Workday time', 'Plan · Execute · Reserve', <DynamicPieAllocationInput density="monitor" name="workdayTimeAllocation" initialValue={snapshot.workdayTime} disabled />)}
	</>;
}
