import {
	closeManagedDialog,
	initializeDialogController,
	openManagedDialog,
} from '../overlays/dialog-controller.ts';

type KnowledgePage = { id: string; title: string; summary: string; bodyHtml?: string; canonicalPath?: string; href?: string };
type KnowledgeLink = { knowledgePageId: string; title: string; summary?: string };
type Config = {
	pageEndpoint: string;
	searchEndpoint: string;
	searchScope?: string;
	capabilityId?: string;
	teamId?: string;
	projectId?: string;
	locale?: string;
};

const initialized = new WeakSet<Document>();
const configByDialog = new WeakMap<HTMLDialogElement, Config>();
const searchRevisionByDialog = new WeakMap<HTMLDialogElement, number>();

function configFor(dialog: HTMLDialogElement) {
	const existing = configByDialog.get(dialog);
	if (existing) return existing;
	const script = dialog.querySelector<HTMLScriptElement>('[data-ts-help-client-config]');
	const parsed = JSON.parse(script?.textContent || '{}') as Config;
	configByDialog.set(dialog, parsed);
	return parsed;
}

function payload<T>(value: unknown): T | null {
	if (!value || typeof value !== 'object') return null;
	const record = value as Record<string, unknown>;
	return (record.payload ?? record) as T;
}

function setArticleState(dialog: HTMLDialogElement, title: string, message: string, retryPageId?: string) {
	const article = dialog.querySelector<HTMLElement>('[data-ts-help-article]');
	if (!article) return;
	article.replaceChildren();
	const state = document.createElement('div');
	state.className = 'ts-help-article__state';
	const heading = document.createElement('strong');
	heading.textContent = title;
	const body = document.createElement('p');
	body.textContent = message;
	state.append(heading, body);
	if (retryPageId) {
		const retry = document.createElement('button');
		retry.type = 'button';
		retry.className = 'ts-button';
		retry.dataset.tsHelpRetryKnowledgePage = retryPageId;
		retry.textContent = 'Retry';
		state.append(retry);
	}
	article.append(state);
}

function renderArticle(dialog: HTMLDialogElement, page: KnowledgePage) {
	const article = dialog.querySelector<HTMLElement>('[data-ts-help-article]');
	if (!article) return;
	article.replaceChildren();
	const content = document.createElement('div');
	content.className = 'ts-help-article__content';
	const header = document.createElement('header');
	header.className = 'ts-help-article__header';
	const title = document.createElement('h2');
	title.textContent = page.title;
	const summary = document.createElement('p');
	summary.textContent = page.summary;
	header.append(title, summary);
	const body = document.createElement('div');
	body.className = 'ts-help-article__body';
	body.innerHTML = page.bodyHtml ?? '';
	content.append(header, body);
	const fullPagePath = page.canonicalPath ?? page.href;
	if (fullPagePath) {
		const actions = document.createElement('footer');
		actions.className = 'ts-help-article__actions';
		const fullPage = document.createElement('a');
		fullPage.className = 'ts-button';
		fullPage.href = fullPagePath;
		fullPage.textContent = 'Open full page';
		actions.append(fullPage);
		content.append(actions);
	}
	article.append(content);
	dialog.dataset.tsHelpCurrentKnowledgePage = page.id;
	const feedback = dialog.querySelector<HTMLElement>('[data-ts-feedback-context-patch]');
	if (feedback) {
		try {
			const current = JSON.parse(feedback.dataset.tsFeedbackContextPatch ?? '{}') as Record<string, unknown>;
			feedback.dataset.tsFeedbackContextPatch = JSON.stringify({
				...current,
				knowledgePageId: page.id,
				knowledgePageTitle: page.title,
			});
		} catch {
			// The server emits this payload; a malformed value is ignored without blocking help.
		}
	}
	dialog.querySelectorAll<HTMLElement>('[data-ts-help-knowledge-page-id]').forEach((item) => {
		if (item.dataset.tsHelpKnowledgePageId === page.id) item.setAttribute('aria-current', 'page');
		else item.removeAttribute('aria-current');
	});
}

function renderNavigation(dialog: HTMLDialogElement, pages: KnowledgeLink[]) {
	const items = dialog.querySelector<HTMLElement>('[data-ts-help-navigation-items]');
	if (!items) return;
	items.replaceChildren();
	for (const page of pages) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'ts-help-navigation__item';
		button.dataset.tsHelpOpen = dialog.id;
		button.dataset.tsHelpKnowledgePageId = page.knowledgePageId;
		const title = document.createElement('strong');
		title.textContent = page.title;
		button.append(title);
		if (page.summary) {
			const summary = document.createElement('span');
			summary.textContent = page.summary;
			button.append(summary);
		}
		items.append(button);
	}
}

async function loadKnowledgePage(dialog: HTMLDialogElement, pageId: string) {
	if (!pageId || dialog.dataset.tsHelpCurrentKnowledgePage === pageId) return;
	setArticleState(dialog, 'Loading guidance', 'Retrieving the requested knowledge page.');
	const config = configFor(dialog);
	const endpoint = config.pageEndpoint.replace('{pageId}', encodeURIComponent(pageId));
	try {
		const response = await fetch(endpoint, { headers: { accept: 'application/json' } });
		const result = payload<{ page?: KnowledgePage; relatedPages?: Array<{ id: string; title: string; summary?: string }> }>(await response.json());
		if (!response.ok || !result?.page) throw new Error('Knowledge page unavailable.');
		renderArticle(dialog, result.page);
		if (result.relatedPages) {
			renderNavigation(dialog, result.relatedPages.map((page) => ({ knowledgePageId: page.id, title: page.title, summary: page.summary })));
		}
	} catch {
		setArticleState(dialog, 'Help is unavailable', 'This guidance could not be loaded.', pageId);
	}
}

