import { defineUiRegistry } from './registry.ts';
import type { ApplicationDefinition, ShellDefinition } from './application.ts';
import type { ActionDefinition, FieldDefinition, ResourceDefinition, ViewDefinition } from './semantic.ts';

const name = (label = 'Name'): FieldDefinition => ({ id: 'name', label, type: 'string', required: true, searchable: true, sortable: true });
const slug: FieldDefinition = { id: 'slug', label: 'Slug', type: 'string', required: true, description: 'Lowercase letters, numbers, and single hyphens.' };
const description: FieldDefinition = { id: 'description', label: 'Description', type: 'markdown', searchable: true };
const status: FieldDefinition = { id: 'status', label: 'Status', type: 'enum', readonly: true, filterable: true };
const resource = (definition: ResourceDefinition) => definition;
const action = (definition: ActionDefinition) => definition;
const step = (id: string, label: string, fields: FieldDefinition[], description?: string) => ({ id, label, fields, description });
const projectId: FieldDefinition = { id: 'projectId', label: 'Project ID', type: 'resource', resource: 'project', required: true };
const workspaceVersion: FieldDefinition = { id: 'version', label: 'Existing workspace version', type: 'number', minimum: 1, description: 'Required only when resuming an existing workspace.' };

export const CORE_ACTIONS: ActionDefinition[] = [
	action({ id: 'service.connect', label: 'Connect service', scope: 'collection', intent: 'primary', operationId: 'services.connections.create', steps: [
		step('provider', 'Provider', [{ id: 'providerId', label: 'Provider ID', type: 'string', required: true, description: 'Choose a provider from the service provider catalog.' }]),
		step('identity', 'Identity', [{ id: 'displayName', label: 'Connection name', type: 'string', required: true }]),
		step('capabilities', 'Capabilities', [{ id: 'capabilities', label: 'Capability bindings (JSON)', type: 'text', description: 'Optional JSON array. Secrets are never accepted here.' }]),
	], confirmation: 'confirm' }),
	action({ id: 'service.configure', label: 'Configure', scope: 'resource', operationId: 'services.connections.update', steps: [
		step('identity', 'Identity', [{ id: 'displayName', label: 'Connection name', type: 'string', required: true }]),
		step('capabilities', 'Capabilities', [{ id: 'capabilities', label: 'Capability bindings (JSON)', type: 'text', description: 'Leave blank to preserve current bindings.' }]),
	], confirmation: 'confirm' }),
	action({ id: 'service.remove', label: 'Remove', scope: 'resource', intent: 'danger', operationId: 'services.connections.disconnect', confirmation: 'strongConfirm' }),
	action({ id: 'capacity.configure', label: 'Configure capacity', description: 'Connect a capacity provider and complete its governed enrollment.', scope: 'collection', workflowId: 'capacity.configure', steps: [
		step('enrollment', 'Enrollment', [{ id: 'mode', label: 'Enrollment mode', type: 'enum', required: true, options: [{ value: 'local', label: 'Local provider' }, { value: 'remote', label: 'Remote provider' }], description: 'The control plane issues the enrollment handoff; credentials never enter this form.' }]),
		step('policy', 'Policy', [{ id: 'approval', label: 'Approval policy', type: 'enum', required: true, options: [{ value: 'trusted-local-owner', label: 'Trusted local owner' }, { value: 'review', label: 'Review required' }] }]),
	], confirmation: 'confirm' }),
	action({ id: 'capacity.revoke', label: 'Revoke capacity', description: 'Revoke the selected provider membership and its active grants.', scope: 'resource', intent: 'danger', workflowId: 'capacity.revoke', confirmation: 'strongConfirm' }),
	action({ id: 'project.create', label: 'Create project', scope: 'collection', intent: 'primary', operationId: 'projects.create', input: [name('Project name'), slug, description], confirmation: 'confirm' }),
	action({ id: 'project.launch', label: 'Launch project', scope: 'resource', intent: 'primary', operationId: 'projects.update', confirmation: 'confirm', asynchronous: true }),
	action({ id: 'agent.create', label: 'New agent', description: 'Create an agent through a repository-native TreeDX authoring workspace.', scope: 'collection', intent: 'primary', workflowId: 'agent.author.create', steps: [
		step('workspace', 'TreeDX workspace', [projectId, { id: 'workspaceId', label: 'Existing workspace ID', type: 'string', description: 'Leave blank to create a recoverable workspace.' }, workspaceVersion]),
		step('document', 'Agent definition', [{ id: 'sourcePath', label: 'Agent path', type: 'string', required: true }, { id: 'content', label: 'Agent YAML', type: 'markdown', required: true }]),
		step('submission', 'Submission', [{ id: 'message', label: 'Change summary', type: 'string', required: true }]),
	], confirmation: 'confirm' }),
	action({ id: 'agent-group.create', label: 'New group', description: 'Create an agent group through a repository-native TreeDX authoring workspace.', scope: 'collection', workflowId: 'agent-group.author.create' }),
	action({ id: 'agent.save', label: 'Save agent', description: 'Save the agent definition through its recoverable TreeDX workspace.', scope: 'resource', intent: 'primary', workflowId: 'agent.author.update', steps: [
		step('workspace', 'TreeDX workspace', [projectId, { id: 'workspaceId', label: 'Existing workspace ID', type: 'string', description: 'Leave blank to create a recoverable workspace.' }, workspaceVersion]),
		step('document', 'Agent definition', [{ id: 'sourcePath', label: 'Agent path', type: 'string', required: true }, { id: 'content', label: 'Agent YAML', type: 'markdown', required: true }]),
		step('submission', 'Submission', [{ id: 'message', label: 'Change summary', type: 'string', required: true }]),
	], confirmation: 'confirm' }),
	action({ id: 'message.send', label: 'Send', scope: 'resource', intent: 'primary', operationId: 'communications.send', asynchronous: true }),
	action({ id: 'question.answer', label: 'Answer', scope: 'resource', intent: 'primary', operationId: 'inbox.items.action', input: [{ id: 'markdown', label: 'Answer', type: 'markdown', required: true }] }),
	action({ id: 'proposal.approve', label: 'Approve', scope: 'resource', intent: 'primary', operationId: 'inbox.items.action', input: [{ id: 'markdown', label: 'Approval note', type: 'markdown' }] }),
	action({ id: 'proposal.reject', label: 'Reject', scope: 'resource', intent: 'danger', operationId: 'inbox.items.action', input: [{ id: 'markdown', label: 'Reason', type: 'markdown', required: true }], confirmation: 'confirm' }),
	action({ id: 'content.comment', label: 'Comment', scope: 'resource', workflowId: 'content.comment' }),
	action({ id: 'allocation.save', label: 'Save allocation', scope: 'resource', intent: 'primary', workflowId: 'capacity.allocation.save', steps: [
		step('workspace', 'TreeDX workspace', [projectId, { id: 'workspaceId', label: 'Existing workspace ID', type: 'string', description: 'Leave blank to create a recoverable workspace.' }, workspaceVersion]),
		step('allocation', 'Allocation profile', [{ id: 'sourcePath', label: 'Allocation path', type: 'string', required: true }, { id: 'content', label: 'Allocation profile (JSON or YAML)', type: 'markdown', required: true }]),
		step('submission', 'Submission', [{ id: 'message', label: 'Change summary', type: 'string', required: true }]),
	], confirmation: 'confirm' }),
	action({ id: 'content.edit', label: 'Edit', scope: 'resource', workflowId: 'knowledge.author.update', steps: [
		step('workspace', 'TreeDX workspace', [projectId, { id: 'workspaceId', label: 'Existing workspace ID', type: 'string', description: 'Leave blank to create a recoverable workspace.' }, workspaceVersion]),
		step('page', 'Book page', [{ id: 'bookId', label: 'Book ID', type: 'string', required: true }, { id: 'slug', label: 'Page slug', type: 'string', required: true }, { id: 'title', label: 'Page title', type: 'string', required: true }, { id: 'summary', label: 'Summary', type: 'text', required: true }, { id: 'body', label: 'Page markdown', type: 'markdown', required: true }]),
		step('submission', 'Submission', [{ id: 'message', label: 'Change summary', type: 'string', required: true }]),
	], confirmation: 'confirm' }),
	action({ id: 'release.cut', label: 'Cut staging release', scope: 'collection', intent: 'primary', workflowId: 'release.staging.cut', steps: [
		step('release', 'Staging release', [{ id: 'reviewId', label: 'Approved review ID', type: 'resource', resource: 'release', required: true }, { id: 'notes', label: 'Release notes', type: 'markdown' }]),
		step('readiness', 'Readiness evidence', [{ id: 'version', label: 'Review version', type: 'number', required: true, minimum: 1 }, { id: 'sourceDigest', label: 'Source digest', type: 'string', description: 'Optional immutable evidence shown before publication.' }]),
	], confirmation: 'confirm', asynchronous: true }),
	action({ id: 'release.promote-production', label: 'Promote to production', scope: 'resource', intent: 'primary', workflowId: 'release.production.promote', steps: [
		step('release', 'Production release', [{ id: 'reviewId', label: 'Staging review ID', type: 'resource', resource: 'release', required: true }, { id: 'notes', label: 'Promotion notes', type: 'markdown', required: true }]),
		step('authority', 'Human authority', [{ id: 'confirmation', label: 'Type PROMOTE', type: 'string', required: true }], 'Production promotion requires a human principal and remains fail-closed when hosted deployment is suspended.'),
	], confirmation: 'strongConfirm', asynchronous: true }),
];

