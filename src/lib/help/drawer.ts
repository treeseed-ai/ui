const initialized = new WeakSet<Document>();
const openerByDrawer = new WeakMap<HTMLElement, HTMLElement>();

function closeDrawer(drawer: HTMLElement) {
	drawer.hidden = true;
	document.body.style.removeProperty('overflow');
	openerByDrawer.get(drawer)?.focus();
}

function openDrawer(drawer: HTMLElement, opener: HTMLElement) {
	openerByDrawer.set(drawer, opener);
	drawer.hidden = false;
	document.body.style.overflow = 'hidden';
	const panel = drawer.querySelector<HTMLElement>('[role="dialog"]');
	panel?.focus();
}

async function runSearch(root: HTMLElement) {
	const input = root.querySelector<HTMLInputElement>('[data-ts-help-search-input]');
	const results = root.querySelector<HTMLElement>('[data-ts-help-search-results]');
	const dataScript = root.querySelector<HTMLScriptElement>('[data-ts-help-search-data]');
	if (!input || !results || !dataScript?.textContent) return;
	const data = JSON.parse(dataScript.textContent) as unknown;
	const { searchContextualHelp } = await import('./search.ts');
	const matches = searchContextualHelp(data as Parameters<typeof searchContextualHelp>[0], input.value);
	results.replaceChildren();
	if (matches.length === 0) {
		const empty = document.createElement('p');
		empty.className = 'ts-help-search__empty';
		empty.textContent = 'No help topics match this context.';
		results.append(empty);
		return;
	}
	for (const match of matches) {
		const item = document.createElement(match.href ? 'a' : 'span');
		item.className = 'ts-help-search__result';
		item.setAttribute('role', 'listitem');
		if (match.href) item.setAttribute('href', match.href);
		const title = document.createElement('strong');
		title.textContent = match.title;
		const summary = document.createElement('span');
		summary.textContent = match.summary || match.source;
		item.append(title, summary);
		results.append(item);
	}
}

export function initializeHelpDrawers(root: Document = document) {
	if (initialized.has(root)) return;
	initialized.add(root);

	root.addEventListener('click', (event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const opener = target.closest<HTMLElement>('[data-ts-help-open]');
		if (opener) {
			const id = opener.dataset.tsHelpOpen;
			const drawer = id ? root.querySelector<HTMLElement>(`[data-ts-help-drawer="${CSS.escape(id)}"]`) : null;
			if (drawer) openDrawer(drawer, opener);
			return;
		}
		if (target.closest('[data-ts-help-close]')) {
			const drawer = target.closest<HTMLElement>('[data-ts-help-drawer]');
			if (drawer) closeDrawer(drawer);
		}
	});

	root.addEventListener('focusin', (event) => {
		const input = event.target;
		if (!(input instanceof HTMLInputElement) || !input.matches('[data-ts-help-search-input]')) return;
		const searchRoot = input.closest<HTMLElement>('[data-ts-help-search-root]');
		if (searchRoot) void runSearch(searchRoot);
	});

	root.addEventListener('input', (event) => {
		const input = event.target;
		if (!(input instanceof HTMLInputElement) || !input.matches('[data-ts-help-search-input]')) return;
		const searchRoot = input.closest<HTMLElement>('[data-ts-help-search-root]');
		if (searchRoot) void runSearch(searchRoot);
	});

	root.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape') return;
		const drawer = root.querySelector<HTMLElement>('[data-ts-help-drawer]:not([hidden])');
		if (drawer) closeDrawer(drawer);
	});
}
