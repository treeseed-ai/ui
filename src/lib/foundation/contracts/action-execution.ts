import type { ActionExecution, ActionExecutionState } from './semantic.ts';

export type ActionExecutionEvent =
	| { type: 'configure' }
	| { type: 'confirm' }
	| { type: 'submit' }
	| { type: 'queue'; message?: string }
	| { type: 'run'; message?: string }
	| { type: 'succeed'; message?: string; result?: Record<string, unknown> }
	| { type: 'fail'; message: string }
	| { type: 'cancel'; message?: string }
	| { type: 'retry' };

const destination: Record<ActionExecutionEvent['type'], ActionExecutionState> = {
	configure: 'configuring', confirm: 'confirming', submit: 'submitted', queue: 'queued', run: 'running',
	succeed: 'succeeded', fail: 'failed', cancel: 'canceled', retry: 'configuring',
};

const transitions: Record<ActionExecutionState, readonly ActionExecutionEvent['type'][]> = {
	available: ['configure', 'cancel'],
	configuring: ['confirm', 'submit', 'cancel'],
	confirming: ['submit', 'cancel'],
	submitted: ['queue', 'run', 'succeed', 'fail', 'cancel'],
	queued: ['run', 'succeed', 'fail', 'cancel'],
	running: ['succeed', 'fail', 'cancel'],
	succeeded: [],
	failed: ['retry', 'cancel'],
	canceled: [],
};

export function createActionExecution(id: string, actionId: string, target?: ActionExecution['target']): ActionExecution {
	return { id, actionId, ...(target ? { target } : {}), state: 'available' };
}

export function transitionActionExecution(execution: ActionExecution, event: ActionExecutionEvent, now = new Date().toISOString()): ActionExecution {
	if (!transitions[execution.state].includes(event.type)) throw new Error(`Action ${execution.actionId} cannot ${event.type} from ${execution.state}.`);
	const state = destination[event.type];
	const terminal = state === 'succeeded' || state === 'failed' || state === 'canceled';
	return {
		...execution,
		state,
		...(state === 'submitted' && !execution.startedAt ? { startedAt: now } : {}),
		...(terminal ? { completedAt: now } : {}),
		...('message' in event ? { message: event.message } : {}),
		...(event.type === 'succeed' && event.result ? { result: event.result } : {}),
	};
}