export const CORE_RESOURCES: ResourceDefinition[] = [
	resource({ id: 'team', label: 'Team', pluralLabel: 'Teams', identityField: 'name', descriptionField: 'description', fields: [name(), description], actions: ['project.create', 'service.connect'], relationships: [{ id: 'projects', label: 'Projects', resource: 'project', cardinality: 'many', actions: ['view', 'create'] }, { id: 'members', label: 'Members', resource: 'user', cardinality: 'many', actions: ['view'] }], signals: [{ id: 'productivity', label: 'Productivity', type: 'metric', primary: true }], activity: true, capabilities: ['edit', 'monitor'] }),
	resource({ id: 'user', label: 'User', pluralLabel: 'Users', identityField: 'name', descriptionField: 'description', fields: [name(), description], relationships: [{ id: 'teams', label: 'Teams', resource: 'team', cardinality: 'many', actions: ['view'] }], activity: true }),
	resource({ id: 'project', label: 'Project', pluralLabel: 'Projects', identityField: 'name', descriptionField: 'objective', statusField: 'status', fields: [name(), { id: 'objective', label: 'Core objective', type: 'markdown', required: true }, status], actions: ['project.create', 'project.launch'], relationships: [{ id: 'agents', label: 'Agents', resource: 'agent', cardinality: 'many', actions: ['view', 'create'] }, { id: 'knowledge', label: 'Knowledge', resource: 'knowledge', cardinality: 'many', actions: ['view'] }], signals: [{ id: 'progress', label: 'Progress', type: 'progress', primary: true }], activity: true, capabilities: ['create', 'edit', 'search', 'filter', 'monitor'] }),
	resource({ id: 'service', label: 'Service', pluralLabel: 'Services', identityField: 'name', statusField: 'status', fields: [name(), { id: 'provider', label: 'Provider', type: 'enum', required: true, filterable: true }, status, { id: 'credential', label: 'Credential', type: 'secret', secret: true }], actions: ['service.connect', 'service.configure', 'service.remove'], signals: [{ id: 'health', label: 'Health', type: 'health', primary: true }], activity: true, capabilities: ['create', 'edit', 'delete', 'monitor'] }),
	resource({ id: 'capacity', label: 'Capacity provider', pluralLabel: 'Capacity providers', identityField: 'name', statusField: 'status', fields: [name(), status, { id: 'utilization', label: 'Utilization', type: 'percentage', readonly: true }], actions: ['capacity.configure', 'capacity.revoke'], signals: [{ id: 'utilization', label: 'Utilization', type: 'capacity', unit: '%', primary: true }, { id: 'health', label: 'Health', type: 'health' }], activity: true, capabilities: ['edit', 'monitor'] }),
	resource({ id: 'knowledge', label: 'Knowledge', pluralLabel: 'Knowledge', identityField: 'name', descriptionField: 'description', fields: [name('Book name'), description, status], actions: ['content.edit'], relationships: [{ id: 'releases', label: 'Releases', resource: 'release', cardinality: 'many', actions: ['view'] }], activity: true, capabilities: ['create', 'edit', 'search'] }),
	resource({ id: 'model', label: 'Model', pluralLabel: 'Models', identityField: 'name', descriptionField: 'description', fields: [name('Model name'), description, status], relationships: [{ id: 'releases', label: 'Releases', resource: 'release', cardinality: 'many', actions: ['view'] }], activity: true, capabilities: ['search'] }),
	resource({ id: 'template', label: 'Template', pluralLabel: 'Templates', identityField: 'name', descriptionField: 'description', fields: [name('Template name'), description, status], relationships: [{ id: 'agents', label: 'Agents', resource: 'agent', cardinality: 'many', actions: ['view'] }, { id: 'releases', label: 'Releases', resource: 'release', cardinality: 'many', actions: ['view'] }], activity: true, capabilities: ['search'] }),
	resource({ id: 'decision', label: 'Decision', pluralLabel: 'Decisions', identityField: 'title', descriptionField: 'rationale', statusField: 'status', fields: [{ id: 'title', label: 'Decision', type: 'string', required: true }, { id: 'rationale', label: 'Rationale', type: 'markdown' }, status], relationships: [{ id: 'proposal', label: 'Proposal', resource: 'proposal', cardinality: 'one', actions: ['view'] }, { id: 'releases', label: 'Releases', resource: 'release', cardinality: 'many', actions: ['view'] }], activity: true, capabilities: ['search'] }),
	resource({ id: 'release', label: 'Release', pluralLabel: 'Releases', identityField: 'version', statusField: 'status', fields: [{ id: 'version', label: 'Version', type: 'string' }, status, { id: 'environment', label: 'Target', type: 'enum', filterable: true, options: [{ value: 'staging', label: 'Staging' }, { value: 'production', label: 'Production' }] }, { id: 'cutReason', label: 'Cut reason', type: 'enum', readonly: true, options: [{ value: 'schedule', label: 'Schedule' }, { value: 'readiness', label: 'Ready work' }, { value: 'manual', label: 'Manual' }] }, { id: 'itemCount', label: 'Items', type: 'number', readonly: true }, { id: 'sourceDigest', label: 'Source digest', type: 'string', readonly: true }, { id: 'releasedAt', label: 'Released', type: 'datetime', readonly: true }], actions: ['release.promote-production'], relationships: [{ id: 'decisions', label: 'Related decisions', resource: 'decision', cardinality: 'many', actions: ['view'] }], signals: [{ id: 'readiness', label: 'Readiness', type: 'health', primary: true }], activity: true, capabilities: ['search', 'filter', 'monitor'] }),
	resource({ id: 'agent', label: 'Agent', pluralLabel: 'Agents', identityField: 'name', descriptionField: 'description', fields: [name(), { id: 'group', label: 'Group', type: 'string' }, { id: 'class', label: 'Class', type: 'string' }, description, { id: 'prompt', label: 'Prompt', type: 'markdown' }, { id: 'permissions', label: 'Permissions', type: 'multiselect' }], actions: ['agent.save'], signals: [{ id: 'activity', label: 'Activity', type: 'status' }], activity: true, capabilities: ['create', 'edit', 'monitor'] }),
	resource({ id: 'message', label: 'Message', pluralLabel: 'Messages', identityField: 'content', fields: [{ id: 'content', label: 'Message', type: 'markdown', required: true }], actions: ['message.send'], activity: true }),
	resource({ id: 'question', label: 'Question', pluralLabel: 'Questions', identityField: 'title', fields: [{ id: 'title', label: 'Title', type: 'string', required: true }, { id: 'content', label: 'Question', type: 'markdown', required: true }, status], actions: ['question.answer', 'content.comment'], activity: true, capabilities: ['create', 'edit', 'search'] }),
	resource({ id: 'proposal', label: 'Proposal', pluralLabel: 'Proposals', identityField: 'title', fields: [{ id: 'title', label: 'Title', type: 'string', required: true }, { id: 'content', label: 'Proposal', type: 'markdown', required: true }, status], actions: ['proposal.approve', 'proposal.reject', 'content.comment'], activity: true, capabilities: ['create', 'edit', 'search'] }),
	resource({ id: 'content', label: 'Content', pluralLabel: 'Content', identityField: 'title', fields: [{ id: 'title', label: 'Title', type: 'string' }, { id: 'body', label: 'Content', type: 'markdown' }, status], actions: ['content.edit', 'content.comment'], activity: true, capabilities: ['edit', 'search'] }),
	resource({ id: 'allocation', label: 'Allocation', pluralLabel: 'Allocations', identityField: 'name', fields: [name(), { id: 'percentage', label: 'Percent', type: 'percentage', required: true, minimum: 0, maximum: 100 }], actions: ['allocation.save'], capabilities: ['edit'] }),
];

