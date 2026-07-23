import type { ButtonAction } from "../../../astro/types.ts";
import type { CollectionFilterField, DashboardViewModel } from './dashboard-view-model.ts';
import type { Breadcrumb, CapabilityDefinition, FeedbackContext, HelpContext, NavigationItem, ResolvedAction, ResolvedActionState, ResourceSummary, ResourceUiSchema } from './ui-shell-kind.ts';

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
