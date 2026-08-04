import { useEffect, useMemo, useRef, useState } from "react";
import "../../../styles/charts.css";
import { useRealtimeResource } from "../../operations-monitor/use-realtime-resource";


export type MetricKey = "cpu" | "memory" | "latency";

export type MetricPoint = {
  timestamp: number;
  cpu: number;
  memory: number;
  latency: number;
};

export type PollStatus = "idle" | "polling" | "error";

export type TimeRangeValue = 30_000 | 60_000 | 120_000 | "custom" | null;

export type PollIntervalMs = 1_000 | 2_000 | 5_000 | 10_000 | null;

export type CustomTimeRange = {
  start: number;
  end: number;
};

export type ThresholdDirection = "above" | "below";

export type MetricThreshold = {
  value: number;
  direction: ThresholdDirection;
};

export type MonitoringChartProps = {
  title?: string;
  pollIntervalMs?: PollIntervalMs;
  maxPoints?: number;
  snapshotEndpoint?: string;
};

export type PollingState = {
  status: PollStatus;
  pollIntervalMs: PollIntervalMs;
  maxPoints: number;
  snapshotEndpoint: string;
  sampleCount: number;
  pollCount: number;
  lastUpdatedAt: number | null;
  error: string | null;
};

export const metricLabels: Record<MetricKey, string> = {
  cpu: "CPU",
  memory: "Memory",
  latency: "Latency",
};

export const metricColors: Record<MetricKey, string> = {
  cpu: "var(--ts-chart-cpu)",
  memory: "var(--ts-chart-memory)",
  latency: "var(--ts-chart-latency)",
};

export const metricThresholds: Record<MetricKey, MetricThreshold> = {
  cpu: { value: 80, direction: "above" },
  memory: { value: 85, direction: "above" },
  latency: { value: 200, direction: "above" },
};

export const metricKeys: MetricKey[] = ["cpu", "memory", "latency"];

export const timeRangeOptions: Array<{ label: string; value: TimeRangeValue }> = [
  { label: "30s", value: 30_000 },
  { label: "1m", value: 60_000 },
  { label: "2m", value: 120_000 },
  { label: "Custom", value: "custom" },
  { label: "All", value: null },
];

export const pollIntervalOptions: Array<{ label: string; value: PollIntervalMs }> = [
  { label: "1s", value: 1_000 },
  { label: "2s", value: 2_000 },
  { label: "5s", value: 5_000 },
  { label: "10s", value: 10_000 },
  { label: "Never", value: null },
];

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const defaultSnapshotEndpoint = "/api/monitoring/snapshot";

export function isMetricPoint(value: unknown): value is MetricPoint {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as MetricPoint).timestamp === "number" &&
    typeof (value as MetricPoint).cpu === "number" &&
    typeof (value as MetricPoint).memory === "number" &&
    typeof (value as MetricPoint).latency === "number"
  );
}

export async function fetchMonitoringSnapshot(snapshotEndpoint: string, previous?: MetricPoint): Promise<MetricPoint> {
  const response = await fetch(snapshotEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ previous }),
  });

  if (!response.ok) {
    throw new Error(`Monitoring snapshot request failed with ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const snapshot =
    typeof payload === "object" && payload !== null && "snapshot" in payload ? (payload as { snapshot?: unknown }).snapshot : payload;

  if (!isMetricPoint(snapshot)) {
    throw new Error("Monitoring snapshot response was invalid");
  }

  return snapshot;
}

export function formatTime(timestamp: number) {
  return formatTimestamp(timestamp, {
    timeZone: typeof document === "undefined" ? "UTC" : documentTimeZone(),
    style: "time",
  });
}

export function formatMetricValue(metric: MetricKey, value: number) {
  return metric === "latency" ? `${Math.round(value)} ms` : `${value.toFixed(1)}%`;
}

export function isThresholdBreached(metric: MetricKey, value: number) {
  const threshold = metricThresholds[metric];

  return threshold.direction === "above" ? value >= threshold.value : value <= threshold.value;
}

export function getThresholdLabel(metric: MetricKey) {
  const threshold = metricThresholds[metric];
  const operator = threshold.direction === "above" ? ">=" : "<=";

  return `${operator} ${formatMetricValue(metric, threshold.value)}`;
}

export function DebugPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="debug-panel" aria-label={title}>
      <h2>{title}</h2>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}

export function useMonitoringSeries({
  maxPoints,
  pollIntervalMs,
  snapshotEndpoint,
}: {
  maxPoints: number;
  pollIntervalMs: PollIntervalMs;
  snapshotEndpoint: string;
}) {
  const latestPointRef = useRef<MetricPoint | undefined>(undefined);
	const endpoint = useMemo(() => () => snapshotEndpoint, [snapshotEndpoint]);
	const request = useMemo(() => async (url: string, signal: AbortSignal) => await fetch(url, {
		method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ previous: latestPointRef.current }), signal,
	}), []);
	const parse = useMemo(() => (payload: unknown) => {
		const value = typeof payload === 'object' && payload !== null && 'snapshot' in payload ? (payload as { snapshot?: unknown }).snapshot : payload;
		if (!isMetricPoint(value)) throw new Error('Monitoring snapshot response was invalid');
		latestPointRef.current = value; return { data: [value] };
	}, []);
	const merge = useMemo(() => (current: MetricPoint[], next: MetricPoint[]) => [...current, ...next].slice(-maxPoints), [maxPoints]);
	const live = useRealtimeResource({ initialData: [] as MetricPoint[], endpoint, intervalMs: pollIntervalMs ?? 1_000, enabled: pollIntervalMs !== null, parse, merge, request });
	const points = live.data; const latestPoint = points.at(-1) ?? null;

  const pollingState = useMemo<PollingState>(
    () => ({
		status: live.status === 'degraded' || live.status === 'offline' ? 'error' : live.status === 'snapshot' ? 'idle' : 'polling',
      pollIntervalMs,
      maxPoints,
      snapshotEndpoint,
      sampleCount: points.length,
		pollCount: live.refreshCount,
		lastUpdatedAt: live.lastUpdatedAt,
		error: live.error,
    }),
		[live.error, live.lastUpdatedAt, live.refreshCount, live.status, maxPoints, points.length, pollIntervalMs, snapshotEndpoint],
  );

  return {
    points,
    latestPoint,
    pollingState,
  };
}

export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
import { documentTimeZone, formatTimestamp } from "../../../timestamps";
