import { renderToString } from 'react-dom/server';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { CommandOverlayStack } from '../../../src/react/command-center/CommandOverlayStack.tsx';
import { CommandWorkspace } from '../../../src/react/command-center/CommandWorkspace.tsx';
import { SimulationBay } from '../../../src/react/command-center/simulation/SimulationBay.tsx';
import { MetricHistoryDashboard } from '../../../src/react/operations-monitor/MetricHistoryDashboard.tsx';
import { fromLogScale, metricLogDomain, toLogScale } from '../../../src/react/operations-monitor/MetricHistoryChart.tsx';
import OperationsMonitorHeader from '../../../src/react/operations-monitor/OperationsMonitorHeader.tsx';
import { WorkspaceFocusSurface } from '../../../src/react/workspace-surfaces/WorkspaceFocusSurface.tsx';

const generatedAt = '2026-08-04T14:00:00.000Z';
const keys = ['agents', 'workdays', 'systemEvents', 'assignments', 'executions', 'artifacts', 'passed', 'failed', 'running'];

describe('Agent Lab server rendering', () => {
	it('renders monitoring and command overlays without browser globals', () => {
		const html = renderToString(<><OperationsMonitorHeader
			initialOverview={{ revision: 'one', generatedAt, timeZone: 'America/New_York', connectivity: 'idle', operatingDay: { start: generatedAt, end: '2026-08-04T15:00:00.000Z' }, activeWorkdays: 0, activeProviders: 0, executionProviders: [], team: { id: 'team', name: 'Editorial' }, metrics: keys.map((key) => ({ key, value: 0, semantic: key === 'agents' ? 'configured' : key === 'running' ? 'instantaneous' : ['workdays', 'systemEvents'].includes(key) ? 'exact-total' : 'cumulative', observedAt: generatedAt })), workdayContext: { selectedDate: '2026-08-04', selectedWorkdayId: null, latestWorkdayId: null, workdays: [] }, metricTargets: {}, targetRevision: null }}
			initialActivity={{ revision: 'one', generatedAt, cursor: null, upserts: [], removedIds: [] }} initialSeries={{ revision: 'one', generatedAt, cursor: null, upserts: [], removedIds: [] }}
			initialAllocation={{ revision: 'one', generatedAt, canManage: false, activeAllocationSetId: null, time: { availableSeconds: null, requestedSeconds: 0, reservedSeconds: 0, activeSeconds: 0, elapsedSeconds: 0, releasedSeconds: 0, remainingSeconds: null, overrunSeconds: 0 }, projects: [], agentClasses: [], workdayTime: [] }}
			endpoints={{ overview: '/overview', activity: '/activity', metricSeries: '/series', allocation: '/allocation' }} preference={{ enabled: false, intervalSeconds: 5 }} metricDestinations={{}} csrfToken="csrf" logoSrc="/logo.svg" />
			<CommandOverlayStack endpoints={{ collection: '/collection', detailBase: '/details', state: '/state', actions: '/actions', simulations: '/simulations' }} realtime={{ enabled: false, intervalMs: 5000 }} timeZone="America/New_York" /></>);
		expect(html).toContain('Agent Lab'); expect(html).toContain('/logo.svg'); expect(html).toContain('Allocation'); expect(html).toContain('Compress vitals'); expect(html).toContain('aria-expanded="true"');
	});

	it('renders the complete workspace and metric grid before browser hydration', () => {
		const semantic = { semantic: 'configured' as const, sampleSize: 1, mean: 2, standardDeviation: 0, low: 2, high: 2, exactTotal: 2, observedAt: generatedAt };
		const workspace = renderToString(<CommandWorkspace surface="inbox" initial={{ revision: 'one', generatedAt, surface: 'inbox', title: 'Inbox', description: 'Operational inbox', unreadCount: 0, items: [] }} endpoints={{ collection: '/collection', detailBase: '/details', state: '/state', actions: '/actions' }} realtime={{ enabled: false, intervalMs: 5000 }} timeZone="America/New_York" />);
		const metrics = renderToString(<MetricHistoryDashboard initialSeries={{ revision: 'one', generatedAt, cursor: null, removedIds: [], upserts: [{ id: 'point', stateVersion: 1, timestamp: generatedAt, values: { agents: 2 }, statistics: { agents: semantic } }] }} endpoint="/series" metrics={[{ key: 'agents', label: 'Agents', value: 2, href: '/agents', semantic: 'configured', observedAt: generatedAt }]} timeZone="America/New_York" targets={{}} targetRevision={null} targetEndpoint="/targets" csrfToken="csrf" canManage={false} realtime={{ enabled: false, intervalMs: 10_000 }} />);
		expect(workspace).toContain('Operational inbox');
		expect(metrics).toContain('Current roster mean: 2');
	});

	it('expands a monitor surface only from its explicit control', () => {
		function Harness() {
			const [expanded, setExpanded] = useState<string | null>(null);
			return <section className="ts-operations-monitor"><WorkspaceFocusSurface id="metric:agents" label="Agents metric" mode={expanded === 'metric:agents' ? 'focused' : 'inline'} onModeChange={(mode) => setExpanded(mode === 'focused' ? 'metric:agents' : null)}><article>Agents</article></WorkspaceFocusSurface><button type="button">Outside</button></section>;
		}
		const { container } = render(<Harness />);
		const surface = container.querySelector<HTMLElement>('[data-workspace-surface="metric:agents"]')!;
		fireEvent.mouseEnter(surface);
		expect(surface).toHaveAttribute('data-mode', 'inline');
		fireEvent.pointerUp(surface, { pointerType: 'touch' });
		expect(surface).toHaveAttribute('data-mode', 'inline');
		fireEvent.click(screen.getByRole('button', { name: 'Expand Agents metric' }));
		expect(surface).toHaveAttribute('data-mode', 'focused');
		fireEvent.click(screen.getByRole('button', { name: 'Shrink Agents metric' }));
		expect(surface).toHaveAttribute('data-mode', 'inline');
	});

	it('uses a zero-safe logarithmic scale with a tight visible-series domain', () => {
		expect(toLogScale(0)).toBe(0);
		expect(fromLogScale(toLogScale(99))).toBeCloseTo(99);
		const [minimum, maximum] = metricLogDomain([{ assignments: toLogScale(9), failed: toLogScale(0) }, { assignments: toLogScale(99), failed: toLogScale(1) }], ['assignments']);
		expect(minimum).toBeGreaterThan(0);
		expect(maximum).toBeGreaterThan(toLogScale(99));
	});

	it('suspends the Designer overlay while its nested Simulation Bay owns focus', async () => {
		history.replaceState({}, '', '/app/work/build?inspect=agent~agent-one&focus=simulation&return=designer&returnTo=%2Fapp%2Fwork%2Fbuild%3Finspect%3Dagent%257Eagent-one%26focus%3Ddesigner');
		const endpoints = { collection: '/collection', detailBase: '/details', state: '/state', actions: '/actions' };
		const { container } = render(<main data-ts-workspace-content><SimulationBay items={[]} endpoints={endpoints} stateEndpoint="/state" timeZone="America/New_York" /><CommandOverlayStack endpoints={endpoints} realtime={{ enabled: false, intervalMs: 5000 }} timeZone="America/New_York" /></main>);
		const overlays = container.querySelector('.ts-command-overlay-stack');
		expect(overlays).toHaveAttribute('aria-hidden', 'true');
		fireEvent.click(screen.getByRole('button', { name: 'Return to Designer' }));
		expect(new URL(location.href).searchParams.get('focus')).toBe('designer');
		expect(new URL(location.href).searchParams.has('returnTo')).toBe(false);
		await waitFor(() => expect(overlays).not.toHaveAttribute('aria-hidden'));
	});
});
