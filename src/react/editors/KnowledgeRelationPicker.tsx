import React, { useEffect, useId, useRef, useState } from 'react';

export interface KnowledgeRelationSummary {
	id: string;
	title: string;
	summary?: string;
	bookId?: string;
	kind?: string;
}

export interface KnowledgeRelationPickerProps {
	name?: string;
	label?: string;
	description?: string;
	initialIds?: string[];
	searchEndpoint?: string;
}

function normalizedIds(values: string[]) {
	return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export default function KnowledgeRelationPicker({
	name = 'relatedKnowledgeIds',
	label = 'Related knowledge',
	description = 'Search authorized knowledge pages. Backlinks are created automatically.',
	initialIds = [],
	searchEndpoint = '/v1/knowledge/search',
}: KnowledgeRelationPickerProps) {
	const id = useId();
	const [selected, setSelected] = useState<KnowledgeRelationSummary[]>(
		normalizedIds(initialIds).map((value) => ({ id: value, title: value })),
	);
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<KnowledgeRelationSummary[]>([]);
	const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
	const request = useRef<AbortController | null>(null);

	useEffect(() => {
		const value = query.trim();
		if (value.length < 2) {
			request.current?.abort();
			setResults([]);
			setStatus('idle');
			return;
		}
		const timeout = window.setTimeout(async () => {
			request.current?.abort();
			const controller = new AbortController();
			request.current = controller;
			setStatus('loading');
			try {
				const url = new URL(searchEndpoint, window.location.origin);
				url.searchParams.set('q', value);
				const response = await fetch(url, {
					headers: { accept: 'application/json' }, signal: controller.signal,
				});
				if (!response.ok) throw new Error('Search failed.');
				const body = await response.json();
				setResults((body?.payload?.results ?? []).filter((item: unknown): item is KnowledgeRelationSummary =>
					Boolean(item && typeof item === 'object' && typeof (item as KnowledgeRelationSummary).id === 'string')));
				setStatus('idle');
			} catch (error) {
				if ((error as Error).name !== 'AbortError') setStatus('error');
			}
		}, 250);
		return () => window.clearTimeout(timeout);
	}, [query, searchEndpoint]);

	const add = (item: KnowledgeRelationSummary) => {
		setSelected((current) => current.some((entry) => entry.id === item.id) ? current : [...current, item]);
		setQuery('');
		setResults([]);
	};

	return (
		<div className="ts-field ts-knowledge-relations" data-knowledge-relation-field={name}>
			<label className="ts-field__label" htmlFor={`${id}-search`}>{label}</label>
			<p className="ts-field__description" id={`${id}-description`}>{description}</p>
			{selected.map((item) => <input key={item.id} type="hidden" name={name} value={item.id} />)}
			<div className="ts-knowledge-relations__selected" aria-label={`Selected ${label.toLowerCase()}`}>
				{selected.length ? selected.map((item) => (
					<span className="ts-knowledge-relations__chip" key={item.id}>
						<span>{item.title}</span>
						<button type="button" aria-label={`Remove ${item.title}`} onClick={() => setSelected((current) => current.filter((entry) => entry.id !== item.id))}>×</button>
					</span>
				)) : <span className="ts-knowledge-relations__empty">No related pages selected.</span>}
			</div>
			<div className="ts-knowledge-relations__search">
				<input id={`${id}-search`} className="ts-input" type="search" value={query} aria-describedby={`${id}-description ${id}-status`}
					placeholder="Search page titles and knowledge" autoComplete="off" onChange={(event) => setQuery(event.currentTarget.value)} />
				<div id={`${id}-status`} className="ts-knowledge-relations__status" aria-live="polite">
					{status === 'loading' ? 'Searching…' : status === 'error' ? 'Knowledge search is unavailable.' : ''}
				</div>
				{results.length ? <ul className="ts-knowledge-relations__results" data-knowledge-relation-results={name}>
					{results.filter((item) => !selected.some((entry) => entry.id === item.id)).map((item) => <li key={item.id}>
						<button type="button" onClick={() => add(item)}>
							<strong>{item.title}</strong><span>{[item.kind, item.summary ?? item.id].filter(Boolean).join(' · ')}</span>
						</button>
					</li>)}
				</ul> : null}
			</div>
		</div>
	);
}
