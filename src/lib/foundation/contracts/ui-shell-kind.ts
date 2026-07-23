


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
