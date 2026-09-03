export type ResourceValue = string | number | boolean | null;

export type FieldKind =
	| 'string' | 'text' | 'markdown' | 'number' | 'percentage' | 'boolean'
	| 'enum' | 'multiselect' | 'resource' | 'datetime' | 'secret';

export interface FieldOption { value: string; label: string }

export interface FieldDefinition {
	id: string;
	label: string;
	type: FieldKind;
	description?: string;
	required?: boolean;
	readonly?: boolean;
	searchable?: boolean;
	filterable?: boolean;
	sortable?: boolean;
	secret?: boolean;
	resource?: string;
	options?: FieldOption[];
	minimum?: number;
	maximum?: number;
}

export interface WorkflowStepDefinition {
	id: string;
	label: string;
	description?: string;
	fields: FieldDefinition[];
}

export type ActionIntent = 'default' | 'primary' | 'danger';
export type ActionScope = 'global' | 'collection' | 'resource' | 'selection';
export type ActionExecutionState =
	| 'available' | 'configuring' | 'confirming' | 'submitted'
	| 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';

export interface ActionDefinition {
	id: string;
	label: string;
	description?: string;
	scope: ActionScope;
	intent?: ActionIntent;
	operationId?: string;
	/** Renderer-neutral multi-step flow used when one action spans multiple control-plane operations. */
	workflowId?: string;
	input?: FieldDefinition[];
	/** Ordered, renderer-neutral configuration steps. Values accumulate across steps. */
	steps?: WorkflowStepDefinition[];
	confirmation?: 'none' | 'confirm' | 'strongConfirm';
	asynchronous?: boolean;
}

export interface ActionExecution {
	id: string;
	actionId: string;
	target?: { resource: string; id: string };
	state: ActionExecutionState;
	progress?: number;
	message?: string;
	startedAt?: string;
	completedAt?: string;
	result?: Record<string, unknown>;
}

export interface RelationshipDefinition {
	id: string;
	label: string;
	resource: string;
	cardinality: 'one' | 'many';
	actions?: Array<'view' | 'attach' | 'detach' | 'create' | 'search'>;
}

export interface SignalDefinition {
	id: string;
	label: string;
	type: 'status' | 'health' | 'metric' | 'warning' | 'progress' | 'capacity' | 'version';
	unit?: string;
	primary?: boolean;
}

export interface ResourceDefinition {
	id: string;
	label: string;
	pluralLabel: string;
	identityField: string;
	descriptionField?: string;
	statusField?: string;
	fields: FieldDefinition[];
	actions?: string[];
	relationships?: RelationshipDefinition[];
	signals?: SignalDefinition[];
	activity?: boolean;
	capabilities?: Array<'create' | 'edit' | 'delete' | 'search' | 'filter' | 'bulk' | 'monitor'>;
	presentation?: string;
}

export type ViewRegionKind =
	| 'profile' | 'collection' | 'resource' | 'form' | 'document' | 'activity'
	| 'signals' | 'relationships' | 'chat' | 'allocation' | 'search' | 'custom';

export interface ViewRegionDefinition {
	id: string;
	label?: string;
	type: ViewRegionKind;
	resource?: string;
	relationship?: string;
	fields?: string[];
	actions?: string[];
	presentation?: string;
	optional?: boolean;
}

export type ViewLayout = 'dashboard' | 'single' | 'split' | 'three-pane' | 'workbench' | 'artifact';

export interface ViewDefinition {
	id: string;
	label: string;
	root?: boolean;
	layout: ViewLayout;
	context: 'personal' | 'team' | 'project' | 'selection';
	regions: ViewRegionDefinition[];
	actions?: string[];
	route?: string;
	keywords?: string[];
}

export interface UiContext {
	userId?: string;
	teamId?: string;
	projectId?: string;
	focusedResource?: { type: string; id: string };
	selection?: string[];
	permissions?: string[];
	availableActions?: string[];
}

export interface RendererCapabilities {
	width: 'narrow' | 'medium' | 'wide';
	pointer: boolean;
	overlays: boolean;
	resizable: boolean;
	charts: boolean;
	richEditor: boolean;
	reducedMotion?: boolean;
}
