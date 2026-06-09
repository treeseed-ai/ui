import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent
} from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "../../styles/charts.css";

type MetricKey = "cpu" | "memory" | "latency";

type MetricPoint = {
  timestamp: number;
  cpu: number;
  memory: number;
  latency: number;
};

type PollStatus = "idle" | "polling" | "error";

type TimeRangeValue = 30_000 | 60_000 | 120_000 | "custom" | null;
type PollIntervalMs = 1_000 | 2_000 | 5_000 | 10_000 | null;
type CustomTimeRange = {
  start: number;
  end: number;
};

type ThresholdDirection = "above" | "below";

type MetricThreshold = {
  value: number;
  direction: ThresholdDirection;
};

export type MonitoringChartProps = {
  title?: string;
  pollIntervalMs?: PollIntervalMs;
  maxPoints?: number;
  snapshotEndpoint?: string;
};

type PollingState = {
  status: PollStatus;
  pollIntervalMs: PollIntervalMs;
  maxPoints: number;
  snapshotEndpoint: string;
  sampleCount: number;
  pollCount: number;
  lastUpdatedAt: number | null;
  error: string | null;
};

const metricLabels: Record<MetricKey, string> = {
  cpu: "CPU",
  memory: "Memory",
  latency: "Latency"
};

const metricColors: Record<MetricKey, string> = {
  cpu: "var(--ts-chart-cpu)",
  memory: "var(--ts-chart-memory)",
  latency: "var(--ts-chart-latency)"
};

const metricThresholds: Record<MetricKey, MetricThreshold> = {
  cpu: { value: 80, direction: "above" },
  memory: { value: 85, direction: "above" },
  latency: { value: 200, direction: "above" }
};

const metricKeys: MetricKey[] = ["cpu", "memory", "latency"];

const timeRangeOptions: Array<{ label: string; value: TimeRangeValue }> = [
  { label: "30s", value: 30_000 },
  { label: "1m", value: 60_000 },
  { label: "2m", value: 120_000 },
  { label: "Custom", value: "custom" },
  { label: "All", value: null }
];

const pollIntervalOptions: Array<{ label: string; value: PollIntervalMs }> = [
  { label: "1s", value: 1_000 },
  { label: "2s", value: 2_000 },
  { label: "5s", value: 5_000 },
  { label: "10s", value: 10_000 },
  { label: "Never", value: null }
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const defaultSnapshotEndpoint = "/api/monitoring/snapshot";

function isMetricPoint(value: unknown): value is MetricPoint {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as MetricPoint).timestamp === "number" &&
    typeof (value as MetricPoint).cpu === "number" &&
    typeof (value as MetricPoint).memory === "number" &&
    typeof (value as MetricPoint).latency === "number"
  );
}

async function fetchMonitoringSnapshot(
  snapshotEndpoint: string,
  previous?: MetricPoint
): Promise<MetricPoint> {
  const response = await fetch(snapshotEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ previous })
  });

  if (!response.ok) {
    throw new Error(`Monitoring snapshot request failed with ${response.status}`);
  }

  const payload = await response.json() as unknown;
  const snapshot =
    typeof payload === "object" && payload !== null && "snapshot" in payload
      ? (payload as { snapshot?: unknown }).snapshot
      : payload;

  if (!isMetricPoint(snapshot)) {
    throw new Error("Monitoring snapshot response was invalid");
  }

  return snapshot;
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(timestamp);
}

function formatMetricValue(metric: MetricKey, value: number) {
  return metric === "latency" ? `${Math.round(value)} ms` : `${value.toFixed(1)}%`;
}

function isThresholdBreached(metric: MetricKey, value: number) {
  const threshold = metricThresholds[metric];

  return threshold.direction === "above"
    ? value >= threshold.value
    : value <= threshold.value;
}

function getThresholdLabel(metric: MetricKey) {
  const threshold = metricThresholds[metric];
  const operator = threshold.direction === "above" ? ">=" : "<=";

  return `${operator} ${formatMetricValue(metric, threshold.value)}`;
}

function DebugPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="debug-panel" aria-label={title}>
      <h2>{title}</h2>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}

