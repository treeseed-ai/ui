import { coreUiRegistry, type FieldDefinition, type ResourceDefinition } from '../../lib/foundation/contracts.ts';

type Row = Record<string, unknown>;
const record = (value: unknown): Row => value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {};
const display = (value: unknown) => value == null || value === '' ? '—' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
const resourceAliases: Record<string, string> = { group: 'agent', assignment: 'allocation', event: 'content', signal: 'content', artifact: 'content', book: 'knowledge', workday: 'project' };

function fieldsFor(resource: ResourceDefinition | undefined, source: Row, mode: string) {
	if (mode === 'easy') return Object.entries(record(source.summary)).slice(0, 8).map(([id, value]) => ({ id, label: id, value, field: undefined }));
	const result: Array<{ id: string; label: string; value: unknown; field?: FieldDefinition }> = (resource?.fields ?? []).map((field) => ({ id: field.id, label: field.label, value: source[field.id], field }));
	for (const [id, value] of Object.entries(source)) if (!result.some((entry) => entry.id === id) && result.length < 18) result.push({ id, label: id, value });
	return result;
}

function FieldValue({ field, value }: { field?: FieldDefinition; value: unknown }) {
	if (field?.secret || field?.type === 'secret') return <span>Configured securely</span>;
	if (typeof value === 'object' && value !== null) return <pre>{display(value)}</pre>;
	return <>{display(value)}</>;
}

export function AtlasResourceDetail({ kind, data, mode, onInspect }: { kind: string; data: Row; mode: string; onInspect: (kind: string, id: string) => void }) {
	const resourceId = resourceAliases[kind] ?? kind, resource = coreUiRegistry.resources.get(resourceId);
	const source = record(data.data), primary = record(data.primary), summary = record(data.summary);
	const selectedSource = kind === 'agent' && mode === 'designed' ? record(source.definition)
		: kind === 'agent' && mode === 'assigned' ? { assignments: source.assignments ?? data.related }
		: kind === 'agent' && mode === 'observed' ? { events: source.observed, evidence: data.evidence, status: data.status }
		: source;
	const fields = fieldsFor(resource, mode === 'easy' ? { ...selectedSource, summary } : selectedSource, mode);
	const signals = resource?.signals ?? [], activity = Array.isArray(data.activity) ? data.activity.map(record) : Array.isArray(source.observed) ? source.observed.map(record) : [];
	const related = Array.isArray(data.related) ? data.related.map(record) : [];
	return <div className="ts-atlas-record-detail" data-resource={resourceId} data-presentation={`${kind}-${mode}`}>
		<section aria-labelledby="atlas-detail-title"><small>{String(data.status ?? mode)}</small><h3 id="atlas-detail-title">{String(data.title ?? primary.name ?? resource?.label ?? 'Operational record')}</h3><p>{String(data.description ?? record(primary.content).body ?? summary.description ?? 'No summary was reported.')}</p></section>
		{signals.length ? <section aria-labelledby="atlas-detail-signals"><h4 id="atlas-detail-signals">Signals</h4><dl>{signals.map((signal) => <div key={signal.id}><dt>{signal.label}</dt><dd>{display(source[signal.id] ?? summary[signal.id])}{signal.unit ?? ''}</dd></div>)}</dl></section> : null}
		<section aria-labelledby="atlas-detail-fields"><h4 id="atlas-detail-fields">{mode === 'easy' ? 'Operational summary' : 'Canonical fields'}</h4><dl>{fields.map(({ id, label, value, field }) => <div key={id}><dt>{label.replace(/([A-Z])/gu, ' $1')}</dt><dd><FieldValue field={field} value={value} /></dd></div>)}</dl></section>
		{related.length ? <section aria-labelledby="atlas-detail-related"><h4 id="atlas-detail-related">Relationships</h4><ul>{related.slice(0, 20).map((entry, index) => { const id = String(entry.id ?? entry.targetId ?? ''), relatedKind = String(entry.kind ?? entry.type ?? 'content'); return <li key={`${relatedKind}:${id || index}`}><button type="button" disabled={!id} onClick={() => id && onInspect(relatedKind, id)}>{String(entry.title ?? entry.name ?? (id || `Related item ${index + 1}`))}</button></li>; })}</ul></section> : null}
		{activity.length ? <section aria-labelledby="atlas-detail-activity"><h4 id="atlas-detail-activity">Activity</h4><ol>{activity.slice(0, 12).map((entry, index) => <li key={String(entry.id ?? index)}><button type="button" onClick={() => entry.id && onInspect('event', String(entry.id))}>{String(entry.summary ?? entry.message ?? entry.type ?? `Event ${index + 1}`)}</button></li>)}</ol></section> : null}
	</div>;
}