export const CORE_VIEWS: ViewDefinition[] = [
	{ id: 'team', label: 'Follow', root: true, layout: 'dashboard', context: 'team', route: '/app/work', keywords: ['team', 'atlas', 'home', 'operations'], regions: [{ id: 'profile', type: 'profile', resource: 'team' }, { id: 'projects', label: 'Projects', type: 'collection', resource: 'project' }, { id: 'resources', label: 'Knowledge, models, and templates', type: 'collection', resource: 'knowledge' }, { id: 'signals', type: 'signals', resource: 'project' }, { id: 'activity', type: 'activity', resource: 'team' }], actions: ['service.connect', 'capacity.configure', 'project.create'] },
	{ id: 'chat', label: 'Chat', root: true, layout: 'three-pane', context: 'team', route: '/app/chat', keywords: ['agents', 'topics'], regions: [{ id: 'topics', type: 'collection', resource: 'message' }, { id: 'history', type: 'chat', resource: 'message' }, { id: 'participants', type: 'collection', resource: 'agent' }], actions: ['message.send'] },
	{ id: 'inbox', label: 'Inbox', root: true, layout: 'three-pane', context: 'team', route: '/app/work/inbox', keywords: ['questions', 'proposals', 'decisions'], regions: [{ id: 'queue', type: 'collection', resource: 'proposal' }, { id: 'document', type: 'document', resource: 'proposal' }, { id: 'comments', type: 'activity', resource: 'proposal' }], actions: ['question.answer', 'proposal.approve', 'proposal.reject', 'content.comment'] },
	{ id: 'discover', label: 'Explore', root: true, layout: 'workbench', context: 'team', route: '/app/work/find', keywords: ['search', 'discover', 'explore'], regions: [{ id: 'search', type: 'search', resource: 'content' }, { id: 'results', type: 'collection', resource: 'content' }] },
	{ id: 'user', label: 'User profile', layout: 'dashboard', context: 'personal', regions: [{ id: 'profile', type: 'profile', resource: 'user' }, { id: 'teams', type: 'relationships', resource: 'user', relationship: 'teams' }, { id: 'activity', type: 'activity', resource: 'user' }] },
	{ id: 'services', label: 'Services', layout: 'split', context: 'team', route: '/app/services', regions: [{ id: 'services', type: 'collection', resource: 'service' }, { id: 'configuration', type: 'form', resource: 'service' }], actions: ['service.connect', 'service.configure', 'service.remove'] },
	{ id: 'capacity', label: 'Capacity', layout: 'dashboard', context: 'team', route: '/app/capacity', regions: [{ id: 'providers', type: 'collection', resource: 'capacity' }, { id: 'signals', type: 'signals', resource: 'capacity' }, { id: 'activity', type: 'activity', resource: 'capacity' }], actions: ['capacity.configure', 'capacity.revoke'] },
	{ id: 'projects', label: 'Projects', layout: 'dashboard', context: 'team', route: '/app/projects', regions: [{ id: 'projects', type: 'collection', resource: 'project' }, { id: 'objective', type: 'document', resource: 'project', fields: ['objective'] }, { id: 'signals', type: 'signals', resource: 'project' }], actions: ['project.create', 'project.launch'] },
	{ id: 'knowledge', label: 'Knowledge', layout: 'artifact', context: 'project', route: '/app/knowledge', regions: [{ id: 'description', type: 'document', resource: 'knowledge' }, { id: 'books', type: 'collection', resource: 'knowledge' }, { id: 'outline', type: 'collection', resource: 'content' }, { id: 'releases', type: 'relationships', resource: 'knowledge', relationship: 'releases' }, { id: 'activity', type: 'activity', resource: 'knowledge' }] },
	{ id: 'model', label: 'Model', layout: 'artifact', context: 'project', regions: [{ id: 'description', type: 'document', resource: 'model' }, { id: 'releases', type: 'relationships', resource: 'model', relationship: 'releases' }, { id: 'activity', type: 'activity', resource: 'model' }] },
	{ id: 'template', label: 'Template', layout: 'artifact', context: 'project', regions: [{ id: 'description', type: 'document', resource: 'template' }, { id: 'agents', type: 'relationships', resource: 'template', relationship: 'agents' }, { id: 'releases', type: 'relationships', resource: 'template', relationship: 'releases' }, { id: 'activity', type: 'activity', resource: 'template' }] },
	{ id: 'agent-builder', label: 'Agent Builder', layout: 'workbench', context: 'project', route: '/app/work/build', regions: [{ id: 'identity', label: 'Identity', type: 'form', resource: 'agent', fields: ['name', 'group', 'class', 'description'] }, { id: 'behavior', label: 'Behavior', type: 'form', resource: 'agent', fields: ['prompt'] }, { id: 'access', label: 'Access', type: 'form', resource: 'agent', fields: ['permissions'] }, { id: 'context', label: 'Context', type: 'custom', resource: 'agent', presentation: 'context-query-builder' }], actions: ['agent.create', 'agent.save'] },
	{ id: 'allocator', label: 'Allocator', layout: 'workbench', context: 'team', regions: [{ id: 'workday', type: 'allocation', resource: 'allocation' }, { id: 'projects', type: 'allocation', resource: 'allocation' }, { id: 'agents', type: 'allocation', resource: 'allocation' }], actions: ['allocation.save'] },
	{ id: 'content', label: 'Content', layout: 'three-pane', context: 'selection', regions: [{ id: 'search', type: 'search', resource: 'content' }, { id: 'document', type: 'document', resource: 'content' }, { id: 'context', type: 'relationships', resource: 'content' }, { id: 'activity', type: 'activity', resource: 'content' }], actions: ['content.edit', 'content.comment'] },
	{ id: 'releases', label: 'Releases', layout: 'workbench', context: 'team', route: '/app/knowledge?view=reviews', regions: [{ id: 'queue', type: 'collection', resource: 'release' }, { id: 'release', type: 'resource', resource: 'release' }, { id: 'decisions', type: 'relationships', resource: 'release', relationship: 'decisions' }, { id: 'activity', type: 'activity', resource: 'release' }], actions: ['release.cut', 'release.promote-production'] },
];

