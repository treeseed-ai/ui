import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AtlasDocks } from '../../../src/react/agent-atlas/AtlasDocks.tsx';
import { atlasDesignerReturnPath, selectedDefinitionRevision, selectedWorkdayUnavailable } from '../../../src/react/agent-atlas/AgentAtlasWorkspace.tsx';
import type { AtlasActivity, AtlasProjection } from '../../../src/react/agent-atlas/types.ts';

function activity(index: number, routine = false): AtlasActivity {
	return {
		id: `event-${index}`,
		workdayId: 'workday-one',
		sequence: index,
		timestamp: '2026-08-12T12:00:00Z',
		category: routine ? 'execution' : 'signal',
		direction: 'internal',
		severity: 'info',
		summary: routine ? `Workday demand compilation tick ${index}` : `Proposal evidence published ${index}`,
		projectId: 'project-one',
		agentId: 'agent-one',
		activityProfile: 'planning',
		signalContractId: null,
		assignmentId: null,
		artifactRefs: [],
		metadata: { eventType: routine ? 'workday.tick' : 'signal.published' },
	};
}

describe('Atlas event dock', () => {
	it('hides routine traffic by default and pages a bounded live window', () => {
		const events = [...Array.from({ length: 30 }, (_, index) => activity(index)), ...Array.from({ length: 20 }, (_, index) => activity(index + 30, true))];
		render(<AtlasDocks activity={events} activityWindow={{ total: 6_470, loaded: 50, truncated: true }} assignments={[]} timeZone="America/New_York" open="events" onOpen={vi.fn()} onInspect={vi.fn()} onOpenDag={vi.fn()} />);
		const list = screen.getByRole('list');
		expect(within(list).getAllByRole('listitem')).toHaveLength(25);
		expect(screen.getByText('30 matching events in the latest 50 of 6470')).toBeInTheDocument();
		expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
		fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		expect(within(list).getAllByRole('listitem')).toHaveLength(5);
		fireEvent.click(screen.getByRole('checkbox', { name: 'Include routine scheduler activity' }));
		expect(screen.getByText('50 matching events in the latest 50 of 6470')).toBeInTheDocument();
		expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
		expect(within(list).getAllByRole('listitem')).toHaveLength(25);
	});
});

describe('Atlas team-scoped workday selection', () => {
	it('distinguishes an inaccessible requested workday from an ordinary empty team', () => {
		const projection = { scope: { workdayIds: [] } } as unknown as AtlasProjection;
		expect(selectedWorkdayUnavailable(projection, '?focus=atlas&workday=run-from-another-team')).toBe(true);
		expect(selectedWorkdayUnavailable(projection, '?focus=atlas')).toBe(false);
		expect(selectedWorkdayUnavailable({ scope: { workdayIds: ['run-one'] } } as unknown as AtlasProjection, '?workday=run-one')).toBe(false);
	});

	it('resolves historical agent definitions from the selected topology only', () => {
		const projection = { topologies: [{ immutableRef: 'immutable-one', nodes: [{ kind: 'agent', id: 'agent-one@deadbeef' }] }] } as unknown as AtlasProjection;
		expect(selectedDefinitionRevision(projection, { kind: 'agent', id: 'agent-one' })).toBe('immutable-one');
		expect(selectedDefinitionRevision(projection, { kind: 'assignment', id: 'agent-one' })).toBeNull();
	});

	it('accepts only Agent Lab return paths for the Designer handoff', () => {
		expect(atlasDesignerReturnPath('?returnTo=%2Fapp%2Fwork%2Fbuild%3Ffocus%3Ddesigner')).toBe('/app/work/build?focus=designer');
		expect(atlasDesignerReturnPath('?returnTo=%2Fapp%2Fworkevil')).toBe('');
	});
});
