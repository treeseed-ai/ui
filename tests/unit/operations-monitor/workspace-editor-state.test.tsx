import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { AgentDefinitionEditor } from '../../../src/react/command-center/detail/AgentDefinitionEditor.tsx';
import { StructuredSourceEditor } from '../../../src/react/command-center/editor/SourceEditor.tsx';
import { simulationAtlasPath } from '../../../src/react/command-center/simulation/SimulationBay.tsx';
import { closeTopWorkspaceOverlay } from '../../../src/react/workspace-surfaces/workspace-navigation.ts';

function returnInline() {
	history.replaceState({}, '', '/app/work/build?inspect=agent~agent-one');
	window.dispatchEvent(new PopStateEvent('popstate'));
}

const agentAuthoring = {
	projectId: 'project-one', path: 'src/content/agents/guide-steward.mdx', expectedBase: 'a'.repeat(40),
	source: '---\nname: Guide Steward\ndescription: Coordinates guide work.\nidentity:\n  purpose: Maintain direction.\n  responsibilities: []\n  durableInstructions: Preserve evidence.\nactivityProfiles: {}\n---\nAgent body',
};

describe('workspace editor state', () => {
	beforeEach(() => { history.replaceState({}, '', '/app/work/build?inspect=agent~agent-one'); sessionStorage.clear(); });

	it('keeps the Agent Designer draft mounted across focus and browser Back', async () => {
		const user = userEvent.setup();
		render(<main data-ts-workspace-content><AgentDefinitionEditor
			detail={{ id: 'agent-one', kind: 'agent', title: 'Guide Steward', description: 'Coordinates guide work.', status: 'idle' }}
			authoring={agentAuthoring}
			saveEndpoint="/v1/agent-authoring"
		/></main>);
		const name = screen.getByRole('textbox', { name: 'Human-readable name' });
		await user.clear(name);
		await user.type(name, 'Uncommitted Steward');
		await user.click(screen.getByRole('button', { name: 'Expand Agent Designer' }));
		expect(location.search).toContain('focus=designer');

		returnInline();

		await waitFor(() => expect(screen.getByRole('button', { name: 'Expand Agent Designer' })).toBeVisible());
		expect(screen.getByRole('textbox', { name: 'Human-readable name' })).toBe(name);
		expect(name).toHaveValue('Uncommitted Steward');
	});

	it('restores an uncommitted Designer revision after the simulation and Atlas route round trip', async () => {
		const user = userEvent.setup();
		const props = { detail: { id: 'agent-one', kind: 'agent' as const, title: 'Guide Steward', description: 'Coordinates guide work.', status: 'idle' }, authoring: agentAuthoring, saveEndpoint: '/v1/agent-authoring' };
		render(<main data-ts-workspace-content><AgentDefinitionEditor {...props} /></main>);
		const name = screen.getByRole('textbox', { name: 'Human-readable name' });
		await user.clear(name); await user.type(name, 'Simulation Draft');
		await user.click(screen.getByRole('button', { name: /Common context/ }));
		await user.click(screen.getByRole('button', { name: 'Set up test' }));
		expect(screen.getByRole('dialog', { name: 'Test Simulation Draft' })).toBeVisible();
		await user.click(screen.getByRole('button', { name: 'Open Simulation Bay' }));
		const parameters = new URL(location.href).searchParams;
		expect(parameters.get('focus')).toBe('simulation');
		expect(parameters.get('project')).toBe('project-one');
		expect(parameters.get('returnTo')).toContain('focus=designer');
		expect(parameters.get('returnTo')).toContain('inspect=agent%7Eagent-one');

		cleanup();
		history.replaceState({}, '', parameters.get('returnTo')!);
		render(<main data-ts-workspace-content><AgentDefinitionEditor {...props} /></main>);
		expect(screen.getByRole('button', { name: /Common context/ })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByText('Restored the uncommitted design from this browser session.')).toBeVisible();
		await user.click(screen.getByRole('button', { name: /Identity & purpose/ }));
		expect(screen.getByRole('textbox', { name: 'Human-readable name' })).toHaveValue('Simulation Draft');
	});

	it('confirms before a dirty Designer overlay is discarded', async () => {
		const user = userEvent.setup();
		render(<main data-ts-workspace-content><AgentDefinitionEditor
			detail={{ id: 'agent-one', kind: 'agent', title: 'Guide Steward', description: 'Coordinates guide work.', status: 'idle' }}
			authoring={agentAuthoring}
			saveEndpoint="/v1/agent-authoring"
		/></main>);
		const name = screen.getByRole('textbox', { name: 'Human-readable name' });
		await user.clear(name); await user.type(name, 'Protected draft');
		closeTopWorkspaceOverlay();
		expect(await screen.findByRole('dialog', { name: 'Discard uncommitted agent design?' })).toBeVisible();
		expect(location.search).toContain('inspect=agent~agent-one');
		await user.click(screen.getByRole('button', { name: 'Keep editing' }));
		expect(name).toHaveValue('Protected draft');
		closeTopWorkspaceOverlay();
		await user.click(await screen.findByRole('button', { name: 'Discard draft' }));
		await waitFor(() => expect(location.search).not.toContain('inspect='));
		expect(sessionStorage.getItem('agent-designer:project-one:src/content/agents/guide-steward.mdx')).toBeNull();
	});

	it('carries the immutable simulation into a focused workday Atlas and back to Designer', () => {
		const designer = '/app/work/build?inspect=agent%7Eagent-one&focus=designer&view=edit';
		const atlas = simulationAtlasPath('workday-one', 'simulation-one', designer);
		const parameters = new URL(atlas, location.origin).searchParams;
		expect(parameters.get('focus')).toBe('atlas');
		expect(parameters.get('workday')).toBe('workday-one');
		expect(parameters.get('simulation')).toBe('simulation-one');
		expect(parameters.get('returnTo')).toBe(designer);
	});

	it('keeps source, path, and mode state mounted across focus and browser Back', async () => {
		const user = userEvent.setup();
		render(<main data-ts-workspace-content><StructuredSourceEditor
			title="Agent source"
			description="Edit the exact source."
			source="# Original"
			language="mdx"
			saveEndpoint="/v1/source-authoring"
			expectedBase={'b'.repeat(40)}
			projectId="project-one"
			path="src/content/agents/agent-one.mdx"
		/></main>);
		const source = screen.getByRole('textbox', { name: 'Agent source source' });
		const path = screen.getByRole('textbox', { name: 'Repository path' });
		await user.clear(source);
		await user.type(source, '# Uncommitted');
		await user.clear(path);
		await user.type(path, 'src/content/agents/moved.mdx');
		await user.click(screen.getByRole('button', { name: 'Expand MDX editor' }));
		expect(location.search).toContain('focus=editor');

		returnInline();

		await waitFor(() => expect(screen.getByRole('button', { name: 'Expand MDX editor' })).toBeVisible());
		expect(screen.getByRole('textbox', { name: 'Agent source source' })).toBe(source);
		expect(source).toHaveValue('# Uncommitted');
		expect(path).toHaveValue('src/content/agents/moved.mdx');
	});
});