export const CORE_APPLICATIONS: ApplicationDefinition[] = [
	{ id: 'follow', label: 'Follow', description: 'Design the team, observe it grow, and guide its trajectory.', kind: 'dynamic', viewId: 'team', route: '/app/work', icon: 'capacity', launchers: ['team-links', 'command-palette'], placements: { narrow: 'content', medium: 'content', wide: 'content' }, preserveState: true, dynamic: { topology: true, timeline: true, playback: true, simulation: true, viewport: true, selection: true, alerts: true } },
	{ id: 'chat', label: 'Chat / Discuss', kind: 'workspace', viewId: 'chat', route: '/app/chat', icon: 'discussion', launchers: ['team-links', 'site-links', 'command-palette'], placements: { narrow: 'dock-bottom', medium: 'dock-end', wide: 'dock-end' }, preserveState: true },
	{ id: 'inbox', label: 'Inbox', kind: 'workspace', viewId: 'inbox', route: '/app/work/inbox', icon: 'inbox', launchers: ['team-links', 'command-palette'], placements: { narrow: 'content', medium: 'content', wide: 'content' }, preserveState: true },
	{ id: 'explore', label: 'Explore', kind: 'workspace', viewId: 'discover', route: '/app/work/find', icon: 'search', launchers: ['team-links', 'command-palette'], placements: { narrow: 'content', medium: 'content', wide: 'content' }, preserveState: true },
	{ id: 'books', label: 'Books', description: 'Browse the active team library and open governed books in the Starlight reader.', kind: 'workspace', viewId: 'knowledge', route: '/app/knowledge', icon: 'book', launchers: ['team-links', 'command-palette'], placements: { narrow: 'content', medium: 'content', wide: 'content' }, preserveState: true },
	{ id: 'feedback', label: 'Feedback', kind: 'utility', icon: 'feedback', launchers: ['site-links', 'command-palette'], placements: { narrow: 'dock-bottom', medium: 'dock-end', wide: 'dock-end' }, preserveState: true },
];

export const CORE_SHELL: ShellDefinition = {
	contextControls: [
		{ id: 'active-team', label: 'Active team', placement: 'prominent', action: 'select-team' },
		{ id: 'manage-current-team', label: 'Current team', placement: 'prominent', action: 'manage-current-team' },
	],
	sections: [
		{ id: 'team-links', label: 'Team links', applicationIds: ['follow', 'chat', 'inbox', 'explore', 'books'] },
		{ id: 'identity', label: 'Identity', links: [{ id: 'teams', label: 'Manage teams', route: '/app/teams', icon: 'teams' }, { id: 'account', label: 'Account', route: '/app/account', icon: 'account' }] },
	],
	utilityLauncher: 'site-links',
};

export const coreUiRegistry = defineUiRegistry({
	resources: CORE_RESOURCES,
	actions: CORE_ACTIONS,
	views: CORE_VIEWS,
	applications: CORE_APPLICATIONS,
	commands: CORE_VIEWS.map((view) => ({ id: `view.${view.id}`, label: `Open ${view.label}`, kind: 'view' as const, target: view.id, keywords: view.keywords })),
});
