import { useEffect } from 'react';

export interface BookLibraryIslandProps { rootId: string; searchEndpoint: string; }

export function BookLibraryIsland({ rootId, searchEndpoint }: BookLibraryIslandProps) {
	useEffect(() => {
		const library = document.getElementById(rootId);
		if (!library) return;
		const query = library.querySelector<HTMLInputElement>('[data-ts-book-query]');
		const filters = [...library.querySelectorAll<HTMLSelectElement>('select[data-ts-book-topic], select[data-ts-book-audience], select[data-ts-book-team]')];
		const cards = [...library.querySelectorAll<HTMLElement>('[data-ts-book-card]')];
		const count = library.querySelector<HTMLElement>('[data-ts-book-count]');
		const empty = library.querySelector<HTMLElement>('[data-ts-book-empty]');
		let remoteIds: Set<string> | null = null;
		let timer = 0;
		let controller: AbortController | undefined;
		const update = () => {
			const words = (query?.value ?? '').trim().toLowerCase().split(/\s+/u).filter(Boolean);
			const selections = filters.map((filter) => filter.value.toLowerCase());
			let visible = 0;
			for (const card of cards) {
				const facets = [(card.dataset.topics ?? '').split('|'), (card.dataset.audiences ?? '').split('|'), [card.dataset.team ?? '']];
				const localMatch = words.every((word) => (card.dataset.search ?? '').includes(word));
				const match = (remoteIds ? remoteIds.has(card.dataset.bookId ?? '') : localMatch)
					&& selections.every((selection, index) => !selection || facets[index]?.includes(selection));
				card.hidden = !match;
				if (match) visible += 1;
			}
			if (count) count.textContent = `${visible} ${visible === 1 ? 'book' : 'books'}`;
			if (empty) empty.hidden = visible > 0;
		};
		const search = () => {
			window.clearTimeout(timer);
			controller?.abort();
			const value = query?.value.trim() ?? '';
			if (value.length < 2) { remoteIds = null; update(); return; }
			remoteIds = new Set();
			update();
			timer = window.setTimeout(async () => {
				const requestController = new AbortController();
				controller = requestController;
				try {
					const endpoint = new URL(searchEndpoint, window.location.origin);
					endpoint.searchParams.set('q', value);
					const response = await fetch(endpoint, { credentials: 'same-origin', headers: { accept: 'application/json' }, signal: requestController.signal });
					if (!response.ok) throw new Error('Search unavailable');
					const body = await response.json();
					remoteIds = new Set((body.payload?.books ?? []).map((book: { id: string }) => book.id));
					update();
				} catch {
					if (requestController.signal.aborted) return;
					remoteIds = new Set(); update();
					if (count) count.textContent = 'Search is temporarily unavailable';
				}
			}, 250);
		};
		query?.addEventListener('input', search);
		filters.forEach((filter) => filter.addEventListener('change', update));
		return () => {
			query?.removeEventListener('input', search);
			filters.forEach((filter) => filter.removeEventListener('change', update));
			window.clearTimeout(timer);
			controller?.abort();
		};
	}, [rootId, searchEndpoint]);
	return null;
}