function searchUrl(config: Config, query: string) {
	const url = new URL(config.searchEndpoint, window.location.origin);
	url.searchParams.set('q', query);
	if (config.searchScope) url.searchParams.set('scope', config.searchScope);
	if (config.capabilityId) url.searchParams.set('capabilityId', config.capabilityId);
	if (config.teamId) url.searchParams.set('teamId', config.teamId);
	if (config.projectId) url.searchParams.set('projectId', config.projectId);
	if (config.locale) url.searchParams.set('locale', config.locale);
	return url;
}

async function runSearch(dialog: HTMLDialogElement, input: HTMLInputElement) {
	const results = dialog.querySelector<HTMLElement>('[data-ts-help-search-results]');
	if (!results) return;
	const revision = (searchRevisionByDialog.get(dialog) ?? 0) + 1;
	searchRevisionByDialog.set(dialog, revision);
	results.replaceChildren();
	if (input.value.trim().length < 2) return;
	try {
		const response = await fetch(searchUrl(configFor(dialog), input.value), { headers: { accept: 'application/json' } });
		const result = payload<{ results?: Array<{ id: string; title: string; summary?: string }> }>(await response.json());
		if (searchRevisionByDialog.get(dialog) !== revision) return;
		for (const page of result?.results ?? []) {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'ts-help-search__result';
			button.dataset.tsHelpOpen = dialog.id;
			button.dataset.tsHelpKnowledgePageId = page.id;
			const title = document.createElement('strong');
			title.textContent = page.title;
			const summary = document.createElement('span');
			summary.textContent = page.summary ?? '';
			button.append(title, summary);
			results.append(button);
		}
		if (!results.children.length) results.textContent = 'No knowledge pages match this search.';
	} catch {
		if (searchRevisionByDialog.get(dialog) !== revision) return;
		results.textContent = 'Search is temporarily unavailable.';
	}
}

function dismissSearchResults(dialog: HTMLDialogElement) {
	searchRevisionByDialog.set(dialog, (searchRevisionByDialog.get(dialog) ?? 0) + 1);
	dialog.querySelector<HTMLElement>('[data-ts-help-search-results]')?.replaceChildren();
}

function openDialog(dialog: HTMLDialogElement, opener: HTMLElement, knowledgePageId?: string) {
	openManagedDialog(dialog, opener);
	if (knowledgePageId) void loadKnowledgePage(dialog, knowledgePageId);
}

function closeDialog(dialog: HTMLDialogElement) {
	dismissSearchResults(dialog);
	closeManagedDialog(dialog);
}

export function initializeHelpDialogs(root: Document = document) {
	if (initialized.has(root)) return;
	initialized.add(root);
	initializeDialogController(root);
	root.addEventListener('click', (event) => {
		const target = event.target instanceof Element ? event.target : null;
		if (!target?.closest('[data-ts-help-search-root]')) {
			root.querySelectorAll<HTMLDialogElement>('[data-ts-help-dialog][open]').forEach(dismissSearchResults);
		}
		const opener = target?.closest<HTMLElement>('[data-ts-help-open]');
		if (opener) {
			const dialog = root.getElementById(opener.dataset.tsHelpOpen ?? '');
			if (dialog instanceof HTMLDialogElement) {
				openDialog(dialog, opener, opener.dataset.tsHelpKnowledgePageId);
				if (opener.matches('.ts-help-search__result')) dismissSearchResults(dialog);
			}
			return;
		}
		const close = target?.closest<HTMLElement>('[data-ts-help-close]');
		const dialog = close?.closest<HTMLDialogElement>('[data-ts-help-dialog]');
		if (dialog) closeDialog(dialog);
		const retry = target?.closest<HTMLElement>('[data-ts-help-retry-knowledge-page]');
		const retryDialog = retry?.closest<HTMLDialogElement>('[data-ts-help-dialog]');
		if (retry && retryDialog) void loadKnowledgePage(retryDialog, retry.dataset.tsHelpRetryKnowledgePage ?? '');
	});
	root.addEventListener('input', (event) => {
		const input = event.target;
		if (!(input instanceof HTMLInputElement) || !input.matches('[data-ts-help-search-input]')) return;
		const dialog = input.closest<HTMLDialogElement>('[data-ts-help-dialog]');
		if (dialog) void runSearch(dialog, input);
	});
	root.addEventListener('cancel', (event) => {
		const dialog = event.target;
		if (dialog instanceof HTMLDialogElement && dialog.matches('[data-ts-help-dialog]')) {
			event.preventDefault();
			closeDialog(dialog);
		}
	}, true);
	root.addEventListener('click', (event) => {
		const dialog = event.target;
		if (dialog instanceof HTMLDialogElement && dialog.matches('[data-ts-help-dialog]')) closeDialog(dialog);
	});
}
