const observedAt = '2026-09-02T12:00:00.000Z';
const metricKeys = ['agents', 'workdays', 'systemEvents', 'assignments', 'executions', 'artifacts', 'passed', 'failed', 'running'];

export const agentLabMetricDestinations = Object.fromEntries(metricKeys.map((key) => [key, '#']));
export const agentLabFrame: any = {
	overview: {
		revision: 'fixture-1', generatedAt: observedAt, timeZone: 'UTC', connectivity: 'live', activeWorkdays: 1, activeProviders: 1, executionProviders: ['local-codex'],
		operatingDay: { start: '2026-09-02T00:00:00.000Z', end: '2026-09-03T00:00:00.000Z' }, team: { id: 'team-demo', name: 'TreeSeed' },
		workdayContext: { selectedDate: '2026-09-02', selectedWorkdayId: 'workday-demo', latestWorkdayId: 'workday-demo', workdays: [{ id: 'workday-demo', title: 'Interface parity', status: 'running', startedAt: observedAt }] },
		metricTargets: {}, targetRevision: null,
		metrics: metricKeys.map((key, index) => ({ key, value: index + 1, secondary: 'Deterministic fixture', semantic: key === 'running' ? 'instantaneous' : 'cumulative', observedAt })),
	},
	activity: { revision: 'fixture-1', generatedAt: observedAt, cursor: null, upserts: [], removedIds: [] },
	series: { revision: 'fixture-1', generatedAt: observedAt, cursor: null, upserts: [], removedIds: [] },
	allocation: { revision: 'fixture-1', generatedAt: observedAt, canManage: true, activeAllocationSetId: 'allocation-demo', time: { availableSeconds: 28800, requestedSeconds: 7200, reservedSeconds: 7200, activeSeconds: 3600, elapsedSeconds: 1800, releasedSeconds: 0, remainingSeconds: 21600, overrunSeconds: 0 }, projects: [], agentClasses: [], workdayTime: [] },
	endpoints: { overview: '', activity: '', metricSeries: '', allocation: '', viewState: '' }, preference: { enabled: false, intervalSeconds: 5 },
	atlas: { revision: 'fixture-1', generatedAt: observedAt, timeZone: 'UTC', scope: { teamId: 'team-demo', selectedDate: '2026-09-02', workdayIds: ['workday-demo'], projectIds: [], groupIds: [], agentIds: [], activityProfiles: [], sizingMetric: 'activity' }, topologies: [], nodeStates: [], assignments: [], activity: [], workdaySummary: null, activityWindow: { total: 0, loaded: 0, truncated: false }, playback: { mode: 'live', startedAt: '2026-09-02T00:00:00.000Z', endedAt: '2026-09-03T00:00:00.000Z', liveEdgeAt: observedAt, cursor: { cursor: null, observedAt, positions: {} } }, alerts: [] },
	atlasEndpoints: { projection: '', delta: '', stream: '', detail: '', assignmentGraphs: '', viewState: '', createAgent: '#', createGroup: '#', createProject: '#', connectService: '#', configureCapacity: '#' },
};

export const agentLabCommandPage: any = { revision: 'fixture-1', generatedAt: observedAt, surface: 'inbox', title: 'Operational Inbox', description: 'Items requiring attention.', unreadCount: 1, items: [{ id: 'question-demo', kind: 'question', title: 'Confirm the interface parity?', status: 'open', summary: 'A deterministic acceptance item.' }], secondaryItems: [], metrics: [], relations: [], page: { hasMore: false, nextCursor: null, total: 1 } };
export const agentLabCommandEndpoints = { collection: '', detailBase: '', state: '', actions: '', simulations: '', draft: '', authoringBundle: '' };
