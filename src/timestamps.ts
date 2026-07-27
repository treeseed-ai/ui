export const DEFAULT_TIME_ZONE = 'UTC';

export type TimestampStyle = 'date' | 'date-time' | 'time';

export interface TimestampFormatOptions {
	timeZone?: string | null;
	style?: TimestampStyle;
	locale?: string;
}

export function isValidTimeZone(value: unknown): value is string {
	if (typeof value !== 'string' || !value.trim()) return false;
	try {
		new Intl.DateTimeFormat('en', { timeZone: value.trim() }).format();
		return true;
	} catch {
		return false;
	}
}

export function normalizeTimeZone(value: unknown, fallback = DEFAULT_TIME_ZONE) {
	return isValidTimeZone(value) ? value.trim() : fallback;
}

export function supportedTimeZones() {
	const supportedValuesOf = (Intl as typeof Intl & {
		supportedValuesOf?: (key: 'timeZone') => string[];
	}).supportedValuesOf;
	const zones = supportedValuesOf ? supportedValuesOf('timeZone') : [];
	return [DEFAULT_TIME_ZONE, ...zones.filter((zone) => zone !== DEFAULT_TIME_ZONE)];
}

export function timeZoneLabel(value: string) {
	if (value === DEFAULT_TIME_ZONE) return 'UTC';
	return value.split('/').map((part) => part.replaceAll('_', ' ')).join(' / ');
}

export function timestampDate(value: string | number | Date) {
	const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value);
	return Number.isFinite(parsed.getTime()) ? parsed : null;
}

export function formatTimestamp(value: string | number | Date, options: TimestampFormatOptions = {}) {
	const parsed = timestampDate(value);
	if (!parsed) return String(value);
	const style = options.style ?? 'date-time';
	const common: Intl.DateTimeFormatOptions = {
		timeZone: normalizeTimeZone(options.timeZone),
	};
	const dateOptions: Intl.DateTimeFormatOptions = {
		...common,
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	};
	const timeOptions: Intl.DateTimeFormatOptions = {
		...common,
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short',
	};
	return new Intl.DateTimeFormat(options.locale, style === 'date'
		? dateOptions
		: style === 'time'
			? timeOptions
			: { ...dateOptions, ...timeOptions }).format(parsed);
}

export function documentTimeZone(root: Document = document) {
	return normalizeTimeZone(root.documentElement.dataset.tsTimeZone);
}

export function formatTimestampElements(root: ParentNode = document) {
	const ownerDocument = root instanceof Document ? root : root.ownerDocument ?? document;
	const timeZone = documentTimeZone(ownerDocument);
	root.querySelectorAll<HTMLElement>('[data-ts-timestamp]').forEach((element) => {
		const raw = element.getAttribute('datetime') ?? element.dataset.tsTimestamp;
		if (!raw) return;
		element.textContent = formatTimestamp(raw, {
			timeZone,
			style: (element.dataset.tsTimestampStyle as TimestampStyle | undefined) ?? 'date-time',
		});
		element.title = `${formatTimestamp(raw, { timeZone: DEFAULT_TIME_ZONE })} (UTC)`;
	});
}
