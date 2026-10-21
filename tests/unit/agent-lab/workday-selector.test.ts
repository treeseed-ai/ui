import { describe, expect, it } from 'vitest';
import type { WorkdaySummary } from '../../../src/react/operations-monitor/types.ts';
import { formatWorkdayStart, shortWorkdayIds } from '../../../src/astro/operating/navigation/workday-selector.ts';

const workdays: WorkdaySummary[] = [
	{ id: '12345678a-workday', title: 'Operations', status: 'completed', startedAt: '2026-08-04T12:00:00.000Z', finishedAt: null },
	{ id: '12345678b-workday', title: 'Operations', status: 'completed', startedAt: null, finishedAt: null },
	{ id: 'unique-workday-03', title: 'Operations', status: 'running', startedAt: 'not-a-date', finishedAt: null },
];

describe('workday selector identity and start time', () => {
	it('extends colliding ID prefixes while keeping distinct records readable', () => {
		const ids = shortWorkdayIds(workdays);
		expect(ids.get('12345678a-workday')).toBe('12345678a');
		expect(ids.get('12345678b-workday')).toBe('12345678b');
		expect(shortWorkdayIds([
			{ ...workdays[0], id: 'abcdefghi-one' },
			{ ...workdays[1], id: 'abcdefghj-two' },
		]).get('abcdefghi-one')).toBe('abcdefghi');
	});

	it('formats only real start timestamps in the supplied operating timezone', () => {
		expect(formatWorkdayStart(workdays[0].startedAt, 'America/New_York')?.label).toContain('8:00 AM');
		expect(formatWorkdayStart(workdays[0].startedAt, 'Europe/London')?.label).toContain('1:00 PM');
		expect(formatWorkdayStart(null, 'UTC')).toBeNull();
		expect(formatWorkdayStart('not-a-date', 'UTC')).toBeNull();
	});
});
