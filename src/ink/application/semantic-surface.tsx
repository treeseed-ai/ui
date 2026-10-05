import { coreUiRegistry, type ResourceDefinition, type SurfaceKind, type ViewRegionDefinition } from '../../lib/foundation/contracts.ts';
import { Box, Text, useInput } from 'ink';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MarkdownViewer, Panel, SelectableList, type SelectItem } from '../workbench.tsx';
import type { InkRow, InkSurfaceItem, InkWorkspaceDataSource } from './types.ts';
import { initialWorkflowValues, WorkflowForm, type WorkflowSession } from './workflow-form.tsx';

type SurfaceFocus = 'collection' | 'resource' | 'actions';
const value = (entry: unknown) => entry == null || entry === '' ? '—' : typeof entry === 'object' ? JSON.stringify(entry) : String(entry);

export function semanticDocument(item: InkSurfaceItem | undefined, fields: ResourceDefinition['fields']) {
	if (!item) return '# No selection\n\nChoose an item from the collection to inspect it.';
	const lines = [`# ${item.title}`];
	if (item.status) lines.push('', `Status: ${item.status}`);
	if (item.description) lines.push('', item.description);
	lines.push('', '## Fields');
	for (const field of fields) lines.push(`**${field.label}**: ${value(item.raw[field.id])}`);
	return lines.join('\n');
}

function listValues(entry: unknown) {
	if (Array.isArray(entry)) return entry;
	if (entry && typeof entry === 'object') return Object.entries(entry as InkRow).map(([id, child]) => typeof child === 'object' ? { id, ...(child as InkRow) } : { id, value: child });
	return [];
}

