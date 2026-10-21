import type { WorkdaySummary } from '../../../react/operations-monitor/types.ts';
import { formatTimestamp, timestampDate } from '../../../timestamps.ts';

export function shortWorkdayIds(workdays: WorkdaySummary[]) {
	return new Map(workdays.map(({ id }) => {
		let length = Math.min(8, id.length);
		while (length < id.length && workdays.some((other) => other.id !== id && other.id.slice(0, length) === id.slice(0, length))) length += 1;
		return [id, id.slice(0, length)] as const;
	}));
}

export function formatWorkdayStart(value: string | null, timeZone: string) {
	if (!value) return null;
	const date = timestampDate(value);
	return date ? { dateTime: date.toISOString(), label: formatTimestamp(date, { timeZone }) } : null;
}
