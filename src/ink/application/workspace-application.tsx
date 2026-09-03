import { ROOT_WORKSPACES, activeSurface, coreUiRegistry, createWorkspaceState, workspaceReducer, type SurfaceKind, type WorkspaceId } from '../../lib/foundation/contracts.ts';
import { Box, Text, useApp, useInput } from 'ink';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { MarkdownEditor, MarkdownViewer, Panel, SelectableList, type SelectItem, useTerminalSize } from '../workbench.tsx';
import { SemanticSurface } from './semantic-surface.tsx';
import type { InkSurfaceItem, InkWorkspaceDataSource } from './types.ts';

type Focus = 'navigation' | 'content' | 'composer';
const rootLabels: Record<WorkspaceId, string> = { team: 'Follow', chat: 'Chat', inbox: 'Inbox', discover: 'Explore' };
const overlayViews: SurfaceKind[] = ['user', 'services', 'capacity', 'projects', 'knowledge', 'model', 'template', 'agent-builder', 'allocator', 'content', 'releases'];

export function workspaceShortcut(input: string, control: boolean, editing: boolean): WorkspaceId | undefined {
	if (!/^[1-4]$/u.test(input) || editing && !control) return undefined;
	return ROOT_WORKSPACES[Number(input) - 1];
}

function description(item?: InkSurfaceItem) {
	if (!item) return 'Select an item to inspect it. Use Ctrl+P to open any capability.';
	return [`# ${item.title}`, item.status ? `Status: ${item.status}` : '', '', item.description || 'No description is available.', '', ...Object.entries(item.raw).slice(0, 10).map(([key, value]) => `**${key}**: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`)].filter(Boolean).join('\n');
}

