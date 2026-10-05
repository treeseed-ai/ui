import { useState } from 'react';
import type { CommandEntity, CommandEntityDetail } from '../types.ts';
import { CommandOverlayTrigger } from '../overlay-navigation.tsx';
import { DiscussionComposer } from './DiscussionComposer.tsx';

function shownTime(value: string | null | undefined, timeZone: string) {
	if (!value) return null;
	const date = new Date(value);
	return Number.isFinite(date.valueOf()) ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium',timeStyle: 'short',timeZone }).format(date) : null;
}

function RelationTimeline({ label,description,items,timeZone,onReply }: { label: string; description: string; items: CommandEntity[]; timeZone: string; onReply?: (item: CommandEntity) => void }) {
	return <details className="ts-nested-timeline" open={items.length > 0}>
		<summary><span><strong>{label}</strong><small>{description}</small></span><b>{items.length}</b></summary>
		{items.length ? <ol>{items.map((item) => { const timestamp = shownTime(item.occurredAt,timeZone); return <li key={`${item.kind}:${item.id}`}><CommandOverlayTrigger target={item}><span className="ts-nested-timeline__rail" aria-hidden="true" /><span className="ts-nested-timeline__kind">{item.kind.replace(/-/gu,' ')}</span><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}{timestamp ? <time dateTime={item.occurredAt ?? undefined}>{timestamp}</time> : null}<i aria-hidden="true">Inspect →</i></CommandOverlayTrigger>{onReply ? <button type="button" className="ts-nested-timeline__reply" onClick={() => onReply(item)}>Reply</button> : null}</li>; })}</ol> : <p className="ts-nested-timeline__empty">Nothing linked yet.</p>}
	</details>;
}

export function NestedRelationTimelines({ items,timeZone,detail,onRefresh }: { items: CommandEntity[]; timeZone: string; detail?: CommandEntityDetail; onRefresh?: () => void }) {
	const [reply,setReply] = useState<CommandEntity | null>(null);
	const notes = items.filter((item) => item.kind === 'note');
	const questions = items.filter((item) => item.kind === 'question');
	const knowledge = items.filter((item) => item.kind !== 'note' && item.kind !== 'question');
	return <aside className="ts-related-workspace" aria-label="Related content timelines">
		<header><span>Decision context</span><h3>Related knowledge</h3><p>Follow any thread into another layer without losing this record.</p></header>
		<RelationTimeline label="Notes" description="Observations, concerns, and responses" items={notes} timeZone={timeZone} onReply={detail?.kind === 'proposal' ? setReply : undefined} />
		<RelationTimeline label="Questions" description="Open inquiries and recorded answers" items={questions} timeZone={timeZone} onReply={detail?.kind === 'proposal' ? setReply : undefined} />
		<RelationTimeline label="Linked knowledge" description="Evidence, objectives, artifacts, and decisions" items={knowledge} timeZone={timeZone} />
		{reply && detail ? <DiscussionComposer detail={detail} initialKind="response" parent={reply} onClose={() => setReply(null)} onSaved={() => { setReply(null); onRefresh?.(); }} /> : null}
	</aside>;
}
