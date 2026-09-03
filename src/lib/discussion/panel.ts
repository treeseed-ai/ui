import { sendFormRequest } from '../../forms-client.ts';
import { dismissUtilityApplication, initializeUtilityDock, presentUtilityApplication, rememberUtilityApplicationOpener } from '../shell/utility-dock.ts';
import { setUtilityApplicationState } from '../shell/utility-state.ts';

type Item = { id?: string; path?: string; frontmatter?: Record<string, unknown>; body?: string };
type DiscussionEnvelope = { discussion?: { id?: string; topic?: string }; message?: { id?: string; authorLabel?: string; body?: string }; assignments?: Array<{ id?: string; agentSlug?: string; status?: string }> };
type ContentDiagnostic = { field?: string; message?: string; code?: string };
type DiscussionErrorEnvelope = { error?: string; code?: string; details?: unknown };

function diagnostics(value: unknown): ContentDiagnostic[] {
	return Array.isArray(value) ? value.filter((entry): entry is ContentDiagnostic => Boolean(entry) && typeof entry === 'object') : [];
}

export function discussionErrorMessage(envelope: DiscussionErrorEnvelope | null, status: number) {
	const message = envelope?.error ?? `Discussion request failed (${status}).`;
	const issues = diagnostics(envelope?.details);
	if (!issues.length) return message;
	return `${message}\n\n${issues.map((issue) => `- **${issue.field || 'content'}**: ${issue.message || issue.code || 'Invalid value.'}`).join('\n')}`;
}

function togglePanel(panel: HTMLElement, open: boolean) {
	if (open) {
		panel.setAttribute('popover', 'manual');
		const placement = presentUtilityApplication(panel, 'chat');
		panel.dataset.tsDiscussionPresentation = placement === 'dock-end' ? 'docked' : 'bottom';
		panel.querySelector<HTMLElement>('[data-markdown-editor-host]')?.focus();
	} else {
		dismissUtilityApplication(panel);
		delete panel.dataset.tsDiscussionPresentation;
	}
}

function discussionContainer(element: Element | null) {
	return element?.closest<HTMLElement>('[data-ts-discussion-container]') ?? element?.closest<HTMLElement>('[data-ts-side-sheet]') ?? null;
}

async function renderMarkdown(element: HTMLElement, body: string) {
	const response = await sendFormRequest({ url: '/api/markdown/preview', init: { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ markdown: body }) } }).catch(() => null);
	const payload = response ? await response.json().catch(() => null) : null;
	if (response?.ok && payload?.ok) element.innerHTML = payload.payload.html;
	else { const fallback = document.createElement('pre'); fallback.textContent = body; element.replaceChildren(fallback); }
}

function appendMessage(panel: HTMLElement, author: string, body: string, state?: string, fileRefs: unknown[] = []) {
	const timeline = panel.querySelector('[data-ts-discussion-timeline]');
	if (!timeline) return null;
	panel.querySelector('.ts-discussion__welcome')?.remove();
	const item = document.createElement('li');
	item.className = 'ts-discussion__message';
	const header = document.createElement('header');
	const name = document.createElement('strong');
	name.textContent = author;
	const badge = document.createElement('span');
	badge.textContent = state ?? 'committed';
	header.append(name, badge);
	const content = document.createElement('div'); content.className = 'ts-discussion__markdown ts-prose';
	void renderMarkdown(content, body);
	item.append(header, content);
	for (const reference of fileRefs) {
		const row = reference && typeof reference === 'object' ? reference as Record<string, unknown> : {};
		const file = document.createElement('span'); file.className = 'ts-discussion__file-card'; file.textContent = `${String(row.repository ?? 'repository')} · ${String(row.path ?? reference)}${row.ref ? ` @ ${String(row.ref)}` : ''}`; item.append(file);
	}
	timeline.append(item);
	item.scrollIntoView({ block: 'nearest' });
	return item;
}

function setMessageState(item: HTMLElement | null, state: string) {
	const badge = item?.querySelector<HTMLElement>('header span');
	if (badge) badge.textContent = state;
}

