import { describe, expect, it } from 'vitest';
import { CONTROL_PLANE_OPERATION_LIST } from '@treeseed/sdk/operator-contracts';
import {
	ROOT_WORKSPACES,
	activeSurface,
	coreUiRegistry,
	createWorkspaceState,
	createActionExecution,
	defineUiRegistry,
	transitionActionExecution,
	workspaceReducer,
} from '../../../src/lib/foundation/contracts.ts';

describe('semantic UI kernel', () => {
	it('defines the four roots and every wireframe surface', () => {
		expect(ROOT_WORKSPACES).toEqual(['team', 'chat', 'inbox', 'discover']);
		for (const id of ['team', 'user', 'services', 'capacity', 'projects', 'knowledge', 'model', 'template', 'chat', 'agent-builder', 'inbox', 'allocator', 'discover', 'content', 'releases']) {
			expect(coreUiRegistry.view(id).id).toBe(id);
		}
	});

	it('rejects invalid cross references', () => {
		expect(() => defineUiRegistry({ resources: [{ id: 'bad', label: 'Bad', pluralLabel: 'Bad', identityField: 'missing', fields: [] }] })).toThrow('has no identity field');
		expect(() => defineUiRegistry({ actions: [{ id: 'ambiguous', label: 'Ambiguous', scope: 'global', operationId: 'one', workflowId: 'two' }] })).toThrow('exactly one operationId or workflowId');
		expect(() => defineUiRegistry({ actions: [{ id: 'unbound', label: 'Unbound', scope: 'global' }] })).toThrow('exactly one operationId or workflowId');
	});

	it('distinguishes direct SDK operations from composed workflows', () => {
		expect(coreUiRegistry.action('service.remove').operationId).toBe('services.connections.disconnect');
		expect(coreUiRegistry.action('proposal.approve').operationId).toBe('inbox.items.action');
		expect(coreUiRegistry.action('agent.save').workflowId).toBe('agent.author.update');
		expect(coreUiRegistry.action('agent.save').operationId).toBeUndefined();
		expect(coreUiRegistry.action('release.cut').workflowId).toBe('release.staging.cut');
		expect(coreUiRegistry.action('release.cut').operationId).toBeUndefined();
	});

	it('binds every direct action to the current SDK operation catalog', () => {
		const operationIds = new Set<string>(CONTROL_PLANE_OPERATION_LIST.map((operation) => operation.descriptor.operationId));
		for (const action of coreUiRegistry.actions.values()) if (action.operationId) expect(operationIds.has(action.operationId), action.id).toBe(true);
	});

	it('uses one guarded action lifecycle for direct operations and workflows', () => {
		let execution = createActionExecution('execution-1', 'proposal.approve', { resource: 'proposal', id: 'proposal-1' });
		execution = transitionActionExecution(execution, { type: 'configure' }, '2026-09-02T12:00:00.000Z');
		execution = transitionActionExecution(execution, { type: 'confirm' }, '2026-09-02T12:00:01.000Z');
		execution = transitionActionExecution(execution, { type: 'submit' }, '2026-09-02T12:00:02.000Z');
		execution = transitionActionExecution(execution, { type: 'run' }, '2026-09-02T12:00:03.000Z');
		execution = transitionActionExecution(execution, { type: 'succeed', result: { decisionId: 'decision-1' } }, '2026-09-02T12:00:04.000Z');
		expect(execution).toMatchObject({ state: 'succeeded', startedAt: '2026-09-02T12:00:02.000Z', completedAt: '2026-09-02T12:00:04.000Z', result: { decisionId: 'decision-1' } });
		expect(() => transitionActionExecution(execution, { type: 'retry' })).toThrow('cannot retry from succeeded');
	});

	it('preserves each workspace stack and restores the parent surface', () => {
		let state = createWorkspaceState({ teamId: 'team-a' });
		state = workspaceReducer(state, { type: 'open', route: { kind: 'projects', id: 'project-a' }, focusId: 'projects' });
		expect(activeSurface(state).route.kind).toBe('projects');
		state = workspaceReducer(state, { type: 'switch', workspace: 'chat' });
		state = workspaceReducer(state, { type: 'open', route: { kind: 'agent-builder', id: 'agent-a' }, focusId: 'prompt' });
		state = workspaceReducer(state, { type: 'switch', workspace: 'team' });
		expect(activeSurface(state).route.kind).toBe('projects');
		state = workspaceReducer(state, { type: 'close' });
		expect(activeSurface(state).route.kind).toBe('team');
		state = workspaceReducer(state, { type: 'switch', workspace: 'chat' });
		expect(activeSurface(state).focusId).toBe('prompt');
	});

	it('protects dirty overlays until discard is explicit', () => {
		let state = createWorkspaceState();
		state = workspaceReducer(state, { type: 'open', route: { kind: 'content', id: 'draft' } });
		state = workspaceReducer(state, { type: 'dirty', dirty: true });
		expect(workspaceReducer(state, { type: 'close' })).toBe(state);
		expect(activeSurface(workspaceReducer(state, { type: 'close', discardDirty: true })).route.kind).toBe('team');
	});

	it('exposes palette entries from the same view registry', () => {
		expect(coreUiRegistry.search('agent build').map((entry) => entry.target)).toEqual(['agent-builder']);
		expect(JSON.parse(JSON.stringify([...coreUiRegistry.views.values()]))).toHaveLength(15);
	});

	it('registers content, dynamic, and responsive utility applications', () => {
		const follow = coreUiRegistry.application('follow');
		expect(follow.kind).toBe('dynamic');
		expect(follow.dynamic).toMatchObject({ topology: true, playback: true, simulation: true });
		expect(coreUiRegistry.application('chat').placements).toEqual({ narrow: 'dock-bottom', medium: 'dock-end', wide: 'dock-end' });
		expect(coreUiRegistry.application('feedback').launchers).toContain('site-links');
		expect(coreUiRegistry.application('books')).toMatchObject({ viewId: 'knowledge', route: '/app/knowledge' });
		expect(JSON.parse(JSON.stringify([...coreUiRegistry.applications.values()]))).toHaveLength(6);
	});

	it('preserves and bounds utility dock state independently from surface stacks', () => {
		let state = createWorkspaceState();
		state = workspaceReducer(state, { type: 'focus', focusId: 'atlas-project-a' });
		state = workspaceReducer(state, { type: 'utility.open', applicationId: 'chat', placement: 'dock-end', returnFocusId: 'atlas-project-a' });
		expect(state.utilityDock).toMatchObject({ open: true, applicationId: 'chat', placement: 'dock-end', returnFocusId: 'atlas-project-a' });
		state = workspaceReducer(state, { type: 'utility.resize', size: 120 });
		expect(state.utilityDock.size).toBe(240);
		state = workspaceReducer(state, { type: 'utility.place', placement: 'dock-bottom' });
		expect(state.utilityDock.placement).toBe('dock-bottom');
		state = workspaceReducer(state, { type: 'utility.close' });
		expect(state.utilityDock).toMatchObject({ open: false, returnFocusId: 'atlas-project-a' });
		expect(activeSurface(state).focusId).toBe('atlas-project-a');
	});

	it('restores renderer navigation into the canonical surface stack', () => {
		const state = workspaceReducer(createWorkspaceState(), { type: 'restore.stack', workspace: 'team', routes: [
			{ kind: 'agent', id: 'planner' },
			{ kind: 'knowledge', id: 'operating-model' },
		] });
		expect(state.workspaces.team.stack.map((frame) => frame.route.kind)).toEqual(['team', 'agent', 'knowledge']);
	});

	it('rejects invalid application registrations', () => {
		expect(() => defineUiRegistry({ applications: [{ id: 'bad', label: 'Bad', kind: 'workspace', viewId: 'missing', launchers: ['team-links'], placements: { narrow: 'content', medium: 'content', wide: 'content' } }] })).toThrow('unknown view');
	});
});
