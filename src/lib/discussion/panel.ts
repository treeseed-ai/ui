import { sendFormRequest } from '../../forms-client.ts';

type Item = { id?: string; path?: string; frontmatter?: Record<string, unknown>; body?: string };
type DiscussionEnvelope = { discussion?: { id?: string; topic?: string }; message?: { id?: string; authorLabel?: string; body?: string }; assignments?: Array<{ id?: string; agentSlug?: string; status?: string }> };

function togglePanel(panel: HTMLElement, open: boolean) {
	panel.hidden = !open;
	if (open) {
		panel.setAttribute('popover', 'manual');
		panel.dataset.tsDiscussionPresentation = matchMedia('(min-width: 64rem)').matches ? 'docked' : 'overlay';
		panel.querySelector<HTMLElement>('[data-markdown-editor-host]')?.focus();
	} else delete panel.dataset.tsDiscussionPresentation;
}

async function renderMarkdown(element: HTMLElement, body: string) {
	const response = await sendFormRequest({ url: '/api/markdown/preview', init: { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ markdown: body }) } }).catch(() => null);
	const payload = response ? await response.json().catch(() => null) : null;
	if (response?.ok && payload?.ok) element.innerHTML = payload.payload.html;
	else { const fallback = document.createElement('pre'); fallback.textContent = body; element.replaceChildren(fallback); }
}

function appendMessage(panel: HTMLElement, author: string, body: string, state?: string, fileRefs: unknown[] = []) {
	const timeline = panel.querySelector('[data-ts-discussion-timeline]');
	if (!timeline) return;
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
	appendMessage(panel, context.identityLabel ?? 'You', body, 'committed', fileRefs);
	input.value = ''; input.closest('[data-markdown-field]')?.dispatchEvent(new CustomEvent('treeseed:markdown-set', { detail: '' }));
	const state = panel.querySelector('[data-ts-discussion-state]');
	if (state) state.textContent = 'Committing…';
	try {
		const response = await sendFormRequest({ url: root.dataset.endpoint ?? '/v1/discussions', init: { method: 'POST', credentials: 'same-origin', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ teamId: root.dataset.teamId, projectId: root.dataset.projectId || undefined, discussionId: root.dataset.discussionId || undefined, body, intent, fileRefs, contextRefs }) } });
		const envelope = await response.json() as DiscussionEnvelope & { error?: string };
		if (!response.ok) throw new Error(envelope.error ?? `Discussion request failed (${response.status}).`);
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
		if (state) state.textContent = 'Not committed';
		appendMessage(panel, 'Platform', error instanceof Error ? error.message : 'Discussion request failed.', 'error');
	}
}

async function loadDiscussion(panel: HTMLElement, discussionId?: string, query = '') {
	const root = panel.querySelector<HTMLElement>('[data-ts-discussion]'); if (!root?.dataset.projectId) return;
	const url = new URL(root.dataset.endpoint ?? '/v1/discussions', location.origin); url.searchParams.set('projectId', root.dataset.projectId); if (discussionId) url.searchParams.set('discussionId', discussionId); if (query) url.searchParams.set('query', query);
	const response = await fetch(url, { credentials: 'same-origin', headers: { accept: 'application/json' } }); const envelope = await response.json().catch(() => null); if (!response.ok || !envelope?.ok) return;
	const payload = envelope.payload as { discussions: Item[]; messages: Item[]; events: Item[] };
	if (!discussionId) {
		const list = panel.querySelector('[data-ts-discussion-list]'); if (!list) return; list.replaceChildren();
		for (const entry of payload.discussions) { const data = entry.frontmatter ?? {}; const button = document.createElement('button'); button.type = 'button'; button.className = 'ts-discussion__thread'; button.textContent = String(data.topic ?? data.title ?? entry.id); button.addEventListener('click', () => void loadDiscussion(panel, entry.id)); list.append(button); }
		if (!payload.discussions.length) { const empty = document.createElement('p'); empty.className = 'ts-discussion__empty'; empty.textContent = 'Start a discussion with one or more Market agents.'; list.append(empty); }
		return;
	}
	root.dataset.discussionId = discussionId; const timeline = panel.querySelector('[data-ts-discussion-timeline]'); timeline?.replaceChildren();
	for (const entry of payload.messages) { const data = entry.frontmatter ?? {}; appendMessage(panel, String(data.authorId ?? data.authorType ?? 'Participant'), entry.body ?? '', String(data.intent ?? 'committed'), Array.isArray(data.fileRefs) ? data.fileRefs : []); }
	const last = payload.events.at(-1)?.frontmatter ?? {}; const state = panel.querySelector('[data-ts-discussion-state]'); if (state && last.phase) state.textContent = String(last.phase).replace(/[._]/gu, ' ');
	const title = payload.discussions[0]?.frontmatter ?? {}; const topic = panel.querySelector('[data-ts-discussion-topic]'); if (topic) topic.textContent = String(title.topic ?? title.title ?? discussionId);
}