async function send(panel: HTMLElement, form: HTMLFormElement) {
	const root = panel.querySelector<HTMLElement>('[data-ts-discussion]');
	const input = form.elements.namedItem('body') as HTMLTextAreaElement;
	const intent = (form.elements.namedItem('intent') as RadioNodeList).value;
	const body = input.value.trim();
	if (!root || !body) return;
	const context = JSON.parse(panel.querySelector('[data-ts-discussion-context]')?.textContent ?? '{}');
	const fileRefs = JSON.parse(root.dataset.fileRefs ?? '[]');
	const contextRefs = JSON.parse(root.dataset.contextRefs ?? '[]');
	const pending = appendMessage(panel, context.identityLabel ?? 'You', body, 'pending', fileRefs);
	input.value = ''; input.closest('[data-markdown-field]')?.dispatchEvent(new CustomEvent('treeseed:markdown-set', { detail: '' }));
	const state = panel.querySelector('[data-ts-discussion-state]');
	if (state) state.textContent = 'Committing…';
	try {
		const response = await sendFormRequest({ url: root.dataset.endpoint ?? '/v1/discussions', init: { method: 'POST', credentials: 'same-origin', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ teamId: root.dataset.teamId, projectId: root.dataset.projectId || undefined, discussionId: root.dataset.discussionId || undefined, body, intent, fileRefs, contextRefs }) } });
		const envelope = await response.json() as DiscussionEnvelope & DiscussionErrorEnvelope;
		if (!response.ok) throw new Error(discussionErrorMessage(envelope, response.status));
		setMessageState(pending, 'committed');
		const topic = panel.querySelector('[data-ts-discussion-topic]');
		if (topic && envelope.discussion?.topic) topic.textContent = envelope.discussion.topic;
		if (envelope.discussion?.id) root.dataset.discussionId = envelope.discussion.id;
		root.dataset.fileRefs = '[]'; const fileLabel = panel.querySelector<HTMLElement>('[data-ts-discussion-file-ref]'); if (fileLabel) fileLabel.hidden = true;
		if (state) state.textContent = envelope.assignments?.length ? `${envelope.assignments.length} assigned` : 'Committed';
		const trace = panel.querySelector<HTMLElement>('[data-ts-discussion-trace]');
		if (trace && envelope.assignments?.length) {
			trace.hidden = false;
			const assignment = trace.querySelector('[data-trace-assignment]');
			if (assignment) assignment.textContent = envelope.assignments.map((entry) => `${entry.agentSlug}: ${entry.status ?? 'queued'}`).join(' · ');
		}
	} catch (error) {
		setMessageState(pending, 'failed');
		if (state) state.textContent = 'Not committed';
		appendMessage(panel, 'Platform', error instanceof Error ? error.message : 'Discussion request failed.', 'error');
	}
}

