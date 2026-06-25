import type { ButtonAction } from '../../astro/types.ts';

export type UiShellKind = 'auth' | 'public' | 'product';
export type UiSurfaceContext = 'public' | 'personal' | 'team' | 'project' | 'market' | 'seller' | 'admin';
export type UiTemplateKind = 'dashboard' | 'profile' | 'collection' | 'detail' | 'reader' | 'workspace' | 'settings' | 'wizard';
export type ResolvedActionState =
	| 'allowed'
	| 'readOnly'
	| 'denied'
	| 'hidden'
	| 'disabledWithReason'
	| 'requiresSignIn'
	| 'requiresUpgrade'
	| 'requiresSetup'
	| 'requiresEntitlement';

export interface ResolvedAction {
	id: string;
	label: string;
	state: ResolvedActionState;
	reason?: string;
	remediation?: string;
	href?: string;
	method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
	confirmation?: 'none' | 'confirm' | 'strongConfirm';
	auditSensitivity?: 'normal' | 'sensitive' | 'danger';
}

export interface HelpTopicLink {
	topicId: string;
	title: string;
	href: string;
	visibility: 'public' | 'authenticated' | 'team' | 'project' | 'admin';
	summary?: string;
	source?: 'runtime-content' | 'capability' | 'resource-schema' | 'action-state';
	current?: boolean;
}

export interface HelpDefinition {
	topicIds: string[];
	summary?: string;
	relatedDocs?: string[];
	relatedActions?: string[];
	feedbackType?: 'bug' | 'feature' | 'question' | 'contentIssue' | 'uxIssue';
}

export interface HelpTopic {
	id: string;
	title: string;
	summary: string;
	href?: string;
	visibility: HelpTopicLink['visibility'];
	source: NonNullable<HelpTopicLink['source']>;
	bodyHtml?: string;
}

export interface HelpSearchResult {
	topicId: string;
	title: string;
	summary: string;
	href?: string;
	source: NonNullable<HelpTopicLink['source']>;
}

export interface ResourceHelpSchema extends HelpDefinition {
	primaryTopicId?: string;
	searchTags?: string[];
	actionHelp?: Record<string, { summary: string; remediation?: string }>;
}

export interface HelpContext {
	capabilityId?: string;
	topicIds: string[];
	shell: UiShellKind;
	context: UiSurfaceContext;
	resourceType?: string;
	resourceId?: string;
	routePattern?: string;
	canonicalPath?: string;
	template?: UiTemplateKind;
	summary?: string;
	topics?: HelpTopic[];
	relatedDocs: HelpTopicLink[];
	relatedActions: ResolvedAction[];
	searchScope: 'global' | 'public' | 'team' | 'project' | 'market' | 'admin';
	searchPlaceholder?: string;
	visibility: 'public' | 'authenticated' | 'team' | 'project' | 'admin';
	feedbackType?: FeedbackSubmissionType;
}

export interface FeedbackContext {
	url: string;
	canonicalPath?: string;
	title?: string;
	capabilityId?: string;
	shell: UiShellKind;
	context: UiSurfaceContext;
	teamId?: string;
	projectId?: string;
	resourceType?: string;
	resourceId?: string;
	userId?: string;
	environment?: 'local' | 'staging' | 'production';
	submissionEndpoint?: string;
	allowAnonymous?: boolean;
	screenshotPolicy?: 'disabled' | 'optional';
	attachmentStoragePolicy?: 'public' | 'private';
	buildId?: string;
	revision?: string;
	routePattern?: string;
	policy?: 'public' | 'authenticated' | 'team' | 'project' | 'admin';
	source?: 'page' | 'help';
	helpTopicId?: string;
	helpTopicTitle?: string;
}

export type FeedbackSubmissionType = 'bug' | 'feature_suggestion' | 'question' | 'content_issue' | 'ux_issue';

export interface FeedbackScreenshotAttachment {
	name: string;
	type: 'image/png' | 'image/jpeg' | 'image/webp';
	size: number;
	dataUrl?: string;
	redacted: boolean;
	storagePolicy: 'public' | 'private';
}

