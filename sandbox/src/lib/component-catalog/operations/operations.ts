import type { ComponentCatalogEntry } from '../support/component-kind.ts';
import { display } from '../support/component-kind.ts';

export const operationsComponents: ComponentCatalogEntry[] = [
  display('agent-activity-gantt', 'AgentActivityGantt', 'Operating Loop', 'react', 'Accessible project and agent execution intervals with stable activity-profile lanes.', 'large', { intervals: 4 }, [
      { name: 'intervals', type: 'ActivityIntervalItem[]', defaultValue: 4, description: 'Execution intervals in the selected workday.' },
    ], undefined, '@treeseed/ui/components/react/OperationsMonitor'),
  display('live-agent-activity-gantt', 'LiveAgentActivityGantt', 'Operating Loop', 'react', 'Realtime Agent Activity Gantt bound to the shared polling coordinator.', 'large', { realtime: true }, [
      { name: 'endpoint', type: 'string', defaultValue: '/activity', description: 'Incremental activity projection.' },
    ], undefined, '@treeseed/ui/components/react/OperationsMonitor'),
  display('metric-history-chart', 'MetricHistoryChart', 'Operating Loop', 'react', 'Compact multi-signal metric history chart for the monitor dock.', 'large', { metrics: 9 }, [
      { name: 'points', type: 'MetricSeriesPoint[]', defaultValue: 12, description: 'Time-bucketed metric values.' },
    ], undefined, '@treeseed/ui/components/react/OperationsMonitor'),
  display('metric-history-dashboard', 'MetricHistoryDashboard', 'Operating Loop', 'react', 'Nine workday metric small multiples with targets and deviation bands.', 'full-page', { metrics: 9 }, [
      { name: 'metrics', type: 'VitalMetricItem[]', defaultValue: 9, description: 'Metric identity and current value.' },
    ], undefined, '@treeseed/ui/components/react/OperationsMonitor'),
  display('monitor-primitives', 'MonitorPrimitives', 'Operating Loop', 'react', 'Composable status, toggle, metric, and chart-dock primitives.', 'large', { primitives: 4 }, [
      { name: 'metrics', type: 'VitalMetricItem[]', defaultValue: 9, description: 'Metric rail content.' },
    ], undefined, '@treeseed/ui/components/react/OperationsMonitor'),
  display('operations-monitor-header', 'OperationsMonitorHeader', 'Operating Loop', 'react', 'Persistent identity, vital metrics, and optional live chart dock.', 'full-page', { metrics: 9 }, [
      { name: 'initialOverview', type: 'MonitorOverview', defaultValue: {}, description: 'Server-rendered coherent monitoring snapshot.' },
    ], undefined, '@treeseed/ui/components/react/OperationsMonitor'),
  display('operations-display-container', 'OperationsDisplayContainer', 'Operating Loop', 'astro', 'Shared Agent Lab content scaffold with contextual action slots.', 'large', { title: 'Direction' }, [
      { name: 'title', type: 'string', defaultValue: 'Direction', description: 'Focused display title.' },
    ], undefined, '@treeseed/ui/components/astro/operating/navigation/OperationsDisplayContainer.astro'),
  display('operations-navigator', 'OperationsNavigator', 'Operating Loop', 'astro', 'Compact operational tabs paired with a scoped workday selector.', 'large', { tabs: 6 }, [
      { name: 'items', type: 'SurfaceTabItem[]', defaultValue: 6, description: 'Agent Lab destinations.' },
    ], undefined, '@treeseed/ui/components/astro/operating/navigation/OperationsNavigator.astro'),
  display('workday-selector', 'WorkdaySelector', 'Operating Loop', 'astro', 'Date-aware current and historical workday selector.', 'medium', { workdays: 2 }, [
      { name: 'workdays', type: 'WorkdaySummary[]', defaultValue: 2, description: 'Selectable workdays for the chosen date.' },
    ], undefined, '@treeseed/ui/components/astro/operating/navigation/WorkdaySelector.astro'),
  display('allocation-panel', 'AllocationPanel', 'Operating Loop', 'astro', 'Allocation summary with desired, inherited, scheduled, active, and actual states.', 'large', { items: 2 }, [
      { name: 'viewModel', type: 'AllocationViewModel', defaultValue: { items: 2 }, description: 'Policy-shaped allocation view model.' },
    ], undefined, '@treeseed/ui/components/astro/operating/AllocationPanel.astro'),
  display('allocation-tree', 'AllocationTree', 'Operating Loop', 'astro', 'Nested allocation drilldown tree from team portfolio to provider grants.', 'large', { nodes: 3 }, [
      { name: 'nodes', type: 'AllocationTreeNode[]', defaultValue: 3, description: 'Nested allocation nodes.' },
    ], undefined, '@treeseed/ui/components/astro/operating/AllocationTree.astro'),
  display('allocation-state-legend', 'AllocationStateLegend', 'Operating Loop', 'astro', 'Shared legend for allocation and workday operating states.', 'inline', { statuses: 7 }, [
      { name: 'statuses', type: 'OperatingStatus[]', defaultValue: 7, description: 'Statuses to explain.' },
    ], undefined, '@treeseed/ui/components/astro/operating/AllocationStateLegend.astro'),
  display('work-queue-summary', 'WorkQueueSummary', 'Operating Loop', 'astro', 'Work queue summary for running, blocked, failed, and review-needed items.', 'large', { items: 2 }, [
      { name: 'viewModel', type: 'WorkQueueViewModel', defaultValue: { items: 2 }, description: 'Policy-shaped work queue.' },
    ], undefined, '@treeseed/ui/components/astro/operating/WorkQueueSummary.astro'),
  display('activity-timeline', 'ActivityTimeline', 'Operating Loop', 'astro', 'Direction, allocation, agent, workday, and audit timeline.', 'large', { items: 2 }, [
      { name: 'viewModel', type: 'ActivityTimelineViewModel', defaultValue: { items: 2 }, description: 'Timeline view model.' },
    ], undefined, '@treeseed/ui/components/astro/operating/ActivityTimeline.astro'),
  display('capacity-diagnostics-panel', 'CapacityDiagnosticsPanel', 'Operations', 'astro', 'Reusable CapacityDiagnosticsPanel component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/operations/CapacityDiagnosticsPanel.astro'),
  display('governance-decision-panel', 'GovernanceDecisionPanel', 'Operations', 'astro', 'Reusable GovernanceDecisionPanel component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/operations/GovernanceDecisionPanel.astro'),
  display('governance-policy-summary', 'GovernancePolicySummary', 'Operations', 'astro', 'Reusable GovernancePolicySummary component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/operations/GovernancePolicySummary.astro'),
  display('knowledge-artifact-card', 'KnowledgeArtifactCard', 'Operations', 'astro', 'Reusable KnowledgeArtifactCard component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/operations/KnowledgeArtifactCard.astro'),
  display('operational-timeline', 'OperationalTimeline', 'Operations', 'astro', 'Reusable OperationalTimeline component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/operations/OperationalTimeline.astro'),
  display('repository-context-panel', 'RepositoryContextPanel', 'Operations', 'astro', 'Reusable RepositoryContextPanel component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/operations/RepositoryContextPanel.astro'),
  display('seed-operations-panel', 'SeedOperationsPanel', 'Operations', 'astro', 'Reusable SeedOperationsPanel component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/operations/SeedOperationsPanel.astro'),
  display('worker-queue-panel', 'WorkerQueuePanel', 'Operations', 'astro', 'Reusable WorkerQueuePanel component copied into the TreeSeed UI library.', 'medium', { source: 'Operations' }, [
      { name: 'props', type: 'object', defaultValue: {}, description: 'Component-specific props.' },
    ], undefined, '@treeseed/ui/components/astro/app/operations/WorkerQueuePanel.astro'),
  display('commons-proposal-card', 'CommonsProposalCard', 'Governance', 'astro', 'Public Commons proposal summary card with advisory signal.', 'medium', {
      proposal: { id: 'proposal_demo', title: 'Improve service quote guidance', summary: 'Back a bounded proposal for TreeSeed Commons review.', status: 'backing', scope: 'marketplace', backingCount: 8, voteSupportWeight: 12 },
      href: '/displays/commons-proposal-card',
    }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Commons proposal card props.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsProposalCard.astro'),
  display('commons-proposal-pipeline', 'CommonsProposalPipeline', 'Governance', 'astro', 'Proposal state pipeline for Commons governance flows.', 'medium', {
      status: 'under_review',
    }, [{ name: 'status', type: 'string', defaultValue: 'draft', description: 'Current proposal status.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsProposalPipeline.astro'),
  display('commons-vote-summary', 'CommonsVoteSummary', 'Governance', 'astro', 'Weighted advisory vote summary.', 'medium', {
      support: 18,
      object: 3,
      abstain: 2,
      backers: 11,
    }, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Weighted vote totals.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsVoteSummary.astro'),
  display('commons-weight-breakdown', 'CommonsWeightBreakdown', 'Governance', 'astro', 'Participant governance weight breakdown.', 'medium', {
      participant: { baseWeight: 1, trustWeight: 1, contributionWeight: 2, stakeholderWeight: 1, delegatedWeight: 3, totalWeight: 8 },
    }, [{ name: 'participant', type: 'object', defaultValue: {}, description: 'Participant weight fields.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsWeightBreakdown.astro'),
  display('commons-participant-badge', 'CommonsParticipantBadge', 'Governance', 'astro', 'Compact Commons participant identity and weight badge.', 'inline', {
      participant: { displayName: 'Seed Member', status: 'active', totalWeight: 4, verifiedEmail: true },
    }, [{ name: 'participant', type: 'object', defaultValue: {}, description: 'Commons participant summary.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsParticipantBadge.astro'),
  display('commons-decision-timeline', 'CommonsDecisionTimeline', 'Governance', 'astro', 'Decision evidence timeline for Commons events.', 'medium', {
      events: [{ eventType: 'proposal.submitted', priorState: 'draft', nextState: 'submitted', message: 'Submitted for backing.', createdAt: '2026-06-15T00:00:00.000Z' }],
    }, [{ name: 'events', type: 'array', defaultValue: [], description: 'Governance event timeline entries.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsDecisionTimeline.astro'),
  display('commons-delegation-panel', 'CommonsDelegationPanel', 'Governance', 'astro', 'Scoped voting delegation summary panel.', 'medium', {
      delegations: [{ id: 'delegation_demo', status: 'active', scope: 'marketplace', fromParticipantId: 'participant_a', toParticipantId: 'participant_b' }],
    }, [{ name: 'delegations', type: 'array', defaultValue: [], description: 'Active or historical delegation records.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsDelegationPanel.astro'),
  display('commons-steward-decision-panel', 'CommonsStewardDecisionPanel', 'Governance', 'astro', 'Steward-only Commons decision form shell.', 'medium', {
      proposalId: 'proposal_demo',
      action: '/v1/commons/proposals/proposal_demo/steward-decision',
    }, [{ name: 'proposalId', type: 'string', defaultValue: 'proposal_demo', description: 'Proposal receiving the steward decision.' }], undefined, '@treeseed/ui/components/astro/governance/CommonsStewardDecisionPanel.astro'),
];