async function loadDiscussion(panel: HTMLElement, discussionId?: string, query = '') {
	const root = panel.querySelector<HTMLElement>('[data-ts-discussion]'); if (!root?.dataset.projectId) return;
	if (!navigator.onLine) { setUtilityApplicationState(panel, 'offline'); return; }
	const url = new URL(root.dataset.endpoint ?? '/v1/discussions', location.origin); url.searchParams.set('projectId', root.dataset.projectId); if (discussionId) url.searchParams.set('discussionId', discussionId); if (query) url.searchParams.set('query', query);
	setUtilityApplicationState(panel, panel.dataset.tsDiscussionLoaded === 'true' ? 'reconnecting' : 'loading');
	let response: Response;
	try { response = await fetch(url, { credentials: 'same-origin', headers: { accept: 'application/json' } }); }
	catch { setUtilityApplicationState(panel, navigator.onLine ? 'failed' : 'offline'); return; }
	const envelope = await response.json().catch(() => null);
	if (!response.ok || !envelope?.ok) {
		const state = response.status === 401 || response.status === 403 ? 'denied' : response.status === 409 ? 'stale' : 'failed';
		setUtilityApplicationState(panel, state, discussionErrorMessage(envelope, response.status));
		appendMessage(panel, 'Platform', discussionErrorMessage(envelope, response.status), 'error'); return;
	}
	panel.dataset.tsDiscussionLoaded = 'true';
	const payload = envelope.payload as { discussions: Item[]; messages: Item[]; events: Item[] };
	if (!discussionId) {
		const list = panel.querySelector('[data-ts-discussion-list]'); if (!list) return; list.replaceChildren();
		for (const entry of payload.discussions) { const data = entry.frontmatter ?? {}; const button = document.createElement('button'); button.type = 'button'; button.className = 'ts-discussion__thread'; button.textContent = String(data.topic ?? data.title ?? entry.id); button.addEventListener('click', () => void loadDiscussion(panel, entry.id)); list.append(button); }
		if (!payload.discussions.length) { const empty = document.createElement('p'); empty.className = 'ts-discussion__empty'; empty.textContent = 'Start a discussion with one or more team agents.'; list.append(empty); setUtilityApplicationState(panel, 'empty'); }
		else setUtilityApplicationState(panel, 'ready');
		return;
	}
	root.dataset.discussionId = discussionId; const timeline = panel.querySelector('[data-ts-discussion-timeline]'); timeline?.replaceChildren();
	for (const entry of payload.messages) { const data = entry.frontmatter ?? {}; appendMessage(panel, String(data.authorId ?? data.authorType ?? 'Participant'), entry.body ?? '', String(data.intent ?? 'committed'), Array.isArray(data.fileRefs) ? data.fileRefs : []); }
	const last = payload.events.at(-1)?.frontmatter ?? {}; const state = panel.querySelector('[data-ts-discussion-state]'); if (state && last.phase) state.textContent = String(last.phase).replace(/[._]/gu, ' ');
	const title = payload.discussions[0]?.frontmatter ?? {}; const topic = panel.querySelector('[data-ts-discussion-topic]'); if (topic) topic.textContent = String(title.topic ?? title.title ?? discussionId);
	setUtilityApplicationState(panel, payload.messages.length ? 'ready' : 'empty', payload.messages.length ? undefined : 'This discussion has no messages yet.');
}

