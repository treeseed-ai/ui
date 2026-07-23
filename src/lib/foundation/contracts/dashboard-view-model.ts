
import type { DashboardActivityItem, DashboardAlertItem, DashboardSection, ResolvedAction, ResolvedActionState, ResourceSummary } from './ui-shell-kind.ts';

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

export type CommerceActionKind =
	| 'browse'
	| 'checkout'
	| 'install'
	| 'download'
	| 'requestService'
	| 'capacityInquiry'
	| 'sellerSetup'
	| 'stewardReview';

export type CommerceEntitlementState =
	| 'public'
	| 'requiresSignIn'
	| 'requiresPurchase'
	| 'active'
	| 'pendingPayment'
	| 'expired'
	| 'denied';

export type CheckoutPaymentGroupState = 'pending' | 'requiresConfirmation' | 'processing' | 'succeeded' | 'failed' | 'canceled';

export interface CommercePaymentGroupViewModel {
	id: string;
	label: string;
	state: CheckoutPaymentGroupState;
	amountLabel: string;
	sellerLabel?: string;
	action?: ResolvedAction;
}

export interface SellerReadinessViewModel {
	status: ReadinessStatus;
	items: ReadinessItem[];
	nextAction?: ResolvedAction;
}

export interface CommerceOwnershipSummaryViewModel {
	model: string;
	summary: string;
	stewards: Array<{ id?: string; label: string; role?: string }>;
}

export type GovernanceSignalKind = 'question' | 'proposal' | 'backing' | 'vote' | 'decision' | 'event';

export type ProposalDecisionState = 'draft' | 'submitted' | 'underReview' | 'voting' | 'accepted' | 'rejected' | 'archived';

export interface GovernanceSignalViewModel {
	id: string;
	kind: GovernanceSignalKind;
	label: string;
	description?: string;
	weight?: number;
	href?: string;
}

export interface ProposalDecisionViewModel {
	id: string;
	title: string;
	state: ProposalDecisionState;
	scope: string;
	signals: GovernanceSignalViewModel[];
	actions: ResolvedAction[];
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