export function initializeDiscussionPanels(root: Document = document) {
	if (root.documentElement.dataset.tsDiscussionBound === 'true') return;
	root.documentElement.dataset.tsDiscussionBound = 'true';
	root.addEventListener('treeseed:session-event', (event) => {
		const detail = event instanceof CustomEvent ? event.detail as Record<string, unknown> : {};
		if (detail.eventType !== 'discussion.updated' && detail.eventType !== 'session.ready') return;
		for (const panel of root.querySelectorAll<HTMLElement>('[data-ts-side-sheet]:has([data-ts-discussion])')) {
			const shell = panel.querySelector<HTMLElement>('[data-ts-discussion]');
			if (!shell || shell.dataset.teamId !== detail.teamId) continue;
			if (detail.eventType === 'session.ready') { if (!panel.hidden) void loadDiscussion(panel, shell.dataset.discussionId); continue; }
			if (detail.projectId && shell.dataset.projectId && shell.dataset.projectId !== detail.projectId) continue;
			const discussionId = String((detail.payload as Record<string, unknown> | undefined)?.discussionId ?? detail.resourceId ?? '');
			if (!discussionId || (shell.dataset.discussionId && shell.dataset.discussionId !== discussionId)) void loadDiscussion(panel);
			else void loadDiscussion(panel, discussionId);
		}
	});
	root.addEventListener('click', (event) => {
		const target = event.target instanceof Element ? event.target : null;
		const opener = target?.closest<HTMLElement>('[data-ts-discussion-open]');
		if (opener) { const panel = root.getElementById(opener.dataset.tsDiscussionOpen ?? ''); if (panel) { togglePanel(panel, true); void loadDiscussion(panel); } }
		const closer = target?.closest('[data-ts-discussion-close]');
		if (closer) { const panel = closer.closest<HTMLElement>('[data-ts-side-sheet]'); if (panel) togglePanel(panel, false); }
	});
	root.querySelectorAll<HTMLElement>('[data-ts-discussion-new]').forEach((button) => button.addEventListener('click', () => { const panel = button.closest<HTMLElement>('[data-ts-side-sheet]'); const shell = panel?.querySelector<HTMLElement>('[data-ts-discussion]'); if (shell) delete shell.dataset.discussionId; panel?.querySelector('[data-ts-discussion-timeline]')?.replaceChildren(); const topic = panel?.querySelector('[data-ts-discussion-topic]'); if (topic) topic.textContent = 'New discussion'; }));
	root.querySelectorAll<HTMLInputElement>('[data-ts-discussion-search]').forEach((search) => search.addEventListener('input', () => { const panel = search.closest<HTMLElement>('[data-ts-side-sheet]'); if (panel) void loadDiscussion(panel, undefined, search.value.trim()); }));
	root.querySelectorAll<HTMLElement>('[data-ts-discussion-file]').forEach((button) => button.addEventListener('click', () => { const panel = button.closest<HTMLElement>('[data-ts-side-sheet]'); const shell = panel?.querySelector<HTMLElement>('[data-ts-discussion]'); if (!shell) return; const path = window.prompt('Repository-relative file path to reference'); if (!path?.trim()) return; const context = JSON.parse(panel?.querySelector('[data-ts-discussion-context]')?.textContent ?? '{}'); const refs = [{ repository: context.projectSlug ?? shell.dataset.projectId ?? 'project', path: path.trim(), ref: context.trackedBranch ?? 'tracked' }]; shell.dataset.fileRefs = JSON.stringify(refs); const label = panel?.querySelector<HTMLElement>('[data-ts-discussion-file-ref]'); if (label) { label.hidden = false; label.textContent = path.trim(); } }));
	root.querySelectorAll<HTMLFormElement>('[data-ts-discussion-composer]').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); const panel = form.closest<HTMLElement>('[data-ts-side-sheet]'); if (panel) void send(panel, form); }));
	root.querySelectorAll<HTMLElement>('[data-ts-discussion-resize]').forEach((handle) => handle.addEventListener('pointerdown', (event) => {
		const composer = handle.closest<HTMLElement>('.ts-discussion__composer'); if (!composer) return;
		const startY = event.clientY; const start = composer.getBoundingClientRect().height;
		const move = (next: PointerEvent) => { composer.style.setProperty('--composer-height', `${Math.max(150, Math.min(520, start + startY - next.clientY))}px`); };
		const stop = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); };
		window.addEventListener('pointermove', move); window.addEventListener('pointerup', stop);
	}));
	const activePanel = () => root.querySelector<HTMLElement>('[data-ts-discussion]')?.closest<HTMLElement>('[data-ts-side-sheet]') ?? null;
	const renderContext = (panel: HTMLElement, references: unknown[]) => {
		const shell = panel.querySelector<HTMLElement>('[data-ts-discussion]'); const host = panel.querySelector<HTMLElement>('[data-ts-discussion-context-refs]'); if (!shell || !host) return;
		shell.dataset.contextRefs = JSON.stringify(references); host.replaceChildren(); host.hidden = references.length === 0;
		for (const [index, value] of references.entries()) { const entry = value && typeof value === 'object' ? value as Record<string,unknown> : {}; const chip=document.createElement('span');chip.textContent=`${String(entry.kind??'context')}: ${String(entry.id??'unknown')}`;const remove=document.createElement('button');remove.type='button';remove.ariaLabel=`Remove ${chip.textContent}`;remove.textContent='×';remove.addEventListener('click',()=>{const next=references.filter((_,candidate)=>candidate!==index);renderContext(panel,next)});chip.append(remove);host.append(chip); }
	};
	root.addEventListener('treeseed:discussion-context-change',event=>{const panel=activePanel();if(!panel)return;const detail=(event as CustomEvent).detail??{};const shell=panel.querySelector<HTMLElement>('[data-ts-discussion]');if(shell&&detail.references?.[0]?.projectId)shell.dataset.projectId=detail.references[0].projectId;renderContext(panel,Array.isArray(detail.references)?detail.references:[]);const topic=panel.querySelector<HTMLElement>('[data-ts-discussion-topic]');if(topic&&detail.identityLabel)topic.textContent=`Discuss ${detail.identityLabel}`;});
	root.addEventListener('treeseed:discussion-open',()=>{const panel=activePanel();if(panel){togglePanel(panel,true);void loadDiscussion(panel)}});
}
