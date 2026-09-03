import type { ComponentCatalogEntry } from '../support/component-kind.ts';
import { display } from '../support/component-kind.ts';

const serviceEntry = (
  id: string,
  name: string,
  description: string,
  intendedSize: ComponentCatalogEntry['intendedSize'],
  defaultProps: Record<string, unknown>,
  configurableProps: ComponentCatalogEntry['configurableProps'],
): ComponentCatalogEntry => display(
  id,
  name,
  'Service',
  'astro',
  description,
  intendedSize,
  defaultProps,
  configurableProps,
  undefined,
  `@treeseed/ui/components/astro/service/${name}.astro`,
);

export const serviceManagementComponents: ComponentCatalogEntry[] = [
	display('service-connection-workspace', 'ServiceConnectionWorkspace', 'Service', 'astro', 'Complete shared Services surface with filters, credential-custody status, and provider connection cards.', 'full-page', {
		teamName: 'TreeSeed', services: 1, providers: 2,
	}, [{ name: 'services', type: 'ServiceItem[]', defaultValue: 1, description: 'Authorized provider connections.' }], undefined,
	'@treeseed/ui/components/astro/service/workspace/ServiceConnectionWorkspace.astro'),
	display('repository-connection-panel', 'RepositoryConnectionPanel', 'Service', 'astro', 'Verified remote repository authority and publication-ref binding.', 'large', {
		topology: { contentRepository: { local: { path: '.' } } }, remote: null, candidates: [], csrfToken: 'catalog', action: '#',
	}, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Repository topology, eligible authorities, and form context.' }], undefined,
	'@treeseed/ui/components/astro/project/RepositoryConnectionPanel.astro'),
	display('provider-authority-panel', 'ProviderAuthorityPanel', 'Service', 'astro', 'Managed provider App authorization and least-privilege permission summary.', 'large', {
		kind: 'repository', teamId: 'team_demo', connectionId: 'connection_demo', csrfToken: 'catalog', permissions: ['Metadata: read', 'Contents: read and write'],
	}, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Connector kind, connection identity, authorization state, and permissions.' }], undefined,
	'@treeseed/ui/components/astro/service/ProviderAuthorityPanel.astro'),
	display('explicit-credential-authority-panel', 'ExplicitCredentialAuthorityPanel', 'Service', 'astro', 'Explicit environment-reference authority configuration without credential persistence.', 'large', {
		teamId: 'team_demo', connectionId: 'connection_demo', profileId: 'profile_demo', title: 'Repository token authority',
		description: 'Use a repository-scoped operator credential.', permissions: ['Contents: read and write'], csrfToken: 'catalog', suggestedEnvironmentReference: 'TREESEED_GITHUB_TOKEN_OWNER_REPOSITORY',
	}, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Credential profile, reference, readiness, and minimum permissions.' }], undefined,
	'@treeseed/ui/components/astro/service/ExplicitCredentialAuthorityPanel.astro'),
	display('workflow-definition-panel', 'WorkflowDefinitionPanel', 'Service', 'astro', 'Allowlisted workflow, ref, and configuration-requirement editor.', 'large', {
		action: '#', csrfToken: 'catalog', repositoryBindingId: 'repository_demo', workflowBindingId: 'workflow_demo',
	}, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Workflow definition and enhanced-form context.' }], undefined,
	'@treeseed/ui/components/astro/workflow/WorkflowDefinitionPanel.astro'),
	display('workflow-configuration-panel', 'WorkflowConfigurationPanel', 'Service', 'astro', 'Browser-encrypted workflow secret and provider-readable variable controls.', 'large', {
		projectId: 'project_demo', repositoryBindingId: 'repository_demo', secretBindingId: 'secret_demo', variableBindingId: 'variable_demo', csrfToken: 'catalog',
	}, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Project bindings and enhanced-form context.' }], undefined,
	'@treeseed/ui/components/astro/workflow/WorkflowConfigurationPanel.astro'),
	display('workflow-execution-panel', 'WorkflowExecutionPanel', 'Service', 'astro', 'Exact-commit workflow dispatch, readiness, status, cancellation, and artifact history.', 'large', {
		projectId: 'project_demo', csrfToken: 'catalog', sourceSha: 'a'.repeat(40), canOperate: true, timeZone: 'UTC',
	}, [{ name: 'props', type: 'object', defaultValue: {}, description: 'Workflow operation, recent runs, authority, and user time zone.' }], undefined,
	'@treeseed/ui/components/astro/workflow/WorkflowExecutionPanel.astro'),
  serviceEntry('provider-mark', 'ProviderMark', 'Provider identity mark with accessible fallback artwork.', 'inline', {
    provider: 'github',
    label: 'GitHub',
    size: 'lg',
  }, [
    { name: 'provider', type: 'string', defaultValue: 'github', description: 'Stable provider identifier.' },
    { name: 'label', type: 'string', defaultValue: 'GitHub', description: 'Accessible provider label.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: 'lg', description: 'Rendered mark size.' },
  ]),
  serviceEntry('provider-card', 'ProviderCard', 'Compact provider connection card using canonical surface and status components.', 'medium', {
    provider: 'github',
    label: 'GitHub',
    status: 'Ready',
  }, [
    { name: 'provider', type: 'string', defaultValue: 'github', description: 'Provider identity used by its mark.' },
    { name: 'label', type: 'string', defaultValue: 'GitHub', description: 'Connection display label.' },
    { name: 'description', type: 'string', defaultValue: 'Organization connection', description: 'Provider account context.' },
    { name: 'status', type: 'string', defaultValue: 'Ready', description: 'Optional readiness label.' },
  ]),
  serviceEntry('capability-selector', 'CapabilitySelector', 'Provider-neutral capability selection with planned-state handling.', 'medium', {
    capabilities: 3,
    readonly: false,
  }, [
    { name: 'capabilities', type: 'Capability[]', defaultValue: 3, description: 'Supported provider capabilities.' },
    { name: 'name', type: 'string', defaultValue: 'capabilities', description: 'Submitted field name.' },
    { name: 'readonly', type: 'boolean', defaultValue: false, description: 'Prevents capability changes.' },
  ]),
  serviceEntry('credential-field', 'CredentialField', 'Credential input with explicit local-encryption or metadata classification.', 'medium', {
    name: 'installationToken',
    sensitive: true,
  }, [
    { name: 'name', type: 'string', defaultValue: 'installationToken', description: 'Credential field name.' },
    { name: 'label', type: 'string', defaultValue: 'Installation token', description: 'Visible field label.' },
    { name: 'description', type: 'string', defaultValue: 'Used for read-only validation.', description: 'Purpose and usage guidance.' },
    { name: 'sensitive', type: 'boolean', defaultValue: true, description: 'Marks values for local encryption.' },
  ]),
  serviceEntry('secret-custody-badge', 'SecretCustodyBadge', 'Canonical custody-mode label for encrypted and external credential storage.', 'inline', {
    mode: 'client_encrypted_vault',
  }, [
    { name: 'mode', type: 'string', defaultValue: 'client_encrypted_vault', description: 'Credential custody mode.' },
  ]),
  serviceEntry('permission-checklist', 'PermissionChecklist', 'Expandable minimum-provider-permission guidance.', 'medium', {
    permissions: 3,
    open: false,
  }, [
    { name: 'title', type: 'string', defaultValue: 'Required provider permissions', description: 'Checklist heading.' },
    { name: 'permissions', type: 'string[]', defaultValue: 3, description: 'Human-readable minimum permissions.' },
    { name: 'open', type: 'boolean', defaultValue: false, description: 'Initial disclosure state.' },
  ]),
  serviceEntry('operation-authorization-dialog', 'OperationAuthorizationDialog', 'Explicit single-use credential lease authorization disclosure.', 'large', {
    operation: 'Validate connection',
    requiredFields: 1,
  }, [
    { name: 'operation', type: 'string', defaultValue: 'Validate connection', description: 'Security-sensitive operation being authorized.' },
    { name: 'destination', type: 'string', defaultValue: 'Operations runner', description: 'Recipient of sealed credentials.' },
    { name: 'requiredFields', type: 'string[]', defaultValue: 1, description: 'Exact credential fields requested.' },
    { name: 'duration', type: 'string', defaultValue: 'Up to five minutes', description: 'Lease validity description.' },
  ]),
];
