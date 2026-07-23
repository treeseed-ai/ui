import { useEffect, useMemo, useRef, useState } from "react";
import "../../../styles/charts.css";


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
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
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
  const [points, setPoints] = useState<MetricPoint[]>([]);
  const [status, setStatus] = useState<PollStatus>("idle");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const latestPointRef = useRef<MetricPoint | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    if (pollIntervalMs === null) {
      setStatus("idle");
      setError(null);

      return () => {
        cancelled = true;
      };
    }

    const poll = async () => {
      setStatus("polling");

      try {
        const nextPoint = await fetchMonitoringSnapshot(snapshotEndpoint, latestPointRef.current);

        if (cancelled) {
          return;
        }

        latestPointRef.current = nextPoint;
        setPoints((current) => [...current, nextPoint].slice(-maxPoints));
        setLastUpdatedAt(nextPoint.timestamp);
        setPollCount((current) => current + 1);
        setError(null);
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setError(caughtError instanceof Error ? caughtError.message : "Unable to fetch monitoring snapshot");
      }
    };

    void poll();
    const intervalId = window.setInterval(() => {
      void poll();
    }, pollIntervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [maxPoints, pollIntervalMs, snapshotEndpoint]);

  const latestPoint = points.at(-1) ?? null;

  const pollingState = useMemo<PollingState>(
    () => ({
      status,
      pollIntervalMs,
      maxPoints,
      snapshotEndpoint,
      sampleCount: points.length,
      pollCount,
      lastUpdatedAt,
      error,
    }),
    [error, lastUpdatedAt, maxPoints, points.length, pollCount, pollIntervalMs, snapshotEndpoint, status],
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
