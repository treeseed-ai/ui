import type { ComponentCatalogEntry } from '../support/component-kind.ts';
import { display } from '../support/component-kind.ts';

export const operationsComponents: ComponentCatalogEntry[] = [
  display('agent-lab-monitor', 'AgentLabMonitor', 'Operating Loop', 'astro', 'Reusable live operating metrics header for every Agent Lab surface.', 'full-page', { scene: 'running' }, [{ name: 'frame', type: 'AgentLabFrame', defaultValue: 'running', description: 'Coherent operating snapshot.' }], undefined, '@treeseed/ui/components/astro/agent-lab/AgentLabMonitor.astro'),
  display('agent-lab-chrome', 'AgentLabChrome', 'Operating Loop', 'astro', 'Shared Agent Lab monitor and workday-aware application navigation.', 'full-page', { scene: 'running' }, [{ name: 'current', type: 'AgentLabSurface', defaultValue: 'inbox', description: 'Active Agent Lab application.' }], undefined, '@treeseed/ui/components/astro/agent-lab/AgentLabChrome.astro'),
  display('agent-lab-home-surface', 'AgentLabHomeSurface', 'Operating Loop', 'astro', 'Shell-free Follow/Atlas home composition backed by semantic regions.', 'full-page', { scene: 'running' }, [{ name: 'frame', type: 'AgentLabFrame', defaultValue: 'running', description: 'Atlas and monitor projection.' }], undefined, '@treeseed/ui/components/astro/agent-lab/AgentLabHomeSurface.astro'),
  display('agent-lab-command-surface', 'AgentLabCommandSurface', 'Operating Loop', 'astro', 'Shell-free Inbox, Decision, Build, Direction, Results, and Find application composition.', 'full-page', { surface: 'inbox' }, [{ name: 'current', type: 'AgentLabSurface', defaultValue: 'inbox', description: 'Semantic command surface.' }], undefined, '@treeseed/ui/components/astro/agent-lab/AgentLabCommandSurface.astro'),
  display('agent-lab-entity-surface', 'AgentLabEntitySurface', 'Operating Loop', 'astro', 'Shell-free Agent Lab entity collection with shared chrome and filtering.', 'full-page', { entity: 'agents' }, [{ name: 'items', type: 'EntityItem[]', defaultValue: 1, description: 'Filtered entity records.' }], undefined, '@treeseed/ui/components/astro/agent-lab/AgentLabEntitySurface.astro'),
  display('workday-collection-surface', 'WorkdayCollectionSurface', 'Operating Loop', 'astro', 'Shared workday collection and bounded creation workflow.', 'full-page', { workdays: 1 }, [{ name: 'items', type: 'EntityItem[]', defaultValue: 1, description: 'Workday summaries.' }], undefined, '@treeseed/ui/components/astro/agent-lab/WorkdayCollectionSurface.astro'),
  display('workday-detail-surface', 'WorkdayDetailSurface', 'Operating Loop', 'astro', 'Shared workday lifecycle and forensic event detail.', 'full-page', { status: 'running' }, [{ name: 'run', type: 'WorkdayRun', defaultValue: 'running', description: 'Selected workday and lifecycle state.' }], undefined, '@treeseed/ui/components/astro/agent-lab/WorkdayDetailSurface.astro'),
  display('project-command-surface', 'ProjectCommandSurface', 'Operations', 'astro', 'Shared project overview with operating state, capacity, situations, and delivery context.', 'full-page', { project: 'platform' }, [{ name: 'project', type: 'Project', defaultValue: 'platform', description: 'Selected project projection.' }], undefined, '@treeseed/ui/components/astro/project/ProjectCommandSurface.astro'),
  display('project-agents-surface', 'ProjectAgentsSurface', 'Operations', 'astro', 'Shared project agent roster with execution state and stable detail links.', 'full-page', { agents: 1 }, [{ name: 'agents', type: 'AgentClass[]', defaultValue: 1, description: 'Synchronized project agent classes.' }], undefined, '@treeseed/ui/components/astro/project/ProjectAgentsSurface.astro'),
  display('agent-studio-surface', 'AgentStudioSurface', 'Operations', 'astro', 'Read-only Agent Studio for class contracts, executions, fallbacks, and TreeDX provenance.', 'full-page', { agent: 'interface-architect' }, [{ name: 'agent', type: 'AgentClass', defaultValue: 'interface-architect', description: 'Selected synchronized agent class.' }], undefined, '@treeseed/ui/components/astro/project/AgentStudioSurface.astro'),
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
  display('capacity-meter', 'CapacityMeter', 'Capacity', 'astro', 'Compact used, reserved, and remaining capacity meter for a single supply dimension.', 'medium', { label: 'Tokens', used: 3200, reserved: 800, total: 10000, unit: ' tok' }, [
      { name: 'label', type: 'string', defaultValue: 'Tokens', description: 'Capacity dimension label.' },
      { name: 'used', type: 'number', defaultValue: 3200, description: 'Consumed capacity.' },
      { name: 'reserved', type: 'number', defaultValue: 800, description: 'Reserved capacity.' },
      { name: 'total', type: 'number', defaultValue: 10000, description: 'Total capacity limit.' },
    ], undefined, '@treeseed/ui/components/astro/capacity/CapacityMeter.astro'),
  display('provider-battery-card', 'ProviderBatteryCard', 'Capacity', 'astro', 'Provider availability, capabilities, assignments, and dimensional supply telemetry.', 'large', { id: 'provider-demo', name: 'Local provider', status: 'available', assignments: 2 }, [
      { name: 'id', type: 'string', defaultValue: 'provider-demo', description: 'Stable provider identity.' },
      { name: 'status', type: 'string', defaultValue: 'available', description: 'Current provider availability.' },
      { name: 'meters', type: 'Meter[]', defaultValue: 2, description: 'Supply dimensions reported by the provider.' },
    ], undefined, '@treeseed/ui/components/astro/capacity/ProviderBatteryCard.astro'),
  display('capacity-control-room', 'CapacityControlRoom', 'Capacity', 'astro', 'Responsive team capacity fleet with live provider pressure and availability.', 'full-page', { providers: 2, timeZone: 'America/New_York' }, [
      { name: 'providers', type: 'Provider[]', defaultValue: 2, description: 'Provider batteries shown in the fleet.' },
      { name: 'timeZone', type: 'string', defaultValue: 'America/New_York', description: 'Authenticated user time zone for provider signals.' },
    ], undefined, '@treeseed/ui/components/astro/capacity/CapacityControlRoom.astro'),
  display('capacity-workspace', 'CapacityWorkspace', 'Capacity', 'astro', 'Complete shared capacity governance, fleet, reservation, and accounting workspace.', 'full-page', { providers: 1, reservations: 1 }, [
      { name: 'teamId', type: 'string', defaultValue: 'team-demo', description: 'Active team identity.' },
      { name: 'canManage', type: 'boolean', defaultValue: true, description: 'Whether governance actions are available.' },
    ], undefined, '@treeseed/ui/components/astro/capacity/CapacityWorkspace.astro'),
  display('project-portfolio-surface', 'ProjectPortfolioSurface', 'Operations', 'astro', 'Complete shared project portfolio surface for the active team.', 'full-page', { projects: 2 }, [
      { name: 'items', type: 'SemanticCollectionItem[]', defaultValue: 2, description: 'Project operating summaries.' },
    ], undefined, '@treeseed/ui/components/astro/project/ProjectPortfolioSurface.astro'),
  display('knowledge-workbench-surface', 'KnowledgeWorkbenchSurface', 'Knowledge', 'astro', 'Complete shared Knowledge library, authoring, review, lifecycle, and pack workspace.', 'full-page', { view: 'library' }, [{ name: 'view', type: 'string', defaultValue: 'library', description: 'Active Knowledge workbench section.' }], undefined, '@treeseed/ui/components/astro/knowledge/KnowledgeWorkbenchSurface.astro'),
  display('service-connection-create-surface', 'ServiceConnectionCreateSurface', 'Services', 'astro', 'Complete shared provider selection and connection workflow.', 'full-page', { provider: 'github' }, [{ name: 'provider', type: 'ServiceProviderDefinition', defaultValue: 'github', description: 'Selected service provider contract.' }], undefined, '@treeseed/ui/components/astro/service/workspace/ServiceConnectionCreateSurface.astro'),
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