function useMonitoringSeries({
  maxPoints,
  pollIntervalMs,
  snapshotEndpoint
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
        const nextPoint = await fetchMonitoringSnapshot(
          snapshotEndpoint,
          latestPointRef.current
        );

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
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to fetch monitoring snapshot"
        );
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
      error
    }),
    [
      error,
      lastUpdatedAt,
      maxPoints,
      points.length,
      pollCount,
      pollIntervalMs,
      snapshotEndpoint,
      status
    ]
  );

  return {
    points,
    latestPoint,
    pollingState
  };
}

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

function useChartControls(initialPollIntervalMs: PollIntervalMs = 2_000) {
  const [timeRangeMs, setTimeRangeMs] = useState<TimeRangeValue>(60_000);
  const [pollIntervalMs, setPollIntervalMs] = useState<PollIntervalMs>(
    initialPollIntervalMs
  );
  const [customTimeRange, setCustomTimeRange] =
    useState<CustomTimeRange | null>(null);
  const [visibleMetrics, setVisibleMetrics] = useState<MetricKey[]>(metricKeys);

  const updateTimeRange = (nextTimeRange: TimeRangeValue) => {
    setTimeRangeMs(nextTimeRange);

    if (nextTimeRange !== "custom") {
      setCustomTimeRange(null);
    }
  };

  const updatePollInterval = (nextPollIntervalMs: PollIntervalMs) => {
    setPollIntervalMs(nextPollIntervalMs);

    if (nextPollIntervalMs !== null && timeRangeMs === "custom") {
      setTimeRangeMs(60_000);
      setCustomTimeRange(null);
    }
  };

  const toggleMetric = (metric: MetricKey) => {
    setVisibleMetrics((current) => {
      if (current.includes(metric)) {
        return current.filter((item) => item !== metric);
      }

      return [...current, metricKeys.find((item) => item === metric)].filter(
        Boolean
      ) as MetricKey[];
    });
  };

  const setSingleMetric = (metric: MetricKey) => {
    setVisibleMetrics([metric]);
  };

  const showAllMetrics = () => {
    setVisibleMetrics(metricKeys);
  };

  return {
    timeRangeMs,
    pollIntervalMs,
    customTimeRange,
    visibleMetrics,
    setTimeRangeMs: updateTimeRange,
    setPollIntervalMs: updatePollInterval,
    setCustomTimeRange,
    setSingleMetric,
    showAllMetrics,
    toggleMetric
  };
}

