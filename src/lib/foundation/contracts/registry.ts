import type { ApplicationDefinition } from './application.ts';
import type { ActionDefinition, ResourceDefinition, ViewDefinition } from './semantic.ts';

export interface CommandPaletteEntry {
	id: string;
	label: string;
	kind: 'view' | 'action' | 'resource';
	target: string;
	keywords?: string[];
}

export interface UiRegistryInput {
	resources?: ResourceDefinition[];
	actions?: ActionDefinition[];
	views?: ViewDefinition[];
	applications?: ApplicationDefinition[];
	commands?: CommandPaletteEntry[];
}

export interface UiRegistry {
	resources: ReadonlyMap<string, ResourceDefinition>;
	actions: ReadonlyMap<string, ActionDefinition>;
	views: ReadonlyMap<string, ViewDefinition>;
	applications: ReadonlyMap<string, ApplicationDefinition>;
	commands: readonly CommandPaletteEntry[];
	resource(id: string): ResourceDefinition;
	action(id: string): ActionDefinition;
	view(id: string): ViewDefinition;
	application(id: string): ApplicationDefinition;
	search(query: string): CommandPaletteEntry[];
}

function unique<T extends { id: string }>(kind: string, items: T[]) {
	const result = new Map<string, T>();
	for (const item of items) {
		if (!item.id.trim()) throw new Error(`${kind} id is required.`);
		if (result.has(item.id)) throw new Error(`Duplicate ${kind} id: ${item.id}`);
		result.set(item.id, Object.freeze({ ...item }));
	}
	return result;
}

function required<T>(kind: string, values: ReadonlyMap<string, T>, id: string) {
	const value = values.get(id);
	if (!value) throw new Error(`Unknown ${kind}: ${id}`);
	return value;
}

export function validateUiRegistry(input: UiRegistryInput) {
	const resources = unique('resource', input.resources ?? []);
	const actions = unique('action', input.actions ?? []);
	const views = unique('view', input.views ?? []);
	const applications = unique('application', input.applications ?? []);
	unique('command', input.commands ?? []);
	for (const action of actions.values()) {
		if (Boolean(action.operationId) === Boolean(action.workflowId)) throw new Error(`Action ${action.id} must declare exactly one operationId or workflowId.`);
		const stepIds = new Set<string>();
		for (const step of action.steps ?? []) {
			if (!step.id.trim() || stepIds.has(step.id)) throw new Error(`Action ${action.id} has an invalid or duplicate workflow step ${step.id}.`);
			stepIds.add(step.id);
			const fieldIds = new Set<string>();
			for (const field of step.fields) {
				if (!field.id.trim() || fieldIds.has(field.id)) throw new Error(`Action ${action.id} step ${step.id} has an invalid or duplicate field ${field.id}.`);
				fieldIds.add(field.id);
			}
		}
	}
	for (const resource of resources.values()) {
		if (!resource.fields.some((field) => field.id === resource.identityField)) throw new Error(`Resource ${resource.id} has no identity field ${resource.identityField}.`);
		for (const action of resource.actions ?? []) if (!actions.has(action)) throw new Error(`Resource ${resource.id} references unknown action ${action}.`);
		for (const relation of resource.relationships ?? []) if (!resources.has(relation.resource)) throw new Error(`Resource ${resource.id} references unknown resource ${relation.resource}.`);
	}
	for (const view of views.values()) {
		for (const region of view.regions) if (region.resource && !resources.has(region.resource)) throw new Error(`View ${view.id} references unknown resource ${region.resource}.`);
		for (const action of [...(view.actions ?? []), ...view.regions.flatMap((region) => region.actions ?? [])]) if (!actions.has(action)) throw new Error(`View ${view.id} references unknown action ${action}.`);
	}
	for (const application of applications.values()) {
		if (application.viewId && !views.has(application.viewId)) throw new Error(`Application ${application.id} references unknown view ${application.viewId}.`);
		if (!application.launchers.length) throw new Error(`Application ${application.id} requires at least one launcher.`);
		if (application.kind === 'dynamic' && !application.dynamic) throw new Error(`Dynamic application ${application.id} requires dynamic capabilities.`);
	}
	return { resources, actions, views, applications };
}

export function defineUiRegistry(input: UiRegistryInput): UiRegistry {
	const { resources, actions, views, applications } = validateUiRegistry(input);
	const commands = Object.freeze([...(input.commands ?? [])]);
	return Object.freeze({
		resources,
		actions,
		views,
		applications,
		commands,
		resource: (id: string) => required('resource', resources, id),
		action: (id: string) => required('action', actions, id),
		view: (id: string) => required('view', views, id),
		application: (id: string) => required('application', applications, id),
		search: (query: string) => {
			const terms = query.trim().toLowerCase().split(/\s+/u).filter(Boolean);
			if (!terms.length) return [...commands];
			return commands.filter((entry) => {
				const text = [entry.label, entry.target, ...(entry.keywords ?? [])].join(' ').toLowerCase();
				return terms.every((term) => text.includes(term));
			});
		},
	});
}