export interface FeedbackSubmission {
	type: FeedbackSubmissionType;
	message: string;
	contactEmail?: string;
	context: FeedbackContext;
	client: {
		url: string;
		userAgent?: string;
		viewport: { width: number; height: number; devicePixelRatio: number };
		locale?: string;
		timeZone?: string;
		appearance?: string;
		reducedMotion?: boolean;
	};
	screenshot?: FeedbackScreenshotAttachment;
}

export interface CapabilityDefinition {
	id: string;
	label: string;
	scope: UiSurfaceContext;
	path: string;
	template: UiTemplateKind;
	resourceType?: string;
	access: string[];
	actions: string[];
	primaryAction?: string;
	secondaryActions?: string[];
	help?: HelpDefinition;
	feedbackContext?: string[];
}

export interface ResourceDisplaySchema {
	label: string;
	pluralLabel?: string;
	summaryField?: string;
	statusField?: string;
}

export interface ResourceCollectionSchema {
	emptyTitle: string;
	emptyDescription?: string;
	displayModes?: Array<'cards' | 'list' | 'table' | 'reader'>;
}

export interface ResourceActionSchema {
	primary?: string[];
	secondary?: string[];
	danger?: string[];
}

export interface ResourceUiSchema {
	type: string;
	display: ResourceDisplaySchema;
	collection?: ResourceCollectionSchema;
	actions?: ResourceActionSchema;
	help?: HelpDefinition;
}

export interface NavigationItem {
	label: string;
	href: string;
}

export interface Breadcrumb {
	label: string;
	href?: string;
}

export interface ResourceSummary {
	id: string;
	title: string;
	description?: string;
	href?: string;
	status?: string;
	meta?: string;
}

export type DashboardTone = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'muted';

export interface DashboardSummaryItem {
	id?: string;
	label: string;
	value: string | number;
	description?: string;
	href?: string;
	tone?: DashboardTone;
}

export interface DashboardActivityItem {
	id: string;
	title: string;
	description?: string;
	timestamp?: string;
	href?: string;
	meta?: string;
	tone?: DashboardTone;
}

export interface DashboardAlertItem {
	id: string;
	title: string;
	description?: string;
	href?: string;
	tone: Exclude<DashboardTone, 'muted'>;
}

export interface DashboardSection {
	id: string;
	title: string;
	description?: string;
	items: DashboardSummaryItem[];
	emptyTitle?: string;
	emptyDescription?: string;
}

export interface DashboardViewModel {
	title: string;
	description?: string;
	context: DashboardSection;
	status?: DashboardSection;
	setup?: DashboardSection;
	nextActions?: ResourceSummary[];
	primaryResources?: ResourceSummary[];
	alerts?: DashboardAlertItem[];
	activity?: DashboardActivityItem[];
	notifications?: DashboardSection;
	allocation?: DashboardSection;
	deployment?: DashboardSection;
	emptyTitle?: string;
	emptyDescription?: string;
}

export type ReadinessStatus = 'ready' | 'warning' | 'blocked' | 'unknown';

export interface ReadinessItem {
	id: string;
	label: string;
	status: ReadinessStatus;
	message: string;
	href?: string;
	advanced?: boolean;
	action?: ResolvedAction;
}

export interface ReadinessSummaryViewModel {
	title: string;
	description?: string;
	items: ReadinessItem[];
	emptyTitle?: string;
	emptyDescription?: string;
}

export type DistributionStatus = 'draft' | 'packaging' | 'review' | 'published' | 'installed' | 'blocked' | 'unavailable';
export type EntitlementState = 'public' | 'authenticated' | 'team' | 'project' | 'purchased' | 'missing' | 'blocked';
export type ArtifactDeliveryState = 'cdn' | 'contentProxy' | 'signedUrl' | 'queued' | 'unavailable';
export type OverlayEditState = 'disabled' | 'available' | 'requiresSignIn' | 'denied' | 'preview';

export interface DistributionActionSummary {
	id: string;
	label: string;
	state: ResolvedActionState;
	href?: string;
	message?: string;
	entitlement?: EntitlementState;
	delivery?: ArtifactDeliveryState;
}

export interface DistributionItem {
	id: string;
	title: string;
	status: DistributionStatus;
	description?: string;
	href?: string;
	entitlement?: EntitlementState;
	delivery?: ArtifactDeliveryState;
	meta?: string;
	action?: DistributionActionSummary;
}

