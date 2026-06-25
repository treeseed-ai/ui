import type { OperatingStatus } from '../../lib/foundation/contracts.ts';
import type { Tone } from '../types.ts';

export function toneForOperatingStatus(status: OperatingStatus): Tone {
	if (status === 'ready' || status === 'completed') return 'success';
	if (status === 'running') return 'info';
	if (status === 'waiting' || status === 'needsReview') return 'warning';
	if (status === 'blocked' || status === 'failed') return 'danger';
	return 'default';
}

export function labelForOperatingStatus(status: OperatingStatus): string {
	if (status === 'needsReview') return 'Needs review';
	return status.replace(/([a-z])([A-Z])/gu, '$1 $2').replace(/\b\w/gu, (match) => match.toUpperCase());
}
