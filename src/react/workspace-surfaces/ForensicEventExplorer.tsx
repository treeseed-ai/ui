import { useMemo, useState, type ChangeEvent } from 'react';

export interface ForensicEventRecord {
	id?: string;
	type?: string;
	eventType?: string;
	message?: string;
	summary?: string;
	severity?: string;
	createdAt?: string;
}

const PAGE_SIZE = 25;

function value(...candidates: unknown[]) {
	return candidates.find((candidate) => typeof candidate === 'string' && candidate.trim()) as string | undefined;
}

function routine(event: ForensicEventRecord) {
	return /tick|heartbeat|check-in|lease renewal|compilation tick/i.test(`${value(event.type, event.eventType) ?? ''} ${value(event.message, event.summary) ?? ''}`);
}

export function ForensicEventExplorer({ events, total, hasMore, timeZone }: {
	events: ForensicEventRecord[];
	total?: number;
	hasMore?: boolean;
	timeZone: string;
}) {
	const [query, setQuery] = useState('');
	const [type, setType] = useState('all');
	const [severity, setSeverity] = useState('all');
	const [includeRoutine, setIncludeRoutine] = useState(false);
	const [page, setPage] = useState(1);
	const types = useMemo(() => [...new Set(events.map((event) => value(event.type, event.eventType)).filter(Boolean) as string[])].sort(), [events]);
	const severities = useMemo(() => [...new Set(events.map((event) => value(event.severity)).filter(Boolean) as string[])].sort(), [events]);
	const filtered = useMemo(() => events.filter((event) => {
		const eventType = value(event.type, event.eventType) ?? 'event';
		const eventSeverity = value(event.severity) ?? 'info';
		const haystack = `${eventType} ${eventSeverity} ${value(event.message, event.summary) ?? ''}`.toLowerCase();
		return (includeRoutine || !routine(event)) && (type === 'all' || eventType === type) && (severity === 'all' || eventSeverity === severity) && haystack.includes(query.toLowerCase());
	}), [events, includeRoutine, query, severity, type]);
	const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const currentPage = Math.min(page, pages);
	const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
	const change = (setter: (next: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setter(event.target.value); setPage(1); };
	return <section className="ts-forensic-events" aria-label="Workday event explorer">
		<div className="ts-forensic-events__filters">
			<label><span>Search</span><input type="search" value={query} onChange={change(setQuery)} placeholder="Message or event type" /></label>
			<label><span>Type</span><select value={type} onChange={change(setType)}><option value="all">All types</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
			<label><span>Severity</span><select value={severity} onChange={change(setSeverity)}><option value="all">All severities</option>{severities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
			<label className="ts-forensic-events__routine"><input type="checkbox" checked={includeRoutine} onChange={(event) => { setIncludeRoutine(event.target.checked); setPage(1); }} /> Include routine scheduler activity</label>
		</div>
		<p className="ts-forensic-events__summary">{filtered.length} matching events in this {events.length}-event page{hasMore ? ' · more evidence is available through the API and CLI' : total && total > events.length ? ` of ${total} total` : ''}</p>
		<div className="ts-forensic-events__table" role="region" aria-label="Filtered workday events" tabIndex={0}>
			<table><thead><tr><th scope="col">Event</th><th scope="col">Message</th><th scope="col">Severity</th><th scope="col">Recorded</th></tr></thead>
			<tbody>{visible.length ? visible.map((event, index) => <tr key={event.id ?? `${currentPage}-${index}`}>
				<td data-label="Event">{value(event.type, event.eventType) ?? 'Event'}</td>
				<td data-label="Message">{value(event.message, event.summary) ?? 'Recorded state change'}</td>
				<td data-label="Severity">{value(event.severity) ?? 'info'}</td>
				<td data-label="Recorded">{event.createdAt ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium', timeZone }).format(new Date(event.createdAt)) : '—'}</td>
			</tr>) : <tr><td colSpan={4}>No events match these filters.</td></tr>}</tbody></table>
		</div>
		<nav className="ts-forensic-events__pagination" aria-label="Workday event pages"><button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {currentPage} of {pages}</span><button type="button" disabled={currentPage >= pages} onClick={() => setPage((value) => value + 1)}>Next</button></nav>
	</section>;
}