export interface DistributionSummaryViewModel {
	title: string;
	description?: string;
	items: DistributionItem[];
	emptyTitle?: string;
	emptyDescription?: string;
}

export interface OverlayStatusViewModel {
	state: OverlayEditState;
	label: string;
	message: string;
	routePattern: string;
	resourceType: string;
	action?: ResolvedAction;
}

export type OperatingStatus = 'ready' | 'running' | 'waiting' | 'blocked' | 'failed' | 'completed' | 'needsReview' | 'unknown';

export interface AllocationSummaryItem {
	id: string;
	label: string;
	status: OperatingStatus;
	desired?: string | number;
	inheritedLimit?: string | number;
	override?: string | number;
	scheduledReservation?: string | number;
	activeAssignment?: string | number;
	actualUsage?: string | number;
	message?: string;
	href?: string;
	action?: ResolvedAction;
}

export interface AllocationTreeNode {
	id: string;
	label: string;
	level: 'team' | 'project' | 'workstream' | 'mode' | 'agentClass' | 'agent' | 'providerGrant';
	status: OperatingStatus;
	value?: string | number;
	href?: string;
	current?: boolean;
	children?: AllocationTreeNode[];
}

export interface AllocationViewModel {
	title: string;
	description?: string;
	scopeLabel: string;
	items: AllocationSummaryItem[];
	tree?: AllocationTreeNode[];
	actions?: ResolvedAction[];
	emptyTitle?: string;
	emptyDescription?: string;
}

export interface WorkQueueItem {
	id: string;
	title: string;
	status: OperatingStatus;
	description?: string;
	project?: string;
	agent?: string;
	href?: string;
	action?: ResolvedAction;
}

export interface WorkQueueViewModel {
	title: string;
	description?: string;
	items: WorkQueueItem[];
	emptyTitle?: string;
	emptyDescription?: string;
}

export interface ActivityTimelineItem {
	id: string;
	title: string;
	status: OperatingStatus;
	description?: string;
	timestamp?: string;
	meta?: string;
	href?: string;
}

export interface ActivityTimelineViewModel {
	title: string;
	description?: string;
	items: ActivityTimelineItem[];
	emptyTitle?: string;
	emptyDescription?: string;
}

export interface WorkspaceViewModel {
	title: string;
	description?: string;
	context: DashboardSection;
	status?: DashboardSection;
	allocation?: AllocationViewModel;
	queue?: WorkQueueViewModel;
	timeline?: ActivityTimelineViewModel;
	resources?: ResourceSummary[];
	emptyTitle?: string;
	emptyDescription?: string;
}

export interface CollectionFilterOption {
	label: string;
	value: string;
}

export interface CollectionFilterField {
	key: string;
	label: string;
	type: 'search' | 'select';
	value?: string;
	options?: CollectionFilterOption[];
}

export interface CollectionViewModel {
	title: string;
	description?: string;
	rows: Array<Record<string, unknown>>;
	columns: Array<{ key: string; label: string }>;
	filters?: CollectionFilterField[];
	resources?: ResourceSummary[];
	emptyTitle: string;
	emptyDescription?: string;
}

export interface PageViewModel {
	title: string;
	description?: string;
	capability?: CapabilityDefinition;
	schema?: ResourceUiSchema;
	dashboard?: DashboardViewModel;
	collection?: CollectionViewModel;
	help?: HelpContext;
	feedback?: FeedbackContext;
	actions: ResolvedAction[];
	navigation: NavigationItem[];
	breadcrumbs: Breadcrumb[];
	permissions: Record<string, ResolvedActionState>;
}

export function actionToButton(action: ResolvedAction): ButtonAction {
	return {
		label: action.label,
		href: action.state === 'allowed' ? action.href : undefined,
		type: action.href ? undefined : 'button',
		variant: action.auditSensitivity === 'danger' ? 'danger' : action.state === 'allowed' ? 'primary' : 'secondary',
		disabled: action.state !== 'allowed',
		ariaLabel: action.reason ? `${action.label}. ${action.reason}` : action.label,
	};
}
