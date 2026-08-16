import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { WorkspaceFocusSurface } from '../../../src/react/workspace-surfaces/WorkspaceFocusSurface.tsx';
import { WorkspaceOverlay } from '../../../src/react/workspace-surfaces/WorkspaceOverlay.tsx';
import { EvidenceDiffViewer } from '../../../src/react/workspace-surfaces/EvidenceDiffViewer.tsx';
import { ForensicEventExplorer } from '../../../src/react/workspace-surfaces/ForensicEventExplorer.tsx';
import { LinkedDiagnosticTable } from '../../../src/react/workspace-surfaces/LinkedDiagnosticTable.tsx';
import { WorkspaceOverlayCoordinator, useWorkspaceOverlayCoordinator } from '../../../src/react/workspace-surfaces/WorkspaceOverlayCoordinator.tsx';
import { currentWorkspaceReturnPath, openWorkspaceOverlay, readWorkspaceNavigation, safeWorkspaceReturnPath, setWorkspaceFocus } from '../../../src/react/workspace-surfaces/workspace-navigation.ts';

function SurfaceHarness() {
	const [mode, setMode] = useState<'inline' | 'focused'>('inline');
	const [draft, setDraft] = useState('draft');
	return <main data-ts-workspace-content><aside>Vitals</aside><WorkspaceFocusSurface id="editor" label="Editor" mode={mode} boundary="workspace-content" onModeChange={setMode}><label>Draft<input value={draft} onChange={(event) => setDraft(event.target.value)} /></label></WorkspaceFocusSurface></main>;
}

