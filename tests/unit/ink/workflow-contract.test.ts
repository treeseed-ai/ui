import { describe, expect, it } from 'vitest';
import { coreUiRegistry } from '../../../src/lib/foundation/contracts.ts';
import { initialWorkflowValues, validateWorkflowField, workflowSteps } from '../../../src/ink/application/workflow-form.tsx';

describe('shared Ink workflow contract', () => {
	it('exposes complete reusable multi-step definitions for high-velocity operations', () => {
		for (const id of ['service.connect', 'service.configure', 'capacity.configure', 'agent.create', 'agent.save', 'allocation.save', 'content.edit', 'release.cut', 'release.promote-production']) {
			const steps = workflowSteps(coreUiRegistry.action(id));
			expect(steps.length, id).toBeGreaterThan(1);
			expect(new Set(steps.map((step) => step.id)).size, id).toBe(steps.length);
		}
	});

	it('validates required, constrained, enum, JSON, slug, and strong-confirmation fields centrally', () => {
		expect(validateWorkflowField({ id: 'name', label: 'Name', type: 'string', required: true }, '')).toContain('required');
		expect(validateWorkflowField({ id: 'percentage', label: 'Percent', type: 'percentage', minimum: 0, maximum: 100 }, '101')).toContain('no more than');
		expect(validateWorkflowField({ id: 'mode', label: 'Mode', type: 'enum', options: [{ value: 'local', label: 'Local' }] }, 'remote')).toContain('must be one of');
		expect(validateWorkflowField({ id: 'capabilities', label: 'Capability bindings (JSON)', type: 'text' }, '{bad')).toContain('valid JSON');
		expect(validateWorkflowField({ id: 'slug', label: 'Slug', type: 'string' }, 'Not Valid')).toContain('lowercase');
		expect(validateWorkflowField({ id: 'confirmation', label: 'Confirm', type: 'string' }, 'promote')).toContain('PROMOTE');
		expect(validateWorkflowField({ id: 'percentage', label: 'Percent', type: 'percentage', minimum: 0, maximum: 100 }, '45')).toBeUndefined();
	});

	it('remains serializable for reuse by Ink and web renderers', () => {
		const serialized = JSON.parse(JSON.stringify([...coreUiRegistry.actions.values()]));
		expect(serialized.find((action: { id: string }) => action.id === 'content.edit').steps[1].id).toBe('page');
	});

	it('prefills selected-resource identity and safe enum defaults without renderer-local state', () => {
		const release = initialWorkflowValues(coreUiRegistry.action('release.cut'), { id: 'review-17', status: 'approved' });
		expect(release.reviewId).toBe('review-17');
		const capacity = initialWorkflowValues(coreUiRegistry.action('capacity.configure'));
		expect(capacity.mode).toBe('local');
		expect(capacity.approval).toBe('trusted-local-owner');
	});
});
