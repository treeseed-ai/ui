export const navItems = [
  { label: 'Overview', href: '/displays/product-shell' },
  { label: 'Projects', href: '/displays/product-shell/projects' },
  { label: 'Knowledge', href: '/displays/product-shell/knowledge' },
  { label: 'Settings', href: '/displays/product-shell/settings' },
];
export const brand = { name: 'TreeSeed', tag: 'UI package', href: '/', logoSrc: '/logo.svg', logoAlt: 'TreeSeed' };
export const appearance = { scheme: 'fern', mode: 'system' } as const;
export const siteItems = [
  { label: 'Home', href: '/' },
  { label: 'Knowledge', href: '/knowledge/' },
  { label: 'Market', href: '/market/' },
];
export const teamOperationItems = [
  { label: 'Dashboard', href: '/app/' },
  { label: 'Projects', href: '/app/projects' },
  { label: 'Knowledge', href: '/app/knowledge' },
  { label: 'Market', href: '/market/' },
];
export const surfaceTabItems = [
  { id: 'overview', label: 'Overview', href: '/displays/surface-tabs', count: 2, panelId: 'surface-tabs-overview' },
  { id: 'activity', label: 'Activity', href: '/displays/surface-tabs/activity', panelId: 'surface-tabs-activity' },
  { id: 'settings', label: 'Settings', href: '/displays/surface-tabs/settings', panelId: 'surface-tabs-settings' },
];
export const hostRequirement = {
  key: 'web-host',
  type: 'web',
  displayName: 'Web host',
  purpose: 'Choose the host that will serve the project web UI.',
  required: true,
  compatibleProviders: ['Cloudflare', 'Railway'],
  choices: [
    { label: 'Cloudflare Pages', value: 'cloudflare-pages', selected: true },
    { label: 'Railway Web', value: 'railway-web' },
  ],
  configWritePreviews: [{ target: 'treeseed.site.yaml', path: 'hosts.web' }],
  environmentWritePreviews: [{ env: 'WEB_HOST_ID', targets: ['runtime'] }],
};
export const resourceRequirement = {
  key: 'database',
  type: 'd1',
  displayName: 'D1 database',
  purpose: 'Provision or connect the database required by this template.',
  required: false,
  compatibleProviders: ['Cloudflare'],
  configWritePreviews: [{ target: 'wrangler.toml', path: 'd1_databases' }],
  environmentWritePreviews: [{ env: 'DATABASE_ID', targets: ['worker'] }],
};
export const secretRequirement = {
  key: 'openai-api-key',
  env: 'OPENAI_API_KEY',
  source: 'team secret',
  required: true,
  sensitivity: 'secret',
  targets: ['worker', 'agent'],
};
export const templates = [
  {
    slug: 'monitoring-console',
    sourceRef: 'template:monitoring-console',
    title: 'Monitoring Console',
    launchRequirements: { hosts: [hostRequirement], resources: [resourceRequirement], secrets: [secretRequirement] },
  },
];
export const actionItems = [
  { title: 'Review deployment guardrails', description: 'Confirm readiness gates.', meta: 'Required', tone: 'warning' as const, actionLabel: 'Open' },
  { title: 'Sync knowledge pack', description: 'Refresh generated artifacts.', meta: 'Ready', tone: 'success' as const, actionLabel: 'Run' },
  { title: 'Inspect capacity', description: 'Compare active provider limits.', meta: 'Optional', tone: 'muted' as const, actionLabel: 'View' },
];
export const tableColumns = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'owner', label: 'Owner' },
];
export const tableRows = [
  { name: '<strong>Monitoring Console</strong><span>Deployment workspace</span>', type: 'Template', status: 'Published', owner: 'Platform' },
  { name: '<strong>Capacity Diagnostics</strong><span>Operations panel</span>', type: 'Panel', status: 'Draft', owner: 'Ops' },
  { name: '<strong>Knowledge Pack</strong><span>Generated artifact</span>', type: 'Artifact', status: 'Ready', owner: 'Knowledge' },
];
export const resolvedActions = [
  { id: 'question.create', label: 'New question', state: 'allowed' as const, href: '/forms/button' },
  { id: 'question.export', label: 'Export', state: 'disabledWithReason' as const, reason: 'Export arrives with the direction vertical.' },
];
export const feedbackContext = {
  url: 'https://ui.treeseed.test/displays/feedback-dialog',
  canonicalPath: '/displays/feedback-dialog',
  title: 'Feedback preview',
  shell: 'public' as const,
  context: 'public' as const,
  submissionEndpoint: '/api/feedback/submit',
  allowAnonymous: true,
  screenshotPolicy: 'optional' as const,
  attachmentStoragePolicy: 'public' as const,
  environment: 'local' as const,
};
export const helpContext = {
  capabilityId: 'work.questions',
  topicIds: ['work-content', 'questions'],
  shell: 'product' as const,
  context: 'project' as const,
  resourceType: 'question',
  routePattern: '/app/work/questions',
  canonicalPath: '/app/work/questions',
  template: 'collection' as const,
  summary: 'Questions capture uncertainty that directs project work.',
  topics: [
    { id: 'questions', title: 'Question records', summary: 'Use questions to preserve the decisions and research the team still needs.', href: '/displays/help-topic-link', visibility: 'team' as const, source: 'capability' as const },
    { id: 'question-actions', title: 'Action availability', summary: 'Unavailable actions explain their blocker and the next safe step.', visibility: 'team' as const, source: 'action-state' as const },
  ],
  relatedDocs: [
    { topicId: 'questions', title: 'Questions overview', href: '/displays/help-topic-link', visibility: 'team' as const, summary: 'How question records guide work.', source: 'capability' as const, current: true },
  ],
  relatedActions: resolvedActions,
  searchScope: 'project' as const,
  searchPlaceholder: 'Search question help',
  visibility: 'team' as const,
  feedbackType: 'question' as const,
};
export const collectionViewModel = {
  title: 'Questions',
  description: 'Reusable collection template preview.',
  columns: tableColumns.slice(0, 3),
  rows: [
    { name: 'Launch risks', type: 'Question', status: 'Open' },
    { name: 'Knowledge gaps', type: 'Question', status: 'Recorded' },
  ],
  resources: [
    { id: 'launch-risks', title: 'Launch risks', description: 'What still blocks launch?', href: '/displays/resource-card', status: 'Open' },
    { id: 'knowledge-gaps', title: 'Knowledge gaps', description: 'What should agents research next?', href: '/displays/resource-card', status: 'Recorded' },
  ],
  emptyTitle: 'No questions yet',
  emptyDescription: 'Questions appear when users guide project direction.',
};
export const dashboardViewModel = {
  title: 'Project dashboard',
  description: 'Context dashboard template preview.',
  context: {
    id: 'context',
    title: 'Where you are',
    description: 'Current scope and ownership.',
    items: [
      { label: 'Scope', value: 'Project', description: 'Monitoring Console', tone: 'info' as const },
      { label: 'Team', value: 'Launch', description: 'Active operating team' },
    ],
  },
  status: {
    id: 'status',
    title: 'Status',
    description: 'Readiness at a glance.',
    items: [
      { label: 'Knowledge', value: 'Ready', description: 'Runtime content available', tone: 'success' as const },
      { label: 'Open questions', value: 2, description: 'Needs direction', tone: 'warning' as const, href: '/displays/collection-template' },
    ],
  },
  nextActions: [
    { id: 'new-question', title: 'Clarify project direction', description: 'Capture the next uncertainty for the team.', href: '/displays/collection-template', status: 'Recommended' },
    { id: 'review-reader', title: 'Review Knowledge Hub', description: 'Check the public runtime reader proof.', href: '/displays/reader-template', status: 'Ready' },
  ],
  primaryResources: [
    { id: 'questions', title: 'Questions', description: 'Project direction records.', href: '/displays/collection-template', status: 'Level 5' },
    { id: 'knowledge', title: 'Knowledge', description: 'Runtime reader resources.', href: '/displays/reader-template', status: 'Level 5' },
  ],
  alerts: [
    { id: 'setup', title: 'Setup attention', description: 'Add capacity before the next workday.', tone: 'warning' as const, href: '/displays/resource-card' },
  ],
  activity: [
    { id: 'question', title: 'Question added', description: 'Launch risks were recorded.', timestamp: '2026-06-10', tone: 'info' as const },
  ],
};
export const readinessViewModel = {
  title: 'Service readiness',
  description: 'Readiness summary preview.',
  items: [
    { id: 'hosts', label: 'Hosts', status: 'ready' as const, message: 'Repository and web hosts are connected.', href: '/displays/resource-card' },
    { id: 'capacity', label: 'Capacity provider', status: 'warning' as const, message: 'Provider heartbeat has not reported recently.', href: '/displays/status-pill' },
    { id: 'runtime', label: 'Runtime diagnostics', status: 'unknown' as const, message: 'Advanced diagnostics are hidden by default.', advanced: true },
  ],
};
export const distributionViewModel = {
  title: 'Distribution readiness',
  description: 'Release, entitlement, delivery, and install/import action state.',
  items: [
    { id: 'pack', title: 'Operations Knowledge Pack', description: 'Reusable project context and runbooks.', status: 'published' as const, entitlement: 'public' as const, delivery: 'cdn' as const, href: '/displays/distribution-summary', meta: 'knowledge import' },
    { id: 'template', title: 'Workflow Import', description: 'Template gated by entitlement resolution.', status: 'review' as const, entitlement: 'authenticated' as const, delivery: 'contentProxy' as const, href: '/displays/distribution-summary', meta: 'workflow import' },
    { id: 'release', title: 'Release Review', description: 'Publication is awaiting reviewer approval.', status: 'blocked' as const, entitlement: 'team' as const, delivery: 'queued' as const, meta: 'release' },
  ],
};
export const overlayStatusViewModel = {
  state: 'preview' as const,
  label: 'Overlay gated',
  message: 'Editor and search bundles load only after authorized edit intent.',
  routePattern: '/knowledge/:slug*',
  resourceType: 'knowledge-page',
  action: { id: 'overlay.intent', label: 'Prepare overlay', state: 'allowed' as const, href: '/displays/overlay-status#overlay' },
};
export const allocationViewModel = {
  title: 'Portfolio allocation',
  description: 'Desired allocation, limits, reservations, active assignments, and actual usage.',
  scopeLabel: 'Team portfolio',
  tree: [{
    id: 'team',
    label: 'Launch team',
    level: 'team' as const,
    status: 'running' as const,
    value: '100%',
    current: true,
    children: [
      { id: 'project-a', label: 'Market Console', level: 'project' as const, status: 'ready' as const, value: '60%' },
      { id: 'project-b', label: 'Knowledge Hub', level: 'project' as const, status: 'needsReview' as const, value: '40%' },
    ],
  }],
  items: [
    { id: 'desired', label: 'Market Console', status: 'ready' as const, desired: '60%', inheritedLimit: '80 credits', scheduledReservation: '18 credits', activeAssignment: '4 agents', actualUsage: '12 credits', message: 'Inside inherited limits.' },
    { id: 'review', label: 'Knowledge Hub', status: 'needsReview' as const, desired: '40%', inheritedLimit: '50 credits', override: 'Pending', scheduledReservation: '20 credits', actualUsage: '31 credits', message: 'Review override before the next workday.' },
  ],
};
export const workQueueViewModel = {
  title: 'Work queue',
  description: 'Running, blocked, failed, and needs-review work.',
  items: [
    { id: 'running', title: 'Planning workday', status: 'running' as const, project: 'Market Console', agent: 'planner', description: 'Collecting project context.' },
    { id: 'blocked', title: 'Release verification', status: 'blocked' as const, project: 'Knowledge Hub', agent: 'reviewer', description: 'Capacity approval required.' },
  ],
};
export const activityTimelineViewModel = {
  title: 'Operating timeline',
  description: 'Direction, allocation, agent, and review events.',
  items: [
    { id: 'direction', title: 'Question resolved', status: 'completed' as const, description: 'Launch risk was linked to a decision.', timestamp: '2026-06-10', meta: 'direction' },
    { id: 'approval', title: 'Approval requested', status: 'needsReview' as const, description: 'Budget policy requires review.', timestamp: '2026-06-10', meta: 'governance' },
  ],
};
export const workspaceViewModel = {
  title: 'Workday workspace',
  description: 'Operating loop workspace preview.',
  context: {
    id: 'workspace-context',
    title: 'Where you are',
    items: [
      { label: 'Project', value: 'Market Console', description: 'Active workday' },
      { label: 'State', value: 'Running', tone: 'info' as const },
    ],
  },
  allocation: allocationViewModel,
  queue: workQueueViewModel,
  timeline: activityTimelineViewModel,
};
export const timelineItems = [
  { id: 'queued', phase: 'Queue', title: 'Operation queued', description: 'The release was accepted for guarded deployment.', status: 'queued', tone: 'info' as const, createdAt: '2026-06-10', meta: 'release/market-console' },
  { id: 'verified', phase: 'Verify', title: 'Smoke checks passed', description: 'HTTP checks and worker probes returned healthy results.', status: 'passed', tone: 'success' as const, createdAt: '2026-06-10', meta: '3 checks' },
  { id: 'approval', phase: 'Governance', title: 'Approval required', description: 'Budget policy requires reviewer sign-off before public promotion.', status: 'waiting', tone: 'warning' as const, createdAt: '2026-06-10', meta: 'policy: budget-threshold' },
];
export const phases = [
  { key: 'research', label: 'Research', description: 'Collect context before implementation.', state: 'complete', tone: 'success' },
  { key: 'implementation', label: 'Implementation', description: 'Ship the planned change.', state: 'active', tone: 'info' },
  { key: 'verification', label: 'Verification', description: 'Run tests and probes.', state: 'waiting', tone: 'warning' },
];
export const events = [
  { phase: 'research', category: 'context', title: 'Repository context collected', description: 'Core templates and runtime constraints were indexed.', state: 'complete', tone: 'success', timestamp: '2026-06-10', meta: '2 repositories' },
  { phase: 'implementation', category: 'execution', title: 'Worker deployment prepared', description: 'Queue bindings and release notes are staged.', state: 'active', tone: 'info', timestamp: '2026-06-10', repositoryRefs: ['treeseed/market'] },
];
export const repositories = [
  { owner: 'treeseed', name: 'market', role: 'application', status: 'connected', description: 'Market UI and launch workflow.', tone: 'success', href: '/displays/repository-context-panel' },
  { owner: 'treeseed', name: 'core', role: 'content', status: 'indexed', description: 'Docs and site components.', tone: 'info' },
];
export const capacity = [
  { title: 'Cloudflare Workers', description: 'Daily request budget remains within threshold.', meta: 'capacity', tone: 'success' },
  { title: 'LLM budget', description: 'Generation quota needs review before next launch.', meta: 'budget', tone: 'warning' },
];
export const diagnostics = [
  { id: 'capacity-region', title: 'Region routing', description: 'Primary region iad-1 is healthy.', meta: 'capacity', tone: 'success' },
  { id: 'policy-budget', title: 'Budget policy', description: 'Approval needed above the configured threshold.', meta: 'governance', tone: 'warning' },
];
export const seeds = [
  { title: 'Team defaults seed', description: 'Creates default roles and operating policies.', meta: 'ready', tone: 'success', href: '/displays/seed-operations-panel' },
  { title: 'Knowledge starter pack', description: 'Loads initial docs and release templates.', meta: 'queued', tone: 'info' },
];
export const workers = [
  { title: 'release-coordinator', description: 'Processing deployment timeline events.', meta: 'active', tone: 'success', href: '/displays/worker-queue-panel' },
  { title: 'knowledge-indexer', description: 'Waiting for artifact generation.', meta: '2 queued', tone: 'warning' },
];
export const policies = [
  { title: 'Budget threshold', description: 'Require approval when launch spend exceeds the team limit.', policyType: 'approval', tone: 'warning', href: '/displays/governance-policy-summary' },
];
export const constraints = [
  { title: 'Public release window', description: 'Only promote during staffed operating hours.', constraintType: 'schedule', tone: 'info' },
];
export const approval = { approvalId: 'approval-42', state: 'pending', severity: 'moderate', tone: 'warning' };
export const artifact = {
  href: '/displays/knowledge-artifact-card',
  type: 'Runbook',
  title: 'Market launch runbook',
  description: 'Generated checklist tying deployment evidence to governance approvals.',
  state: 'generated',
  tone: 'success',
  repositories: ['treeseed/market', 'treeseed/core'],
  relationships: { approvals: ['approval-42'], workdays: ['2026-06-10'], releases: ['release-17'] },
  metadata: { projectName: 'Market Console', producedDuring: 'Release 17' },
};
export const chronicleItems = [
  { href: '/notes/release-readiness/', title: 'Release readiness review', summary: 'What changed and what still needs human review.', status: 'live', date: new Date('2026-06-10'), meta: 'market-steward', tags: ['release', 'governance'] },
  { href: '/notes/capacity/', title: 'Capacity policy update', summary: 'Budget and provider routing notes for operators.', status: 'in progress', date: new Date('2026-06-09'), meta: 'ops', tags: ['capacity'] },
];
export const bookItems = [
  { href: '/books/operations/', title: 'Operational Continuity', summary: 'Reusable operating model for TreeSeed launches.', meta: 'Book', landingPath: '/operations/', downloadHref: '/books/operations.md' },
  { href: '/books/governance/', title: 'Governance Playbook', summary: 'Approval and evidence patterns for releases.', meta: 'Book', landingPath: '/governance/', downloadHref: '/books/governance.md' },
];
export const profileItems = [
  { href: '/profiles/market-steward/', name: 'Market Steward', summary: 'Owns public launch readiness and release context.', meta: 'Team role', status: 'live', tags: ['operations'] },
  { href: '/profiles/knowledge-editor/', name: 'Knowledge Editor', summary: 'Maintains generated docs and public artifacts.', meta: 'Contributor', status: 'planned', tags: ['knowledge'] },
];
export const notes = chronicleItems.map((item, index) => ({
  id: `note-${index + 1}`,
  data: { title: item.title, summary: item.summary, status: item.status, date: item.date, author: item.meta, tags: item.tags },
}));
export const sidebarItems = [
  { label: 'Overview', href: '/displays/sidebar' },
  { label: 'Guides', href: '/displays/sidebar/guides', items: [{ label: 'Launch', href: '/displays/sidebar/guides/launch' }] },
];
