import { useId, useState } from 'react';
import type { CommandEntity, CommandEntityDetail } from './types.ts';
import { CommandOverlayTrigger } from './overlay-navigation.tsx';
import { StructuredSourceEditor } from './editor/SourceEditor.tsx';
import { ProposalReviewEditor } from './detail/ProposalReviewEditor.tsx';
import { NestedRelationTimelines } from './detail/NestedRelationTimelines.tsx';
import { AgentDefinitionEditor } from './detail/AgentDefinitionEditor.tsx';

function formattedTime(value: string | null | undefined, timeZone: string) {
	if (!value) return null;
	const date = new Date(value);
	if (!Number.isFinite(date.valueOf())) return null;
	return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(date);
}

function Value({ value }: { value: unknown }) {
	if (value === null || value === undefined || value === '') return <span className="ts-command-muted">Not recorded</span>;
	if (typeof value === 'object') return <details className="ts-command-forensic"><summary>Forensic record</summary><pre>{JSON.stringify(value, null, 2)}</pre></details>;
	return <span>{String(value)}</span>;
}

function ReadView({ detail, timeZone, onRefresh }: { detail: CommandEntityDetail; timeZone: string; onRefresh?: () => void }) {
	const primary = detail.primary;
	const posted = formattedTime(primary?.postedAt ?? detail.occurredAt, timeZone);
	return <div className="ts-command-reading-layout"><div className="ts-command-reading">
		<section className="ts-command-reading__lead">
			<div className="ts-command-reading__byline"><span>{primary?.actor?.label ?? 'Recorded by'}</span><strong>{primary?.actor?.name ?? 'System participant'}</strong>{primary?.actor?.detail ? <small>{primary.actor.detail}</small> : null}</div>
			{posted ? <div className="ts-command-reading__date"><span>Recorded</span><time dateTime={primary?.postedAt ?? detail.occurredAt ?? undefined}>{posted}</time></div> : null}
		</section>
		{detail.kind === 'error' ? <article className="ts-command-error-brief" role="alert"><header><span>{detail.severity ?? 'Operational issue'}</span><strong>{detail.title}</strong></header><p>{primary?.content?.body || detail.description}</p><dl>{primary?.facts?.map((field) => <div key={field.label}><dt>{field.label}</dt><dd><Value value={field.value} /></dd></div>)}</dl></article> : <article className="ts-command-reading__content" data-missing={primary?.content?.missing ? 'true' : 'false'}><header><span>{primary?.content?.label ?? detail.kind.replace(/-/gu, ' ')}</span>{primary?.content?.classification ? <small>{primary.content.classification.replace(/[-_]/gu, ' ')}</small> : null}</header><div>{primary?.content?.missing ? `No ${primary.content.label.toLowerCase()} content was returned. Use Debug to inspect the source record and determine where it was lost.` : primary?.content?.body || detail.description || 'No readable content has been recorded.'}</div></article>}
		{detail.kind === 'proposal' && detail.permissions?.edit ? <ProposalReviewEditor detail={detail} /> : null}
		{detail.kind !== 'error' && primary?.facts?.length ? <dl className="ts-command-reading__facts">{primary.facts.map((field) => <div key={field.label}><dt>{field.label}</dt><dd><Value value={field.value} /></dd></div>)}</dl> : null}
		{detail.timeline?.length ? <section className="ts-command-reading__activity"><header><span>What changed</span><h3>Activity</h3></header><ol>{detail.timeline.map((entry) => <li key={entry.id}><div className="ts-command-reading__event-labels">{entry.category ? <span>{entry.category}</span> : null}{entry.status ? <span data-status>{entry.status}</span> : null}</div><time dateTime={entry.timestamp}>{formattedTime(entry.timestamp, timeZone)}</time><strong>{entry.title}</strong>{entry.description ? <p>{entry.description}</p> : null}</li>)}</ol></section> : null}
	</div><NestedRelationTimelines items={detail.related ?? []} timeZone={timeZone} detail={detail} onRefresh={onRefresh} /></div>;
}

