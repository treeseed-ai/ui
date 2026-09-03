import type { ActionDefinition, FieldDefinition, WorkflowStepDefinition } from '../../lib/foundation/contracts.ts';
import { Box, Text, useInput } from 'ink';
import React from 'react';
import { Panel } from '../workbench.tsx';
import type { InkRow } from './types.ts';

export type WorkflowStage = 'configuring' | 'confirming' | 'running' | 'succeeded' | 'failed';
export interface WorkflowSession { definition: ActionDefinition; values: InkRow; step: number; field: number; stage: WorkflowStage; message?: string }

export function workflowSteps(action: ActionDefinition): WorkflowStepDefinition[] {
	if (action.steps?.length) return action.steps;
	return [{ id: 'configure', label: 'Configure', fields: action.input ?? [] }];
}

export function initialWorkflowValues(action: ActionDefinition, selected?: InkRow & { id?: string }) {
	const values: InkRow = { ...(selected ?? {}) };
	if (selected?.id) {
		values.id ??= selected.id;
		values.reviewId ??= selected.id;
	}
	for (const step of workflowSteps(action)) for (const field of step.fields) {
		if ((values[field.id] === undefined || values[field.id] === '') && field.options?.length) values[field.id] = field.options[0]!.value;
	}
	return values;
}

export function validateWorkflowField(field: FieldDefinition, value: unknown) {
	const source = String(value ?? '').trim();
	if (field.required && !source) return `${field.label} is required.`;
	if (!source) return undefined;
	if (field.type === 'number' || field.type === 'percentage') {
		const numeric = Number(source);
		if (!Number.isFinite(numeric)) return `${field.label} must be a number.`;
		if (field.minimum !== undefined && numeric < field.minimum) return `${field.label} must be at least ${field.minimum}.`;
		if (field.maximum !== undefined && numeric > field.maximum) return `${field.label} must be no more than ${field.maximum}.`;
	}
	if (field.options?.length && !field.options.some((option) => option.value === source)) return `${field.label} must be one of: ${field.options.map((option) => option.value).join(', ')}.`;
	if (/json/iu.test(field.label)) {
		try { JSON.parse(source); } catch { return `${field.label} must contain valid JSON.`; }
	}
	if (field.id === 'slug' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(source)) return `${field.label} must use lowercase letters, numbers, and single hyphens.`;
	if (field.id === 'confirmation' && source !== 'PROMOTE') return 'Type PROMOTE exactly to continue.';
	return undefined;
}