export function initializeDiscussionPanels(root: Document = document) {
	if (root.documentElement.dataset.tsDiscussionBound === 'true') return;
	root.documentElement.dataset.tsDiscussionBound = 'true';
	initializeUtilityDock(root);
	root.addEventListener('treeseed:session-event', (event) => {
		const detail = event instanceof CustomEvent ? event.detail as Record<string, unknown> : {};
		if (detail.eventType !== 'discussion.updated' && detail.eventType !== 'session.ready') return;
		for (const panel of root.querySelectorAll<HTMLElement>('[data-ts-discussion-container]')) {
			const shell = panel.querySelector<HTMLElement>('[data-ts-discussion]');
			if (!shell || shell.dataset.teamId !== detail.teamId) continue;
			if (detail.eventType === 'session.ready') { if (!panel.hidden) void loadDiscussion(panel, shell.dataset.discussionId); continue; }
			if (detail.projectId && shell.dataset.projectId && shell.dataset.projectId !== detail.projectId) continue;
			const discussionId = String((detail.payload as Record<string, unknown> | undefined)?.discussionId ?? detail.resourceId ?? '');
			if (!discussionId || (shell.dataset.discussionId && shell.dataset.discussionId !== discussionId)) void loadDiscussion(panel);
			else void loadDiscussion(panel, discussionId);
		}
	});
	window.addEventListener('offline', () => root.querySelectorAll<HTMLElement>('[data-ts-discussion-container]').forEach((panel) => setUtilityApplicationState(panel, 'offline')));
	window.addEventListener('online', () => root.querySelectorAll<HTMLElement>('[data-ts-discussion-container]').forEach((panel) => { setUtilityApplicationState(panel, 'reconnecting'); void loadDiscussion(panel, panel.querySelector<HTMLElement>('[data-ts-discussion]')?.dataset.discussionId); }));
	root.addEventListener('click', (event) => {
		const target = event.target instanceof Element ? event.target : null;
		const opener = target?.closest<HTMLElement>('[data-ts-discussion-open]');
		if (opener) { const panel = root.getElementById(opener.dataset.tsDiscussionOpen ?? ''); if (panel) { rememberUtilityApplicationOpener(panel, opener); togglePanel(panel, true); void loadDiscussion(panel); } }
		const closer = target?.closest('[data-ts-discussion-close]');
		if (closer) { const panel = closer.closest<HTMLElement>('[data-ts-side-sheet]'); if (panel) togglePanel(panel, false); }
	});
	root.querySelectorAll<HTMLElement>('[data-ts-discussion-new]').forEach((button) => button.addEventListener('click', () => { const panel = discussionContainer(button); const shell = panel?.querySelector<HTMLElement>('[data-ts-discussion]'); if (shell) delete shell.dataset.discussionId; panel?.querySelector('[data-ts-discussion-timeline]')?.replaceChildren(); const topic = panel?.querySelector('[data-ts-discussion-topic]'); if (topic) topic.textContent = 'New discussion'; }));
	root.querySelectorAll<HTMLInputElement>('[data-ts-discussion-search]').forEach((search) => search.addEventListener('input', () => { const panel = discussionContainer(search); if (panel) void loadDiscussion(panel, undefined, search.value.trim()); }));
	root.querySelectorAll<HTMLElement>('[data-ts-discussion-file]').forEach((button) => button.addEventListener('click', () => { const panel = discussionContainer(button); const shell = panel?.querySelector<HTMLElement>('[data-ts-discussion]'); if (!shell) return; const path = window.prompt('Repository-relative file path to reference'); if (!path?.trim()) return; const context = JSON.parse(panel?.querySelector('[data-ts-discussion-context]')?.textContent ?? '{}'); const refs = [{ repository: context.projectSlug ?? shell.dataset.projectId ?? 'project', path: path.trim(), ref: context.trackedBranch ?? 'tracked' }]; shell.dataset.fileRefs = JSON.stringify(refs); const label = panel?.querySelector<HTMLElement>('[data-ts-discussion-file-ref]'); if (label) { label.hidden = false; label.textContent = path.trim(); } }));
	root.querySelectorAll<HTMLFormElement>('[data-ts-discussion-composer]').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); const panel = discussionContainer(form); if (panel) void send(panel, form); }));
	root.querySelectorAll<HTMLElement>('[data-ts-discussion-resize]').forEach((handle) => handle.addEventListener('pointerdown', (event) => {
		const composer = handle.closest<HTMLElement>('.ts-discussion__composer'); if (!composer) return;
		const startY = event.clientY; const start = composer.getBoundingClientRect().height;
		const move = (next: PointerEvent) => { composer.style.setProperty('--composer-height', `${Math.max(150, Math.min(520, start + startY - next.clientY))}px`); };
		const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); };
		window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop);
	}));
	root.querySelectorAll<HTMLElement>('[data-ts-discussion-workspace]').forEach((panel) => void loadDiscussion(panel));
	const activePanel = () => discussionContainer(root.querySelector<HTMLElement>('[data-ts-discussion]'));
	const renderContext = (panel: HTMLElement, references: unknown[]) => {
		const shell = panel.querySelector<HTMLElement>('[data-ts-discussion]'); const host = panel.querySelector<HTMLElement>('[data-ts-discussion-context-refs]'); if (!shell || !host) return;
		shell.dataset.contextRefs = JSON.stringify(references); host.replaceChildren(); host.hidden = references.length === 0;
		for (const [index, value] of references.entries()) { const entry = value && typeof value === 'object' ? value as Record<string,unknown> : {}; const chip=document.createElement('span');chip.textContent=`${String(entry.kind??'context')}: ${String(entry.id??'unknown')}`;const remove=document.createElement('button');remove.type='button';remove.ariaLabel=`Remove ${chip.textContent}`;remove.textContent='×';remove.addEventListener('click',()=>{const next=references.filter((_,candidate)=>candidate!==index);renderContext(panel,next)});chip.append(remove);host.append(chip); }
	};
	root.addEventListener('treeseed:discussion-context-change',event=>{const panel=activePanel();if(!panel)return;const detail=(event as CustomEvent).detail??{};const shell=panel.querySelector<HTMLElement>('[data-ts-discussion]');if(shell&&detail.references?.[0]?.projectId)shell.dataset.projectId=detail.references[0].projectId;renderContext(panel,Array.isArray(detail.references)?detail.references:[]);const topic=panel.querySelector<HTMLElement>('[data-ts-discussion-topic]');if(topic&&detail.identityLabel)topic.textContent=`Discuss ${detail.identityLabel}`;});
	root.addEventListener('treeseed:discussion-open',()=>{const panel=activePanel();if(panel){togglePanel(panel,true);void loadDiscussion(panel)}});
}
