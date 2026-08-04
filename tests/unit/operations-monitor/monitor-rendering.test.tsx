import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CommandOverlayStack } from '../../../src/react/command-center/CommandOverlayStack.tsx';
import { CommandWorkspace } from '../../../src/react/command-center/CommandWorkspace.tsx';
import { MetricHistoryDashboard } from '../../../src/react/operations-monitor/MetricHistoryDashboard.tsx';
import OperationsMonitorHeader from '../../../src/react/operations-monitor/OperationsMonitorHeader.tsx';

const generatedAt = '2026-08-04T14:00:00.000Z';
const keys = ['agents', 'workdays', 'systemEvents', 'assignments', 'executions', 'artifacts', 'passed', 'failed', 'running'];

describe('Agent Lab server rendering', () => {
	it('renders monitoring and command overlays without browser globals', () => {
		const html = renderToString(<><OperationsMonitorHeader
			initialOverview={{ revision: 'one', generatedAt, timeZone: 'America/New_York', connectivity: 'idle', operatingDay: { start: generatedAt, end: '2026-08-04T15:00:00.000Z' }, activeWorkdays: 0, activeProviders: 0, executionProviders: [], team: { id: 'team', name: 'Editorial' }, metrics: keys.map((key) => ({ key, value: 0, semantic: key === 'agents' ? 'configured' : key === 'running' ? 'instantaneous' : ['workdays', 'systemEvents'].includes(key) ? 'exact-total' : 'cumulative', observedAt: generatedAt })), workdayContext: { selectedDate: '2026-08-04', selectedWorkdayId: null, latestWorkdayId: null, workdays: [] }, metricTargets: {}, targetRevision: null }}
			initialActivity={{ revision: 'one', generatedAt, cursor: null, upserts: [], removedIds: [] }} initialSeries={{ revision: 'one', generatedAt, cursor: null, upserts: [], removedIds: [] }}
			initialAllocation={{ revision: 'one', generatedAt, canManage: false, activeAllocationSetId: null, credits: { budget: null, requested: 0, reserved: 0, committed: 0, reported: 0, spent: 0, remaining: null, overrun: 0 }, projects: [], agentClasses: [] }}
			endpoints={{ overview: '/overview', activity: '/activity', metricSeries: '/series', allocation: '/allocation' }} preference={{ enabled: false, intervalSeconds: 5 }} metricDestinations={{}} csrfToken="csrf" logoSrc="/logo.svg" />
			<CommandOverlayStack endpoints={{ collection: '/collection', detailBase: '/details', state: '/state', actions: '/actions', simulations: '/simulations' }} realtime={{ enabled: false, intervalMs: 5000 }} timeZone="America/New_York" /></>);
		expect(html).toContain('Agent Lab'); expect(html).toContain('/logo.svg'); expect(html).toContain('Allocation');
	});

	it('renders the complete workspace and metric grid before browser hydration', () => {
		const semantic = { semantic: 'configured' as const, sampleSize: 1, mean: 2, standardDeviation: 0, low: 2, high: 2, exactTotal: 2, observedAt: generatedAt };
		const workspace = renderToString(<CommandWorkspace surface="inbox" initial={{ revision: 'one', generatedAt, surface: 'inbox', title: 'Inbox', description: 'Operational inbox', unreadCount: 0, items: [] }} endpoints={{ collection: '/collection', detailBase: '/details', state: '/state', actions: '/actions' }} realtime={{ enabled: false, intervalMs: 5000 }} timeZone="America/New_York" />);
		const metrics = renderToString(<MetricHistoryDashboard initialSeries={{ revision: 'one', generatedAt, cursor: null, removedIds: [], upserts: [{ id: 'point', version: 1, timestamp: generatedAt, values: { agents: 2 }, statistics: { agents: semantic } }] }} endpoint="/series" metrics={[{ key: 'agents', label: 'Agents', value: 2, href: '/agents', semantic: 'configured', observedAt: generatedAt }]} timeZone="America/New_York" targets={{}} targetRevision={null} targetEndpoint="/targets" csrfToken="csrf" canManage={false} realtime={{ enabled: false, intervalMs: 10_000 }} />);
		expect(workspace).toContain('Operational inbox');
		expect(metrics).toContain('Current roster mean: 2');
	});
});
