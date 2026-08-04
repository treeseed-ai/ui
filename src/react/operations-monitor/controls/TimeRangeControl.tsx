export type MonitorTimeRange = '15m' | '1h' | 'workday';

const labels: Array<{ value: MonitorTimeRange; label: string }> = [
	{ value: '15m', label: '15 min' },
	{ value: '1h', label: '1 hour' },
	{ value: 'workday', label: 'Workday' },
];

export function rangeStart(range: MonitorTimeRange, start: number, end: number) {
	if (range === '15m') return Math.max(start, end - 15 * 60_000);
	if (range === '1h') return Math.max(start, end - 60 * 60_000);
	return start;
}

export function TimeRangeControl({ value, onChange, label = 'Time range' }: { value: MonitorTimeRange; onChange: (value: MonitorTimeRange) => void; label?: string }) {
	return <div className="ts-monitor-range" role="group" aria-label={label}>{labels.map((option) => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}