function DebugView({ detail, timeZone }: { detail: CommandEntityDetail; timeZone: string }) {
	const integrity = [
		{ label: 'Primary content', value: detail.primary?.content?.missing ? 'Missing' : detail.primary?.content?.body ? 'Present' : 'Unclassified', danger: detail.primary?.content?.missing },
		{ label: 'Attribution', value: detail.primary?.actor?.name ?? 'Missing', danger: !detail.primary?.actor?.name },
		{ label: 'Structured sections', value: detail.sections?.length ?? 0 },
		{ label: 'Timeline records', value: detail.timeline?.length ?? 0 },
		{ label: 'Relations', value: detail.related?.length ?? 0 },
		{ label: 'Raw source', value: detail.data ? 'Present' : 'Missing', danger: !detail.data },
	];
	return <div className="ts-command-detail">
		<section className="ts-command-debug-summary"><header><span>Diagnostic overview</span><h3>Data integrity</h3><p>Use this inventory to spot absent or unclassified entity data before inspecting each field.</p></header><dl>{integrity.map((item) => <div key={item.label} data-danger={item.danger ? 'true' : 'false'}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>
		{detail.links?.length ? <nav className="ts-command-detail__links" aria-label="Record resources">{detail.links.map((link) => <a key={link.href} href={link.href} {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}>{link.label} <span aria-hidden="true">↗</span></a>)}</nav> : null}
		{detail.metrics?.length ? <div className="ts-command-detail__metrics">{detail.metrics.map((metric) => <div key={metric.label} data-tone={metric.tone}><small>{metric.label}</small><strong>{metric.value}</strong>{metric.detail ? <span>{metric.detail}</span> : null}</div>)}</div> : null}
		{detail.sections?.map((section) => <section key={section.id} className="ts-command-detail__section"><h3>{section.title}</h3>{section.body ? <p>{section.body}</p> : null}{section.fields?.length ? <dl>{section.fields.map((field) => <div key={field.label}><dt>{field.label}</dt><dd><Value value={field.value} /></dd></div>)}</dl> : null}</section>)}
		{detail.timeline?.length ? <section className="ts-command-detail__section"><h3>Evidence timeline</h3><ol className="ts-command-timeline">{detail.timeline.map((entry) => <li key={entry.id}><div className="ts-command-debug-labels">{entry.category ? <span>{entry.category}</span> : <span data-missing>Unclassified event</span>}{entry.status ? <span>{entry.status}</span> : null}</div><time dateTime={entry.timestamp}>{formattedTime(entry.timestamp, timeZone)}</time><strong>{entry.title}</strong>{entry.description ? <p>{entry.description}</p> : null}{entry.details ? <Value value={entry.details} /> : null}</li>)}</ol></section> : null}
		{detail.related?.length ? <section className="ts-command-detail__section"><h3>Related records</h3><div className="ts-command-related">{detail.related.map((item) => <CommandOverlayTrigger key={`${item.kind}:${item.id}`} target={item}><span>{item.kind}</span><strong>{item.title}</strong></CommandOverlayTrigger>)}</div></section> : null}
		<section className="ts-command-detail__section"><h3>Complete record</h3><Value value={detail.data ?? detail} /></section>
	</div>;
}

export function CommandDetailViews({ detail, timeZone, authoringEndpoint, onRefresh }: { detail: CommandEntityDetail; timeZone: string; authoringEndpoint: string; onRefresh?: () => void }) {
	const authoring = detail.permissions?.edit && detail.data && typeof detail.data.authoring === 'object' && detail.data.authoring ? detail.data.authoring as Record<string, unknown> : null;
	const [view, setView] = useState<'readability' | 'debug' | 'edit'>('readability');
	const id = useId().replace(/:/gu, '');
	const readTab = `${id}-read-tab`; const readPanel = `${id}-read-panel`; const debugTab = `${id}-debug-tab`; const debugPanel = `${id}-debug-panel`; const editTab = `${id}-edit-tab`; const editPanel = `${id}-edit-panel`;
	return <div className="ts-command-view">
		<div className="ts-command-view__tabs" role="tablist" aria-label="Detail view">
			<button type="button" role="tab" id={readTab} aria-controls={readPanel} aria-selected={view === 'readability'} onClick={() => setView('readability')}><span>{detail.kind === 'proposal' ? 'Review' : 'Readability'}</span><small>Human content and relationships</small></button>
			<button type="button" role="tab" id={debugTab} aria-controls={debugPanel} aria-selected={view === 'debug'} onClick={() => setView('debug')}><span>{detail.kind === 'proposal' ? 'Inspector' : 'Debug'}</span><small>Integrity and complete record</small></button>
			{authoring && detail.kind !== 'proposal' ? <button type="button" role="tab" id={editTab} aria-controls={editPanel} aria-selected={view === 'edit'} onClick={() => setView('edit')}><span>Edit</span><small>Canonical TreeDX source</small></button> : null}
		</div>
		<div id={view === 'readability' ? readPanel : view === 'debug' ? debugPanel : editPanel} role="tabpanel" aria-labelledby={view === 'readability' ? readTab : view === 'debug' ? debugTab : editTab}>{view === 'readability' ? <ReadView detail={detail} timeZone={timeZone} onRefresh={onRefresh} /> : view === 'debug' ? <DebugView detail={detail} timeZone={timeZone} /> : authoring ? detail.kind === 'agent' ? <AgentDefinitionEditor detail={detail} authoring={authoring} saveEndpoint={authoringEndpoint} /> : <StructuredSourceEditor title={detail.title} description="Edit the canonical repository definition. Validation and expected-base concurrency prevent invalid or stale changes." source={String(authoring.source ?? '')} language={authoring.language === 'yaml' ? 'yaml' : 'mdx'} saveEndpoint={authoringEndpoint} expectedBase={typeof authoring.expectedBase === 'string' ? authoring.expectedBase : null} projectId={String(authoring.projectId ?? detail.projectId ?? '')} projectName={String(authoring.projectName ?? detail.projectName ?? 'Selected project')} path={String(authoring.path ?? '')} /> : null}</div>
	</div>;
}