export function semanticRegionDocument(item: InkSurfaceItem | undefined, region: ViewRegionDefinition, resource?: ResourceDefinition) {
	if (!item) return `# ${region.label ?? region.id}\n\nChoose an item to inspect this region.`;
	if (region.type === 'signals') return [`# ${region.label ?? 'Signals'}`, '', ...(resource?.signals?.length ? resource.signals.map((signal) => `**${signal.label}**: ${value(item.raw[signal.id])}${signal.unit ?? ''}`) : ['No signals are declared for this resource.'])].join('\n');
	if (region.type === 'relationships') {
		const relationship = resource?.relationships?.find((candidate) => candidate.id === region.relationship), related = listValues(item.raw[region.relationship ?? region.id]);
		return [`# ${region.label ?? relationship?.label ?? 'Relationships'}`, '', ...(related.length ? related.map((entry, index) => `- ${value((entry as InkRow).title ?? (entry as InkRow).name ?? (entry as InkRow).id ?? entry ?? index + 1)}`) : [`No related ${relationship?.label?.toLowerCase() ?? 'items'} are present in this projection.`])].join('\n');
	}
	if (region.type === 'activity') {
		const activity = listValues(item.raw.activity ?? item.raw.events ?? item.raw.history);
		return [`# ${region.label ?? 'Activity'}`, '', ...(activity.length ? activity.map((entry, index) => `- ${value((entry as InkRow).message ?? (entry as InkRow).title ?? (entry as InkRow).type ?? (entry as InkRow).id ?? entry ?? index + 1)}`) : ['No activity is present in this projection.'])].join('\n');
	}
	if (region.type === 'custom') return `# ${region.label ?? region.id}\n\n${region.presentation ? `Presentation: ${region.presentation}` : 'This renderer uses the compact semantic presentation.'}`;
	return semanticDocument(item, resource?.fields.filter((field) => !region.fields || region.fields.includes(field.id)) ?? []).replace(/^# .+$/u, `# ${region.label ?? region.id}`);
}

export function SemanticSurface({ kind, dataSource, width, height, onClose, onStatus, onInteractionChange }: { kind: SurfaceKind; dataSource: InkWorkspaceDataSource; width: number; height: number; onClose: () => void; onStatus: (message: string) => void; onInteractionChange: (active: boolean) => void }) {
	const view = coreUiRegistry.view(kind), [items, setItems] = useState<InkSurfaceItem[]>([]), [selected, setSelected] = useState<string>(), [focus, setFocus] = useState<SurfaceFocus>('collection');
	const inspectorRegions = useMemo(() => view.regions.filter((region) => !['collection', 'search'].includes(region.type)), [view.regions]);
	const [regionIndex, setRegionIndex] = useState(0), activeRegion = inspectorRegions[regionIndex % Math.max(1, inspectorRegions.length)] ?? view.regions[0]!;
	const resource = activeRegion.resource ? coreUiRegistry.resource(activeRegion.resource) : undefined;
	const [loading, setLoading] = useState(false), [error, setError] = useState<string>(), [session, setSession] = useState<WorkflowSession>();
	useEffect(() => { onInteractionChange(Boolean(session)); return () => onInteractionChange(false); }, [session, onInteractionChange]);
	const narrow = width < 72, collectionWidth = narrow ? width : Math.max(25, Math.floor(width * .34)), selectedItem = items.find((entry) => entry.id === selected) ?? items[0];
	const actions = useMemo<SelectItem[]>(() => (view.actions ?? []).map((id) => ({ id, label: coreUiRegistry.action(id).label, disabled: !dataSource.canExecute(id, selectedItem) })), [dataSource, selectedItem, view.actions]);
	const load = useCallback(() => {
		let active = true; setLoading(true); setError(undefined); onStatus(`Loading ${view.label}…`);
		void dataSource.loadSurface(kind).then((collection) => { if (!active) return; setItems(collection.items); setSelected((current) => collection.items.some((entry) => entry.id === current) ? current : collection.items[0]?.id); onStatus(collection.message); }).catch((reason) => { if (!active) return; const message = reason instanceof Error ? reason.message : String(reason); setItems([]); setError(message); onStatus(message); }).finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [dataSource, kind, onStatus, view.label]);
	useEffect(load, [load]);
	useInput((input, key) => {
		if (session) return;
		if (key.escape) onClose();
		else if (key.tab) { const order: SurfaceFocus[] = actions.length ? ['collection', 'resource', 'actions'] : ['collection', 'resource']; setFocus(order[(order.indexOf(focus) + (key.shift ? order.length - 1 : 1)) % order.length]!); }
		else if (input === ']' && inspectorRegions.length > 1) setRegionIndex((current) => (current + 1) % inspectorRegions.length);
		else if (input === '[' && inspectorRegions.length > 1) setRegionIndex((current) => (current + inspectorRegions.length - 1) % inspectorRegions.length);
		else if (input === 'r' && focus !== 'actions') load();
	});
	const submit = useCallback(() => {
		if (!session) return;
		const running = { ...session, stage: 'running' as const, message: undefined }; setSession(running); onStatus(`Submitting ${running.definition.label}…`);
		void dataSource.execute(running.definition.id, running.values, selectedItem).then(() => { setSession({ ...running, stage: 'succeeded', message: `${running.definition.label} succeeded.` }); onStatus(`${running.definition.label} succeeded.`); load(); }).catch((reason) => { const message = reason instanceof Error ? reason.message : String(reason); setSession({ ...running, stage: 'failed', message }); onStatus(message); });
	}, [dataSource, load, onStatus, selectedItem, session]);
	if (session) return <WorkflowForm session={session} height={height} onChange={setSession} onSubmit={submit} onCancel={() => setSession(undefined)} />;
	const list = <Panel title={`${view.label} ${loading ? '…' : `· ${items.length}`}`} width={collectionWidth} height={height - 2} paddingX={1}>{error ? <Text color="red">{error}</Text> : items.length ? <SelectableList id={`${kind}-collection`} items={items.map((entry) => ({ id: entry.id, label: `${entry.title}${entry.status ? ` · ${entry.status}` : ''}`, selected: entry.id === selected }))} height={Math.max(3, height - 6)} active={focus === 'collection'} onSelect={(id) => { setSelected(id); setFocus('resource'); }} /> : <Text dimColor>{loading ? 'Loading live data…' : 'No visible items.'}</Text>}</Panel>;
	const document = <Panel title={`${selectedItem?.title ?? resource?.label ?? view.label} · ${activeRegion.label ?? activeRegion.id}`} height={height - 2} flexGrow={1}>{inspectorRegions.length > 1 ? <Text dimColor>{inspectorRegions.map((region, index) => `${index === regionIndex ? '●' : '○'} ${region.label ?? region.id}`).join('  ')}  · [ ] switch</Text> : null}<MarkdownViewer id={`${kind}-resource`} value={semanticRegionDocument(selectedItem, activeRegion, resource)} height={Math.max(4, height - (actions.length ? 10 : 6))} width={Math.max(20, width - collectionWidth - 6)} active={focus === 'resource'} onFocus={() => setFocus('resource')} />{actions.length ? <Box borderStyle="single" borderColor={focus === 'actions' ? 'cyan' : 'gray'} flexDirection="column" paddingX={1}><Text bold>Actions</Text><SelectableList id={`${kind}-actions`} items={actions} height={Math.min(3, actions.length)} active={focus === 'actions'} onSelect={(id) => { const definition = coreUiRegistry.action(id); setSession({ definition, values: initialWorkflowValues(definition, selectedItem ? { ...selectedItem.raw, id: selectedItem.id } : undefined), step: 0, field: 0, stage: 'configuring' }); }} />{actions.some((entry) => entry.disabled) ? <Text dimColor>Unavailable actions remain visibly disabled.</Text> : null}</Box> : null}</Panel>;
	return <Box flexDirection="column" width={width} height={height}><Box justifyContent="space-between"><Text><Text bold color="cyan">{view.label}</Text><Text dimColor> · live semantic surface</Text></Text><Text dimColor>Tab panes · r refresh · Esc close</Text></Box><Box flexDirection={narrow ? 'column' : 'row'} height={height - 1}>{narrow && focus !== 'collection' ? null : list}{narrow && focus === 'collection' ? null : document}</Box></Box>;
}