export function WorkspaceApplication({ dataSource, teamId, initialWorkspace = 'team', initialSurface, onDone }: { dataSource: InkWorkspaceDataSource; teamId: string; initialWorkspace?: WorkspaceId; initialSurface?: SurfaceKind; onDone: () => void }) {
	const { exit } = useApp(), size = useTerminalSize(), [state, dispatch] = useReducer(workspaceReducer, createWorkspaceState({ teamId }));
	const [focus, setFocus] = useState<Focus>('navigation'), [items, setItems] = useState<InkSurfaceItem[]>([]), [selected, setSelected] = useState<string>(), [status, setStatus] = useState('Ready');
	const [composer, setComposer] = useState(''), [query, setQuery] = useState(''), [loading, setLoading] = useState(false), [discardPending, setDiscardPending] = useState(false), [surfaceInteraction, setSurfaceInteraction] = useState(false);
	const active = activeSurface(state), root = state.activeWorkspace, overlay = active.route.kind !== root, selectedItem = items.find((entry) => entry.id === selected) ?? items[0];
	const wide = size.width >= 112, narrow = size.width < 72, bodyHeight = Math.max(10, size.height - 6), navigationWidth = narrow ? size.width : wide ? Math.max(24, Math.floor(size.width * .23)) : 26;
	const paletteItems = useMemo<SelectItem[]>(() => coreUiRegistry.commands.map((entry) => ({ id: entry.target, label: entry.label })), []);
	useEffect(() => { dispatch({ type: 'switch', workspace: initialWorkspace }); if (initialSurface && initialSurface !== initialWorkspace) dispatch({ type: 'open', route: { kind: initialSurface, viewId: initialSurface } }); }, [initialSurface, initialWorkspace]);
	useEffect(() => {
		let current = true; setLoading(true); setStatus('Loading…');
		void dataSource.loadWorkspace(root, root === 'discover' ? query : '').then((next) => { if (!current) return; setItems(next); setSelected((value) => next.some((entry) => entry.id === value) ? value : next[0]?.id); setStatus(next.length ? `${next.length} items` : root === 'discover' && !query ? 'Enter a search query.' : 'No items found.'); }).catch((error) => { if (current) { setItems([]); setStatus(error instanceof Error ? error.message : String(error)); } }).finally(() => { if (current) setLoading(false); });
		return () => { current = false; };
	}, [dataSource, query, root]);
	const finish = () => { onDone(); exit(); };
	const close = () => { if (!overlay) return; if (active.dirty && !discardPending) { setDiscardPending(true); setStatus('Unsaved changes. Press Ctrl+D to discard or continue editing.'); return; } dispatch({ type: 'close', discardDirty: discardPending }); setDiscardPending(false); setStatus('Closed surface.'); };
	const submit = async () => {
		if (!composer.trim()) return;
		if (root === 'discover') { setQuery(composer.trim()); setComposer(''); return; }
		if (root !== 'chat') { setStatus('The focused surface does not accept a message.'); return; }
		if (!selectedItem?.id) { setStatus('Select a topic before sending.'); return; }
		setStatus('Sending…'); try { await dataSource.sendMessage(selectedItem.id, composer.trim()); setComposer(''); setStatus('Message sent.'); } catch (error) { setStatus(error instanceof Error ? error.message : String(error)); }
	};
	useInput((input, key) => {
		if (key.ctrl && input === 'c') { finish(); return; }
		if (surfaceInteraction) return;
		if (key.ctrl && input === 'p') { dispatch({ type: 'palette', open: !state.commandPaletteOpen }); setFocus('navigation'); return; }
		if (key.ctrl && input === 'k') { dispatch({ type: 'switch', workspace: 'chat' }); setFocus('composer'); return; }
		if (key.ctrl && input === 'd' && discardPending) { dispatch({ type: 'close', discardDirty: true }); setDiscardPending(false); return; }
		if (key.escape) { if (state.commandPaletteOpen) dispatch({ type: 'palette', open: false }); else close(); return; }
		if (key.tab) { const order: Focus[] = ['navigation', 'content', 'composer']; setFocus(order[(order.indexOf(focus) + (key.shift ? order.length - 1 : 1)) % order.length]!); return; }
		const shortcut = workspaceShortcut(input, key.ctrl, focus === 'composer'); if (shortcut) { dispatch({ type: 'switch', workspace: shortcut }); setFocus('navigation'); return; }
		if (input === 'q' && focus !== 'composer' && !overlay && !state.commandPaletteOpen) finish();
	});
	const choosePalette = (id: string) => { dispatch({ type: 'palette', open: false }); if (ROOT_WORKSPACES.includes(id as WorkspaceId)) dispatch({ type: 'switch', workspace: id as WorkspaceId }); else dispatch({ type: 'open', route: { kind: id as SurfaceKind, viewId: id } }); setFocus('content'); };
	if (state.commandPaletteOpen) return <Panel title="Command palette" width={size.width} height={size.height} paddingX={2}><Text dimColor>All capabilities come from the shared registry. Esc closes.</Text><SelectableList id="palette" items={paletteItems} height={Math.max(4, size.height - 5)} active onSelect={choosePalette}/></Panel>;
	if (overlay) return <Box flexDirection="column" width={size.width} height={size.height}><Box><Text bold color="cyan">{rootLabels[root]}</Text><Text dimColor> / {coreUiRegistry.view(active.route.kind).label}</Text></Box><SemanticSurface kind={active.route.kind} dataSource={dataSource} width={size.width} height={size.height - 2} onClose={close} onStatus={setStatus} onInteractionChange={setSurfaceInteraction}/><Text color={discardPending ? 'yellow' : 'gray'}>{status}</Text></Box>;
	const navigation = <Panel title={`${rootLabels[root]} ${loading ? '…' : ''}`} width={navigationWidth} height={bodyHeight} paddingX={1}><SelectableList id={`${root}-items`} items={items.length ? items.map((entry) => ({ id: entry.id, label: `${entry.title}${entry.status ? ` · ${entry.status}` : ''}` })) : overlayViews.slice(0, Math.max(1, bodyHeight - 3)).map((id) => ({ id, label: coreUiRegistry.view(id).label }))} height={Math.max(3, bodyHeight - 3)} active={focus === 'navigation'} onSelect={(id) => { if (items.some((entry) => entry.id === id)) setSelected(id); else dispatch({ type: 'open', route: { kind: id as SurfaceKind, viewId: id } }); }}/></Panel>;
	const content = <Panel title={selectedItem?.title ?? coreUiRegistry.view(root).label} height={bodyHeight} flexGrow={1}><MarkdownViewer id="content" value={description(selectedItem)} height={Math.max(4, bodyHeight - 3)} width={Math.max(20, size.width - navigationWidth - 6)} active={focus === 'content'} onFocus={() => setFocus('content')}/></Panel>;
	const composerLabel = root === 'discover' ? 'Search' : root === 'chat' ? 'Message' : 'Quick command';
	return <Box flexDirection="column" width={size.width} height={size.height}><Box justifyContent="space-between"><Text bold color="green">trsd</Text><Text>{ROOT_WORKSPACES.map((id, index) => <Text key={id} inverse={id === root}> {index + 1} {rootLabels[id]} </Text>)}</Text><Text dimColor>Ctrl+P · Ctrl+K · q</Text></Box><Box flexDirection={narrow ? 'column' : 'row'} height={bodyHeight}>{narrow && focus !== 'navigation' ? null : navigation}{narrow && focus === 'navigation' ? null : content}</Box><Panel title={composerLabel} height={3}><MarkdownEditor id="composer" value={composer} onChange={(value) => { setComposer(value); if (overlay) dispatch({ type: 'dirty', dirty: Boolean(value) }); }} height={1} active={focus === 'composer'} onFocus={() => setFocus('composer')} onSubmit={submit} placeholder={root === 'discover' ? 'Search team knowledge…' : root === 'chat' ? 'Address @agent and write a message…' : 'Use Ctrl+P for actions…'}/></Panel><Text color={status.toLowerCase().includes('error') ? 'red' : 'gray'} wrap="truncate-end">{status}</Text></Box>;
}
