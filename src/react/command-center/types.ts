export type CommandEntityKind =
	| 'proposal' | 'decision' | 'question' | 'artifact' | 'error'
	| 'agent' | 'signal' | 'proposal-type' | 'assignment'
	| 'execution' | 'simulation' | 'seed' | 'workday' | 'note' | 'group' | 'group-edge';

export interface CommandMetric {
	label: string;
	value: string | number;
	detail?: string | null;
	tone?: 'default' | 'live' | 'positive' | 'warning' | 'danger';
}

export interface CommandTimelineEntry {
	id: string;
	timestamp: string;
	title: string;
	description?: string | null;
	category?: string | null;
	status?: string | null;
	details?: Record<string, unknown> | null;
}

export interface CommandRelation {
	id: string;
	from: string;
	to: string;
	label: string;
	tone?: 'default' | 'input' | 'output' | 'signal';
}

export interface CommandEntity {
	id: string;
	kind: CommandEntityKind;
	title: string;
	description: string;
	status?: string | null;
	projectId?: string | null;
	projectName?: string | null;
	activityProfile?: string | null;
	occurredAt?: string | null;
	severity?: string | null;
	pinned?: boolean;
	hidden?: boolean;
	resolved?: boolean;
	actionable?: boolean;
	version?: number;
	metrics?: CommandMetric[];
	tags?: string[];
	data?: Record<string, unknown>;
}

export interface CommandEntityDetail extends CommandEntity {
	primary?: {
		actor?: { label: string; name: string; detail?: string | null };
		postedAt?: string | null;
		content?: { label: string; body: string; classification?: string | null; missing?: boolean };
		facts?: Array<{ label: string; value: unknown }>;
	};
	sections?: Array<{ id: string; title: string; fields?: Array<{ label: string; value: unknown }>; body?: string | null }>;
	timeline?: CommandTimelineEntry[];
	related?: CommandEntity[];
	permissions?: {
		edit?: boolean; vote?: boolean; resolve?: boolean; note?: boolean; question?: boolean;
		open?: boolean; startVoting?: boolean; decide?: boolean; withdraw?: boolean; supersede?: boolean;
		answer?: boolean; cancel?: boolean; rerun?: boolean; create?: boolean; clone?: boolean; deactivate?: boolean;
	};
	links?: Array<{ label: string; href: string; external?: boolean }>;
}

export interface CommandCollectionPage {
	revision: string;
	generatedAt: string;
	surface: 'inbox' | 'decisions' | 'build' | 'direction' | 'results' | 'find';
	title: string;
	description: string;
	unreadCount: number;
	items: CommandEntity[];
	secondaryItems?: CommandEntity[];
	metrics?: CommandMetric[];
	relations?: CommandRelation[];
	page?: { hasMore: boolean; nextCursor: string | null; total: number };
	filters?: Record<string, string>;
	projects?: Array<{ id: string; name: string }>;
}

export interface CommandRealtimePreference {
	enabled: boolean;
	intervalMs: number;
}

export interface CommandWorkspaceEndpoints {
	collection: string;
	detailBase: string;
	state: string;
	actions: string;
	simulations?: string;
	draft?: string;
	authoringBundle?: string;
}