describe('workspace focus surfaces', () => {
	it('focuses within the content boundary and restores the mounted draft on shrink', () => {
		const { container } = render(<SurfaceHarness />);
		const input = screen.getByRole('textbox', { name: 'Draft' });
		fireEvent.change(input, { target: { value: 'unsaved change' } });
		fireEvent.click(screen.getByRole('button', { name: 'Expand Editor' }));
		expect(container.querySelector('[data-workspace-surface="editor"]')).toHaveAttribute('data-mode', 'focused');
		expect(container.querySelector('aside')).toHaveProperty('inert', true);
		expect(screen.getByRole('textbox', { name: 'Draft' })).toBe(input);
		fireEvent.click(screen.getByRole('button', { name: 'Shrink Editor' }));
		expect(screen.getByRole('textbox', { name: 'Draft' })).toHaveValue('unsaved change');
		expect((container.querySelector('aside') as HTMLElement).inert).not.toBe(true);
		expect(container.querySelector('aside')).not.toHaveAttribute('aria-hidden');
	});

	it('gives Escape to the top overlay before a focused surface', () => {
		const close = vi.fn();
		render(<main data-ts-workspace-content><WorkspaceFocusSurface id="atlas" label="Atlas" mode="focused" boundary="workspace-content" onModeChange={vi.fn()}><WorkspaceOverlay reference={{ kind: 'detail', id: 'agent' }} label="Agent detail" onClose={close}><button>Inspect</button></WorkspaceOverlay></WorkspaceFocusSurface></main>);
		fireEvent.keyDown(document, { key: 'Escape' });
		expect(close).toHaveBeenCalledOnce();
	});

	it('coordinates one focused surface and a bounded overlay path', () => {
		function Controls() {
			const workspace = useWorkspaceOverlayCoordinator();
			return <><output>{workspace.surfaceId ?? 'inline'}:{workspace.overlays.map((item) => item.id).join('/')}</output><button onClick={() => workspace.focusSurface('atlas')}>Focus</button><button onClick={() => workspace.openOverlay({ kind: 'detail', id: 'agent-a' })}>Agent</button><button onClick={() => workspace.openOverlay({ kind: 'diagnostic', id: 'event-a', parentId: 'agent-a' })}>Event</button><button onClick={() => Array.from({ length: 9 }, (_, index) => workspace.openOverlay({ kind: 'detail', id: `detail-${index}` }))}>Deep path</button><button onClick={workspace.closeTop}>Back</button></>;
		}
		render(<WorkspaceOverlayCoordinator><Controls /></WorkspaceOverlayCoordinator>);
		fireEvent.click(screen.getByRole('button', { name: 'Focus' }));
		fireEvent.click(screen.getByRole('button', { name: 'Agent' }));
		fireEvent.click(screen.getByRole('button', { name: 'Event' }));
		expect(screen.getByRole('status')).toHaveTextContent('atlas:agent-a/event-a');
		fireEvent.click(screen.getByRole('button', { name: 'Back' }));
		expect(screen.getByRole('status')).toHaveTextContent('atlas:agent-a');
		fireEvent.click(screen.getByRole('button', { name: 'Deep path' }));
		expect(screen.getByRole('status')).not.toHaveTextContent('detail-0');
		expect(screen.getByRole('status')).toHaveTextContent('detail-1/detail-2/detail-3/detail-4/detail-5/detail-6/detail-7/detail-8');
	});

	it('renders reusable linked evidence and exact base/current differences', () => {
		render(<><LinkedDiagnosticTable label="Evidence" rows={[{ id: 'event-a', type: 'tool' }]} columns={[{ id: 'type', label: 'Type', value: (row) => row.type }]} onInspect={vi.fn()} /><EvidenceDiffViewer base="before" current="after" /></>);
		expect(screen.getByRole('region', { name: 'Evidence' })).toHaveTextContent('tool');
		expect(screen.getByText('before')).toBeInTheDocument();
		expect(screen.getByText('after')).toBeInTheDocument();
	});

	it('uses one shareable URL contract for focus and bounded overlay history', () => {
		history.replaceState({}, '', '/app/work');
		setWorkspaceFocus('atlas');
		openWorkspaceOverlay({ kind: 'agent', id: 'agent with spaces' });
		expect(location.search).toContain('focus=atlas');
		expect(location.search).toContain('inspect=agent%7Eagent+with+spaces');
		expect(readWorkspaceNavigation()).toEqual({ focusedSurfaceId: 'atlas', overlays: [{ kind: 'agent', id: 'agent with spaces' }] });
	});

	it('retains only same-application work routes as simulation return targets', () => {
		history.replaceState({}, '', '/app/work/build?inspect=agent~agent-one&focus=simulation&return=designer');
		expect(currentWorkspaceReturnPath({ focus: 'designer', return: null })).toBe('/app/work/build?inspect=agent%7Eagent-one&focus=designer');
		expect(safeWorkspaceReturnPath('/app/work/build?focus=designer')).toBe('/app/work/build?focus=designer');
		expect(safeWorkspaceReturnPath('/app/workevil')).toBeNull();
		expect(safeWorkspaceReturnPath('https://example.com/app/work')).toBeNull();
	});

	it('keeps forensic events human-sized while preserving routine evidence on demand', () => {
		const meaningful = Array.from({ length: 30 }, (_, index) => ({ id: `signal-${index}`, type: 'signal.published', message: `Signal ${index}`, severity: 'info', createdAt: '2026-08-12T12:00:00Z' }));
		const routine = Array.from({ length: 25 }, (_, index) => ({ id: `tick-${index}`, type: 'workday.tick', message: `Compilation tick ${index}`, severity: 'info', createdAt: '2026-08-12T12:00:00Z' }));
		render(<ForensicEventExplorer events={[...meaningful, ...routine]} hasMore timeZone="America/New_York" />);
		expect(screen.getByText(/30 matching events/)).toBeInTheDocument();
		expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
		expect(screen.getAllByText(/Signal \d+/)).toHaveLength(25);
		fireEvent.click(screen.getByRole('button', { name: 'Next' }));
		expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
		fireEvent.click(screen.getByRole('checkbox', { name: 'Include routine scheduler activity' }));
		expect(screen.getByText(/55 matching events/)).toBeInTheDocument();
		expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
	});
});