export function WorkflowForm({ session, height, onChange, onSubmit, onCancel }: {
	session: WorkflowSession; height: number; onChange: (session: WorkflowSession) => void; onSubmit: () => void; onCancel: () => void;
}) {
	const steps = workflowSteps(session.definition), activeStep = steps[session.step]!, fields = activeStep.fields, active = fields[session.field];
	useInput((input, key) => {
		if (session.stage === 'running') return;
		if (key.escape || (session.stage === 'confirming' && input.toLowerCase() === 'n')) { onCancel(); return; }
		if (session.stage === 'succeeded' || session.stage === 'failed') { if (key.return || input === 'q') onCancel(); return; }
		if (session.stage === 'confirming') { if (input.toLowerCase() === 'y' || key.return) onSubmit(); return; }
		if (key.tab || key.downArrow) { onChange({ ...session, field: (session.field + 1) % Math.max(1, fields.length) }); return; }
		if (key.upArrow) { onChange({ ...session, field: (session.field + Math.max(1, fields.length) - 1) % Math.max(1, fields.length) }); return; }
		if (key.leftArrow && active?.options?.length) {
			const current = active.options.findIndex((option) => option.value === session.values[active.id]);
			const option = active.options[(current + active.options.length - 1) % active.options.length]!;
			onChange({ ...session, values: { ...session.values, [active.id]: option.value }, message: undefined }); return;
		}
		if (key.rightArrow && active?.options?.length) {
			const current = active.options.findIndex((option) => option.value === session.values[active.id]);
			const option = active.options[(current + 1) % active.options.length]!;
			onChange({ ...session, values: { ...session.values, [active.id]: option.value }, message: undefined }); return;
		}
		if ((key.leftArrow || (key.ctrl && input.toLowerCase() === 'b')) && session.step > 0) { onChange({ ...session, step: session.step - 1, field: 0, message: undefined }); return; }
		if (key.return && key.shift && active && !active.readonly) {
			onChange({ ...session, values: { ...session.values, [active.id]: `${String(session.values[active.id] ?? '')}\n` }, message: undefined }); return;
		}
		if (key.return) {
			const invalid = fields.map((field) => validateWorkflowField(field, session.values[field.id])).find(Boolean);
			if (invalid) { const field = fields.find((candidate) => validateWorkflowField(candidate, session.values[candidate.id]) === invalid)!; onChange({ ...session, field: fields.indexOf(field), message: invalid }); return; }
			if (session.step < steps.length - 1) { onChange({ ...session, step: session.step + 1, field: 0, message: undefined }); return; }
			const stage = session.definition.confirmation === 'none' || !session.definition.confirmation ? 'running' : 'confirming';
			onChange({ ...session, stage, message: undefined }); if (stage === 'running') onSubmit(); return;
		}
		if (!active || active.readonly) return;
		const current = String(session.values[active.id] ?? '');
		if (key.backspace || key.delete) onChange({ ...session, values: { ...session.values, [active.id]: current.slice(0, -1) }, message: undefined });
		else if (input && !key.ctrl && !key.meta) onChange({ ...session, values: { ...session.values, [active.id]: current + input }, message: undefined });
	});
	if (session.stage === 'confirming') return <Panel title={`Confirm · ${session.definition.label}`} height={height} paddingX={2}><Text>{session.definition.confirmation === 'strongConfirm' ? 'Submit this authority-bearing action?' : 'Submit this action to the active team?'}</Text><Box marginTop={1}><Text color="yellow">Press y or Enter to confirm · n or Esc to cancel</Text></Box></Panel>;
	if (session.stage === 'running') return <Panel title={session.definition.label} height={height} paddingX={2}><Text color="cyan">Submitting…</Text></Panel>;
	if (session.stage === 'succeeded' || session.stage === 'failed') return <Panel title={session.definition.label} height={height} paddingX={2}><Text color={session.stage === 'succeeded' ? 'green' : 'red'}>{session.message}</Text><Box marginTop={1}><Text dimColor>Press Enter to return.</Text></Box></Panel>;
	return <Panel title={`${session.definition.label} · ${session.step + 1}/${steps.length} ${activeStep.label}`} height={height} paddingX={2}>
		<Text dimColor>Tab/↑/↓ fields · ←/→ options · Shift+Enter newline · Ctrl+B previous · Enter continues · Esc cancels</Text>{activeStep.description ? <Text>{activeStep.description}</Text> : null}
		<Box marginTop={1} flexDirection="column">{fields.map((field, index) => {
			const stored = String(session.values[field.id] ?? ''), shown = field.secret || field.type === 'secret' ? '•'.repeat(stored.length) : stored;
			return <Box key={field.id} flexDirection="column" marginBottom={1}><Text color={index === session.field ? 'cyan' : undefined} bold={index === session.field}>{field.label}{field.required ? ' *' : ''}</Text><Text inverse={index === session.field}> {shown || ' '} </Text>{index === session.field && field.description ? <Text dimColor>{field.description}</Text> : null}{index === session.field && field.options?.length ? <Text dimColor>Options: {field.options.map((option) => `${option.value} (${option.label})`).join(' · ')}</Text> : null}</Box>;
		})}</Box>{session.message ? <Text color="red">{session.message}</Text> : null}
	</Panel>;
}