function StatItem({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "neutral";
}) {
  return (
    <div className={`stat-item ${tone ?? "neutral"}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function buildChartConfiguration({
  title,
  maxPoints,
  points,
  visiblePoints,
  timeRangeMs,
  pollIntervalMs,
  customTimeRange,
  visibleMetrics,
  latestVisiblePoint
}: {
  title: string;
  maxPoints: number;
  points: MetricPoint[];
  visiblePoints: MetricPoint[];
  timeRangeMs: TimeRangeValue;
  pollIntervalMs: PollIntervalMs;
  customTimeRange: CustomTimeRange | null;
  visibleMetrics: MetricKey[];
  latestVisiblePoint: MetricPoint | null;
}) {
  return {
    component: {
      title,
      renderer: "recharts",
      maxPoints,
      retainedSamples: points.length,
      displayedSamples: visiblePoints.length
    },
    controls: {
      timeRange: timeRangeMs,
      pollIntervalMs,
      customTimeRange,
      visibleMetrics
    },
    options: {
      timeRanges: timeRangeOptions,
      pollIntervals: pollIntervalOptions,
      metrics: metricKeys.map((metric) => ({
        key: metric,
        label: metricLabels[metric],
        color: metricColors[metric],
        threshold: {
          ...metricThresholds[metric],
          label: getThresholdLabel(metric)
        }
      }))
    },
    thresholds: metricKeys.reduce<
      Record<
        MetricKey,
        {
          breached: boolean;
          latestValue: number | null;
          threshold: MetricThreshold;
        }
      >
    >(
      (state, metric) => ({
        ...state,
        [metric]: {
          breached: latestVisiblePoint
            ? isThresholdBreached(metric, latestVisiblePoint[metric])
            : false,
          latestValue: latestVisiblePoint ? latestVisiblePoint[metric] : null,
          threshold: metricThresholds[metric]
        }
      }),
      {
        cpu: {
          breached: false,
          latestValue: null,
          threshold: metricThresholds.cpu
        },
        memory: {
          breached: false,
          latestValue: null,
          threshold: metricThresholds.memory
        },
        latency: {
          breached: false,
          latestValue: null,
          threshold: metricThresholds.latency
        }
      }
    )
  };
}

function MonitoringChartFrame({
  title,
  points,
  latestPoint,
  pollingState,
  timeRangeMs,
  pollIntervalMs,
  customTimeRange,
  visibleMetrics,
  onSetTimeRange,
  onSetPollInterval,
  onSetCustomTimeRange,
  onSetSingleMetric,
  onShowAllMetrics,
  onToggleMetric
}: {
  title: string;
  points: MetricPoint[];
  latestPoint: MetricPoint | null;
  pollingState: PollingState;
  timeRangeMs: TimeRangeValue;
  pollIntervalMs: PollIntervalMs;
  customTimeRange: CustomTimeRange | null;
  visibleMetrics: MetricKey[];
  onSetTimeRange: (timeRangeMs: TimeRangeValue) => void;
  onSetPollInterval: (pollIntervalMs: PollIntervalMs) => void;
  onSetCustomTimeRange: (customTimeRange: CustomTimeRange | null) => void;
  onSetSingleMetric: (metric: MetricKey) => void;
  onShowAllMetrics: () => void;
  onToggleMetric: (metric: MetricKey) => void;
}) {
  const hasMounted = useHasMounted();
  const chartRegionRef = useRef<HTMLDivElement | null>(null);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);
  const lastUpdatedLabel = pollingState.lastUpdatedAt
    ? formatTime(pollingState.lastUpdatedAt)
    : "Waiting";
  const latestTimestamp = latestPoint?.timestamp ?? Date.now();
  const xAxisPaddingMs = pollingState.pollIntervalMs ?? 1_000;
  const customModeEnabled = pollIntervalMs === null;
  const isCustomRange = timeRangeMs === "custom";
  const visiblePoints =
    isCustomRange && customTimeRange
      ? points.filter(
          (point) =>
            point.timestamp >= customTimeRange.start &&
            point.timestamp <= customTimeRange.end
        )
      : timeRangeMs === null || isCustomRange
      ? points
      : points.filter((point) => point.timestamp >= latestTimestamp - timeRangeMs);
  const latestVisiblePoint = visiblePoints.at(-1) ?? null;
  const hasPercentMetric =
    visibleMetrics.includes("cpu") || visibleMetrics.includes("memory");
  const hasLatencyMetric = visibleMetrics.includes("latency");
  const visibleMetricSet = new Set(visibleMetrics);
  const warningState = metricKeys.reduce<Record<MetricKey, boolean>>(
    (state, metric) => ({
      ...state,
      [metric]: latestVisiblePoint
        ? isThresholdBreached(metric, latestVisiblePoint[metric])
        : false
    }),
    {
      cpu: false,
      memory: false,
      latency: false
    }
  );
  const firstTimestamp = points[0]?.timestamp ?? latestTimestamp;
  const lastTimestamp = points.at(-1)?.timestamp ?? latestTimestamp;
  const xAxisDomain: [number, number] =
    isCustomRange && customTimeRange
      ? [customTimeRange.start, customTimeRange.end]
      : timeRangeMs === null || isCustomRange
      ? [firstTimestamp - xAxisPaddingMs, lastTimestamp + xAxisPaddingMs]
      : [
          latestTimestamp - timeRangeMs,
          latestTimestamp + xAxisPaddingMs
        ];
  const selectionArea =
    selectionStart !== null && selectionEnd !== null
      ? {
          start: Math.min(selectionStart, selectionEnd),
          end: Math.max(selectionStart, selectionEnd)
        }
      : null;
  const selectionOverlay =
    selectionArea && xAxisDomain[1] > xAxisDomain[0]
      ? {
          left: `${clamp(
            ((selectionArea.start - xAxisDomain[0]) /
              (xAxisDomain[1] - xAxisDomain[0])) *
              100,
            0,
            100
          )}%`,
          width: `${clamp(
            ((selectionArea.end - selectionArea.start) /
              (xAxisDomain[1] - xAxisDomain[0])) *
              100,
            0,
            100
          )}%`
        }
      : null;
  const normalizeCustomRange = (start: number, end: number): CustomTimeRange => {
    const normalizedStart = Math.min(start, end);
    const normalizedEnd = Math.max(start, end);

    if (normalizedEnd === normalizedStart) {
      return {
        start: normalizedStart,
        end: normalizedStart + xAxisPaddingMs
      };
    }

    return {
      start: normalizedStart,
      end: normalizedEnd
    };
  };
  const setCustomRangeStart = (value: string) => {
    if (!value) {
      return;
    }

    const start = Number(value);
    const end = customTimeRange?.end ?? lastTimestamp;
    onSetCustomTimeRange(normalizeCustomRange(start, end));
  };
  const setCustomRangeEnd = (value: string) => {
    if (!value) {
      return;
    }

    const start = customTimeRange?.start ?? firstTimestamp;
    const end = Number(value);
    onSetCustomTimeRange(normalizeCustomRange(start, end));
  };

  const getTimestampFromPointer = (clientX: number) => {
    const bounds = chartRegionRef.current?.getBoundingClientRect();

    if (!bounds || xAxisDomain[1] <= xAxisDomain[0]) {
      return null;
    }

    const ratio = clamp((clientX - bounds.left) / bounds.width, 0, 1);
    return xAxisDomain[0] + ratio * (xAxisDomain[1] - xAxisDomain[0]);
  };

  const startCustomSelectionAt = (clientX: number) => {
    if (!customModeEnabled || !isCustomRange) {
      return;
    }

    const activeTimestamp = getTimestampFromPointer(clientX);

    if (activeTimestamp === null) {
      return;
    }

    setSelectionStart(activeTimestamp);
    setSelectionEnd(activeTimestamp);
  };

  const updateCustomSelectionAt = (clientX: number) => {
    if (!customModeEnabled || !isCustomRange || selectionStart === null) {
      return;
    }

    const activeTimestamp = getTimestampFromPointer(clientX);

    if (activeTimestamp !== null) {
      setSelectionEnd(activeTimestamp);
    }
  };

  const startCustomPointerSelection = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    startCustomSelectionAt(event.clientX);
  };

  const updateCustomPointerSelection = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    updateCustomSelectionAt(event.clientX);
  };

  const startCustomMouseSelection = (event: MouseEvent<HTMLDivElement>) => {
    startCustomSelectionAt(event.clientX);
  };

  const updateCustomMouseSelection = (event: MouseEvent<HTMLDivElement>) => {
    updateCustomSelectionAt(event.clientX);
  };

  const finishCustomSelection = () => {
    if (
      !customModeEnabled ||
      !isCustomRange ||
      selectionStart === null ||
      selectionEnd === null
    ) {
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    const start = Math.min(selectionStart, selectionEnd);
    const end = Math.max(selectionStart, selectionEnd);

    if (end - start > 500) {
      onSetCustomTimeRange({ start, end });
    }

    setSelectionStart(null);
    setSelectionEnd(null);
  };

  return (
    <section className="chart-surface" aria-label={`${title} monitoring chart`} data-testid="monitoring-chart">
      <div className="chart-header">
        <div>
          <p className="eyebrow">Real-time monitoring</p>
          <h2>{title}</h2>
        </div>
        <div className="chart-stats" aria-label="Current monitoring statistics">
          <StatItem
            label="Status"
            tone={pollingState.status === "error" ? "warn" : "ok"}
            value={pollingState.status}
          />
          <StatItem label="Last update" value={lastUpdatedLabel} />
          <StatItem label="Samples" value={`${pollingState.sampleCount}`} />
          <StatItem
            label="CPU"
            value={latestPoint ? formatMetricValue("cpu", latestPoint.cpu) : "--"}
          />
          <StatItem
            label="Memory"
            value={
              latestPoint ? formatMetricValue("memory", latestPoint.memory) : "--"
            }
          />
          <StatItem
            label="Latency"
            value={
              latestPoint ? formatMetricValue("latency", latestPoint.latency) : "--"
            }
          />
        </div>
      </div>

      <div className="chart-controls" aria-label="Chart display controls">
        <div className="control-group">
          <span className="control-label">Time range</span>
          <div className="button-group" role="group" aria-label="Time range">
            {timeRangeOptions.map((option) => (
              <button
                aria-pressed={timeRangeMs === option.value}
                className={timeRangeMs === option.value ? "active" : ""}
                disabled={option.value === "custom" && !customModeEnabled}
                key={option.label}
                onClick={() => onSetTimeRange(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">Poll interval</span>
          <div className="button-group" role="group" aria-label="Poll interval">
            {pollIntervalOptions.map((option) => (
              <button
                aria-pressed={pollIntervalMs === option.value}
                className={pollIntervalMs === option.value ? "active" : ""}
                key={option.label}
                onClick={() => onSetPollInterval(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">Series</span>
          <div className="button-group" role="group" aria-label="Series presets">
            <button
              aria-pressed={visibleMetrics.length === metricKeys.length}
              className={visibleMetrics.length === metricKeys.length ? "active" : ""}
              onClick={onShowAllMetrics}
              type="button"
            >
              All
            </button>
            {metricKeys.map((metric) => (
              <button
                aria-pressed={
                  visibleMetrics.length === 1 && visibleMetrics[0] === metric
                }
                className={
                  visibleMetrics.length === 1 && visibleMetrics[0] === metric
                    ? "active"
                    : ""
                }
                key={metric}
                onClick={() => onSetSingleMetric(metric)}
                type="button"
              >
                {metricLabels[metric]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={isCustomRange ? "chart-region selecting" : "chart-region"}
        ref={chartRegionRef}
      >
        {points.length === 0 || visibleMetrics.length === 0 ? (
          <div className="chart-empty-state">
            {points.length === 0
              ? "Waiting for first monitoring sample"
              : "Select at least one data series"}
          </div>
        ) : null}
        {hasMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visiblePoints}
              margin={{ top: 18, right: 20, bottom: 8, left: 0 }}
            >
              <CartesianGrid stroke="var(--ts-color-grid)" strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                domain={xAxisDomain}
                minTickGap={28}
                scale="time"
                tickFormatter={formatTime}
                tickLine={false}
                type="number"
              />
              {hasPercentMetric ? (
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value: number) => `${value}%`}
                  tickLine={false}
                  width={48}
                  yAxisId="percent"
                />
              ) : null}
              {hasLatencyMetric ? (
                <YAxis
                  domain={[0, 320]}
                  orientation="right"
                  tickFormatter={(value: number) => `${value}ms`}
                  tickLine={false}
                  width={56}
                  yAxisId="latency"
                />
              ) : null}
	              <Tooltip
	                labelFormatter={(label) => formatTime(Number(label))}
	                formatter={(value, name) => [
	                  formatMetricValue(name as MetricKey, Number(value)),
	                  metricLabels[name as MetricKey] ?? String(name)
	                ]}
	              />
              {selectionArea ? (
                <ReferenceArea
                  fill="var(--ts-chart-selection)"
                  fillOpacity={0.12}
                  stroke="var(--ts-chart-selection)"
                  strokeOpacity={0.7}
                  x1={selectionArea.start}
                  x2={selectionArea.end}
                  yAxisId={hasPercentMetric ? "percent" : "latency"}
                />
              ) : null}
              {visibleMetricSet.has("cpu") ? (
                <>
                  <ReferenceLine
                    ifOverflow="extendDomain"
                    label={`CPU ${getThresholdLabel("cpu")}`}
                    stroke={metricColors.cpu}
                    strokeDasharray="4 4"
                    y={metricThresholds.cpu.value}
                    yAxisId="percent"
                  />
                  <Line
                    dataKey="cpu"
                    dot={false}
                    isAnimationActive={false}
                    name="cpu"
                    stroke={metricColors.cpu}
                    strokeWidth={warningState.cpu ? 4.5 : 2.5}
                    type="monotone"
                    yAxisId="percent"
                  />
                </>
              ) : null}
              {visibleMetricSet.has("memory") ? (
                <>
                  <ReferenceLine
                    ifOverflow="extendDomain"
                    label={`Memory ${getThresholdLabel("memory")}`}
                    stroke={metricColors.memory}
                    strokeDasharray="4 4"
                    y={metricThresholds.memory.value}
                    yAxisId="percent"
                  />
                  <Line
                    dataKey="memory"
                    dot={false}
                    isAnimationActive={false}
                    name="memory"
                    stroke={metricColors.memory}
                    strokeWidth={warningState.memory ? 4.5 : 2.5}
                    type="monotone"
                    yAxisId="percent"
                  />
                </>
              ) : null}
              {visibleMetricSet.has("latency") ? (
                <>
                  <ReferenceLine
                    ifOverflow="extendDomain"
                    label={`Latency ${getThresholdLabel("latency")}`}
                    stroke={metricColors.latency}
                    strokeDasharray="4 4"
                    y={metricThresholds.latency.value}
                    yAxisId="latency"
                  />
                  <Line
                    dataKey="latency"
                    dot={false}
                    isAnimationActive={false}
                    name="latency"
                    stroke={metricColors.latency}
                    strokeWidth={warningState.latency ? 4.5 : 2.5}
                    type="monotone"
                    yAxisId="latency"
                  />
                </>
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        ) : null}
        {isCustomRange ? (
          <div
            aria-hidden="true"
            className="chart-selection-layer"
            onMouseDown={startCustomMouseSelection}
            onMouseLeave={finishCustomSelection}
            onMouseMove={updateCustomMouseSelection}
            onMouseUp={finishCustomSelection}
            onPointerDown={startCustomPointerSelection}
            onPointerLeave={finishCustomSelection}
            onPointerMove={updateCustomPointerSelection}
            onPointerUp={finishCustomSelection}
          >
            {selectionOverlay ? (
              <div
                className="chart-selection-box"
                style={{
                  left: selectionOverlay.left,
                  width: selectionOverlay.width
                }}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="chart-legend-controls" aria-label="Visible series">
        <span className="control-label">Visible series</span>
        <div className="series-toggles">
          {metricKeys.map((metric) => (
            <label className="series-toggle" key={metric}>
              <input
                checked={visibleMetricSet.has(metric)}
                onChange={() => onToggleMetric(metric)}
                type="checkbox"
              />
              <span
                className="series-swatch"
                style={{ backgroundColor: metricColors[metric] }}
              />
              {metricLabels[metric]}
            </label>
          ))}
        </div>
        {isCustomRange ? (
          <div className="custom-range-actions">
            <div className="custom-range-selectors">
              <label>
                Start
                <select
                  disabled={!customModeEnabled || points.length < 2}
                  onChange={(event) => setCustomRangeStart(event.target.value)}
                  value={customTimeRange?.start ?? ""}
                >
                  <option value="">Select start</option>
                  {points.map((point) => (
                    <option key={`start-${point.timestamp}`} value={point.timestamp}>
                      {formatTime(point.timestamp)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                End
                <select
                  disabled={!customModeEnabled || points.length < 2}
                  onChange={(event) => setCustomRangeEnd(event.target.value)}
                  value={customTimeRange?.end ?? ""}
                >
                  <option value="">Select end</option>
                  {points.map((point) => (
                    <option key={`end-${point.timestamp}`} value={point.timestamp}>
                      {formatTime(point.timestamp)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <span className="custom-range-status">
              {customModeEnabled
                ? customTimeRange
                  ? `${formatTime(customTimeRange.start)} - ${formatTime(
                      customTimeRange.end
                    )}`
                  : "Drag across the chart to zoom"
                : "Custom zoom requires Never polling"}
            </span>
            {customTimeRange ? (
              <button
                className="text-button"
                onClick={() => onSetCustomTimeRange(null)}
                type="button"
              >
                Reset zoom
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function MonitoringChart({
  title = "Cluster Health",
  pollIntervalMs = 2_000,
  maxPoints = 180,
  snapshotEndpoint = defaultSnapshotEndpoint
}: MonitoringChartProps) {
  const controls = useChartControls(pollIntervalMs);
  const { points, latestPoint, pollingState } = useMonitoringSeries({
    maxPoints,
    pollIntervalMs: controls.pollIntervalMs,
    snapshotEndpoint
  });

  return (
    <MonitoringChartFrame
      latestPoint={latestPoint}
      customTimeRange={controls.customTimeRange}
      onSetPollInterval={controls.setPollIntervalMs}
      onSetCustomTimeRange={controls.setCustomTimeRange}
      onSetSingleMetric={controls.setSingleMetric}
      onSetTimeRange={controls.setTimeRangeMs}
      onShowAllMetrics={controls.showAllMetrics}
      onToggleMetric={controls.toggleMetric}
      points={points}
      pollingState={pollingState}
      pollIntervalMs={controls.pollIntervalMs}
      timeRangeMs={controls.timeRangeMs}
      title={title}
      visibleMetrics={controls.visibleMetrics}
    />
  );
}

export default function MonitoringChartLab() {
  const title = "Cluster Health";
  const maxPoints = 180;
  const snapshotEndpoint = defaultSnapshotEndpoint;
  const controls = useChartControls();
  const { points, latestPoint, pollingState } = useMonitoringSeries({
    maxPoints,
    pollIntervalMs: controls.pollIntervalMs,
    snapshotEndpoint
  });
  const latestTimestamp = latestPoint?.timestamp ?? Date.now();
	  const visiblePoints = (() => {
	    if (controls.timeRangeMs === "custom" && controls.customTimeRange) {
	      return points.filter(
	        (point) =>
	          point.timestamp >= controls.customTimeRange!.start &&
	          point.timestamp <= controls.customTimeRange!.end
	      );
	    }
	    if (typeof controls.timeRangeMs !== "number") {
	      return points;
	    }
	    const rangeMs = controls.timeRangeMs;
	    return points.filter(
	      (point) => point.timestamp >= latestTimestamp - rangeMs
	    );
	  })();
  const latestVisiblePoint = visiblePoints.at(-1) ?? null;
  const chartConfiguration = buildChartConfiguration({
    title,
    maxPoints,
    points,
    visiblePoints,
    timeRangeMs: controls.timeRangeMs,
    pollIntervalMs: controls.pollIntervalMs,
    customTimeRange: controls.customTimeRange,
    visibleMetrics: controls.visibleMetrics,
    latestVisiblePoint
  });

  return (
    <div className="lab">
      <MonitoringChartFrame
        latestPoint={latestPoint}
        customTimeRange={controls.customTimeRange}
        onSetPollInterval={controls.setPollIntervalMs}
        onSetCustomTimeRange={controls.setCustomTimeRange}
        onSetSingleMetric={controls.setSingleMetric}
        onSetTimeRange={controls.setTimeRangeMs}
        onShowAllMetrics={controls.showAllMetrics}
        onToggleMetric={controls.toggleMetric}
        points={points}
        pollingState={pollingState}
        pollIntervalMs={controls.pollIntervalMs}
        timeRangeMs={controls.timeRangeMs}
        title={title}
        visibleMetrics={controls.visibleMetrics}
      />

      <div className="debug-grid" aria-label="Monitoring debug output">
        <DebugPanel title="Current Snapshot" value={latestPoint} />
        <DebugPanel
          title="Polling State"
          value={{
            ...pollingState,
            display: {
              timeRangeMs: controls.timeRangeMs,
              pollIntervalMs: controls.pollIntervalMs,
              customTimeRange: controls.customTimeRange,
              visibleMetrics: controls.visibleMetrics
            }
          }}
        />
        <DebugPanel title="Series Buffer" value={points} />
        <DebugPanel title="Chart Configuration" value={chartConfiguration} />
      </div>
    </div>
  );
}
