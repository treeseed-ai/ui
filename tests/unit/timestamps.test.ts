import { beforeEach, describe, expect, it } from 'vitest';
import {
	formatTimestamp,
	formatTimestampElements,
	isValidTimeZone,
	normalizeTimeZone,
	supportedTimeZones,
	timeZoneLabel,
} from '../../src/timestamps.ts';

describe('account timestamp presentation', () => {
	beforeEach(() => {
		document.documentElement.dataset.tsTimeZone = 'America/New_York';
		document.body.innerHTML = '';
	});

	it('validates IANA zones and supplies stable selector labels', () => {
		expect(isValidTimeZone('America/New_York')).toBe(true);
		expect(isValidTimeZone('Not/A_Time_Zone')).toBe(false);
		expect(normalizeTimeZone('Not/A_Time_Zone')).toBe('UTC');
		expect(supportedTimeZones()).toContain('UTC');
		expect(timeZoneLabel('America/New_York')).toBe('America / New York');
	});

	it('formats the same instant in the selected account time zone', () => {
		const instant = '2026-01-15T15:30:00.000Z';
		expect(formatTimestamp(instant, { timeZone: 'UTC' })).toContain('3:30 PM');
		expect(formatTimestamp(instant, { timeZone: 'America/New_York' })).toContain('10:30 AM');
		expect(formatTimestamp(instant, { timeZone: 'America/New_York' })).toContain('EST');
	});

	it('upgrades semantic time elements after shell and inline content changes', () => {
		document.body.innerHTML = '<time datetime="2026-01-15T15:30:00.000Z" data-ts-timestamp data-ts-timestamp-style="date-time"></time>';
		formatTimestampElements(document);
		const time = document.querySelector('time');
		expect(time?.textContent).toContain('10:30 AM');
		expect(time?.textContent).not.toContain('2026-01-15T15:30:00.000Z');
		expect(time?.title).toContain('UTC');
	});
});
