import { AgentAtlasWorkspace } from '../../../../src/react/agent-atlas/AgentAtlasWorkspace.tsx';
import type { AtlasProjection } from '../../../../src/react/agent-atlas/types.ts';

const projection: AtlasProjection = {
	revision: 'fixture-1', generatedAt: '2026-09-02T12:00:00Z', timeZone: 'America/New_York',
	scope: { teamId: 'team-demo', selectedDate: '2026-09-02', workdayIds: ['workday-demo'], projectIds: ['project-demo'], groupIds: ['group-demo'], agentIds: ['agent-demo'], activityProfiles: ['engineering'], sizingMetric: 'activity' },
	topologies: [{ contract: 'treeseed.agent-topology/v1', revision: 'topology-1', projectId: 'project-demo', immutableRef: 'abc123', capturedAt: '2026-09-02T12:00:00Z', planningGraphRevision: 'graph-1', nodes: [
		{ id: 'project-demo', kind: 'project', projectId: 'project-demo', parentId: null, name: 'Platform', slug: 'platform', capacityClass: null, activityProfile: null, directGroupIds: [], effectiveGroupIds: [], contentPath: null, metadata: {} },
		{ id: 'group-demo', kind: 'group', projectId: 'project-demo', parentId: 'project-demo', name: 'Interface group', slug: 'interface', capacityClass: null, activityProfile: 'engineering', directGroupIds: [], effectiveGroupIds: [], contentPath: null, metadata: {} },
		{ id: 'agent-demo', kind: 'agent', projectId: 'project-demo', parentId: 'group-demo', name: 'UI builder', slug: 'ui-builder', capacityClass: 'interactive', activityProfile: 'engineering', directGroupIds: ['group-demo'], effectiveGroupIds: ['group-demo'], contentPath: 'agents/ui-builder.yaml', metadata: {} },
	], edges: [{ id: 'edge-demo', kind: 'group-membership', fromNodeId: 'group-demo', toNodeId: 'agent-demo', contractId: null, direction: 'relation', metadata: {} }] }],
	nodeStates: [{ nodeId: 'agent-demo', workdayIds: ['workday-demo'], status: 'running', progressPercent: 62, elapsedSeconds: 1200, timeboxSeconds: 3600, metrics: [{ metric: 'activity', rawValue: 8, normalizedValue: .7, unit: 'events' }], activeAssignmentIds: ['assignment-demo'], lastEventSequence: 4, observedAt: '2026-09-02T12:00:00Z' }],
	assignments: [{ id: 'assignment-demo', projectId: 'project-demo', workdayId: 'workday-demo', agentId: 'agent-demo', name: 'Build shared UI', status: 'running', progressPercent: 62, startedAt: '2026-09-02T11:00:00Z', finishedAt: null, decisionId: 'decision-demo', proposalId: 'proposal-demo', graphId: 'graph-demo', graphNodeId: 'node-demo' }],
	activity: [{ id: 'event-demo', workdayId: 'workday-demo', sequence: 4, timestamp: '2026-09-02T12:00:00Z', category: 'execution', direction: 'output', severity: 'info', summary: 'Shared UI workflow rendered', projectId: 'project-demo', agentId: 'agent-demo', activityProfile: 'engineering', signalContractId: null, assignmentId: 'assignment-demo', artifactRefs: [], metadata: {} }],
	workdaySummary: { id: 'workday-demo', title: 'Interface cycle', status: 'running', startedAt: '2026-09-02T11:00:00Z', finishedAt: null, assignments: { total: 1, active: 1, completed: 0, failed: 0, cancelled: 0 }, eventCount: 1, message: 'The interface team is active.' },
	activityWindow: { total: 1, loaded: 1, truncated: false }, playback: { mode: 'live', startedAt: '2026-09-02T11:00:00Z', endedAt: null, liveEdgeAt: '2026-09-02T12:00:00Z', cursor: { cursor: null, observedAt: '2026-09-02T12:00:00Z', positions: {} } }, alerts: [],
};

export default function AgentAtlasHarness() {
	return <AgentAtlasWorkspace initialProjection={projection} endpoints={{ projection: '/api/atlas/projection', delta: '/api/atlas/delta', stream: '', detail: '/api/atlas/detail', assignmentGraphs: '/api/atlas/graphs' }} canManage canDiagnose />;
}
