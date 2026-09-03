import type { UiContext } from '../../lib/foundation/contracts.ts';

export interface SemanticItem {
	id: string;
	title: string;
	description?: string;
	status?: string;
	meta?: string;
	href?: string;
}

export interface SemanticRegionData {
	items?: SemanticItem[];
	content?: string;
	emptyTitle?: string;
	emptyDescription?: string;
}

export interface SemanticWorkspaceProps {
	viewId: string;
	context?: UiContext;
	regions?: Record<string, SemanticRegionData>;
	onAction?: (actionId: string, selection?: string) => void | Promise<void>;
	onNavigate?: (viewId: string) => void;
	className?: string;
}
