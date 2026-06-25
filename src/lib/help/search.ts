import type { HelpSearchResult } from '../foundation/contracts.ts';

interface SearchData {
	topics?: Array<{ id: string; title: string; summary?: string; href?: string; source?: string }>;
	relatedDocs?: Array<{ topicId: string; title: string; summary?: string; href?: string; source?: string }>;
	actions?: Array<{ id: string; label: string; reason?: string; remediation?: string }>;
}

function normalize(value: string): string {
	return value.toLowerCase().replace(/\s+/gu, ' ').trim();
}

export function searchContextualHelp(data: SearchData, query: string): HelpSearchResult[] {
	const needle = normalize(query);
	const candidates: HelpSearchResult[] = [
		...(data.topics ?? []).map((topic) => ({
			topicId: topic.id,
			title: topic.title,
			summary: topic.summary ?? '',
			href: topic.href,
			source: topic.source === 'runtime-content' || topic.source === 'capability' || topic.source === 'resource-schema' || topic.source === 'action-state'
				? topic.source
				: 'capability',
		} satisfies HelpSearchResult)),
		...(data.relatedDocs ?? []).map((topic) => ({
			topicId: topic.topicId,
			title: topic.title,
			summary: topic.summary ?? '',
			href: topic.href,
			source: topic.source === 'runtime-content' || topic.source === 'capability' || topic.source === 'resource-schema' || topic.source === 'action-state'
				? topic.source
				: 'runtime-content',
		} satisfies HelpSearchResult)),
		...(data.actions ?? []).map((action) => ({
			topicId: action.id,
			title: action.label,
			summary: [action.reason, action.remediation].filter(Boolean).join(' '),
			source: 'action-state',
		} satisfies HelpSearchResult)),
	];
	if (!needle) return candidates.slice(0, 6);
	return candidates
		.filter((item) => normalize(`${item.title} ${item.summary} ${item.topicId}`).includes(needle))
		.slice(0, 8);
}
