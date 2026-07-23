import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "../../../styles/charts.css";
import { CustomTimeRange, MetricKey, MetricPoint, PollIntervalMs, PollingState, TimeRangeValue, clamp, formatMetricValue, formatTime, getThresholdLabel, isThresholdBreached, metricColors, metricKeys, metricLabels, metricThresholds, pollIntervalOptions, timeRangeOptions, useHasMounted } from './metric-key.tsx';
import { StatItem } from './use-chart-controls.tsx';

export function MonitoringChartFrame({
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
  onToggleMetric,
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
  const lastUpdatedLabel = pollingState.lastUpdatedAt ? formatTime(pollingState.lastUpdatedAt) : "Waiting";
  const latestTimestamp = latestPoint?.timestamp ?? Date.now();
  const xAxisPaddingMs = pollingState.pollIntervalMs ?? 1_000;
  const customModeEnabled = pollIntervalMs === null;
  const isCustomRange = timeRangeMs === "custom";
  const visiblePoints =
    isCustomRange && customTimeRange
      ? points.filter((point) => point.timestamp >= customTimeRange.start && point.timestamp <= customTimeRange.end)
      : timeRangeMs === null || isCustomRange
        ? points
        : points.filter((point) => point.timestamp >= latestTimestamp - timeRangeMs);
  const latestVisiblePoint = visiblePoints.at(-1) ?? null;
  const hasPercentMetric = visibleMetrics.includes("cpu") || visibleMetrics.includes("memory");
  const hasLatencyMetric = visibleMetrics.includes("latency");
  const visibleMetricSet = new Set(visibleMetrics);
  const warningState = metricKeys.reduce<Record<MetricKey, boolean>>(
    (state, metric) => ({
      ...state,
      [metric]: latestVisiblePoint ? isThresholdBreached(metric, latestVisiblePoint[metric]) : false,
    }),
    {
      cpu: false,
      memory: false,
      latency: false,
    },
  );
  const firstTimestamp = points[0]?.timestamp ?? latestTimestamp;
  const lastTimestamp = points.at(-1)?.timestamp ?? latestTimestamp;
  const xAxisDomain: [number, number] =
    isCustomRange && customTimeRange
      ? [customTimeRange.start, customTimeRange.end]
      : timeRangeMs === null || isCustomRange
        ? [firstTimestamp - xAxisPaddingMs, lastTimestamp + xAxisPaddingMs]
        : [latestTimestamp - timeRangeMs, latestTimestamp + xAxisPaddingMs];
  const selectionArea =
    selectionStart !== null && selectionEnd !== null
      ? {
          start: Math.min(selectionStart, selectionEnd),
          end: Math.max(selectionStart, selectionEnd),
        }
      : null;
  const selectionOverlay =
    selectionArea && xAxisDomain[1] > xAxisDomain[0]
      ? {
          left: `${clamp(((selectionArea.start - xAxisDomain[0]) / (xAxisDomain[1] - xAxisDomain[0])) * 100, 0, 100)}%`,
          width: `${clamp(((selectionArea.end - selectionArea.start) / (xAxisDomain[1] - xAxisDomain[0])) * 100, 0, 100)}%`,
        }
      : null;
  const normalizeCustomRange = (start: number, end: number): CustomTimeRange => {
    const normalizedStart = Math.min(start, end);
    const normalizedEnd = Math.max(start, end);

    if (normalizedEnd === normalizedStart) {
      return {
        start: normalizedStart,
        end: normalizedStart + xAxisPaddingMs,
      };
    }

    return {
      start: normalizedStart,
      end: normalizedEnd,
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

  const startCustomPointerSelection = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    startCustomSelectionAt(event.clientX);
  };

  const updateCustomPointerSelection = (event: PointerEvent<HTMLDivElement>) => {
    updateCustomSelectionAt(event.clientX);
  };

  const startCustomMouseSelection = (event: MouseEvent<HTMLDivElement>) => {
    startCustomSelectionAt(event.clientX);
  };

  const updateCustomMouseSelection = (event: MouseEvent<HTMLDivElement>) => {
    updateCustomSelectionAt(event.clientX);
  };

  const finishCustomSelection = () => {
    if (!customModeEnabled || !isCustomRange || selectionStart === null || selectionEnd === null) {
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
          <StatItem label="Status" tone={pollingState.status === "error" ? "warn" : "ok"} value={pollingState.status} />
          <StatItem label="Last update" value={lastUpdatedLabel} />
          <StatItem label="Samples" value={`${pollingState.sampleCount}`} />
          <StatItem label="CPU" value={latestPoint ? formatMetricValue("cpu", latestPoint.cpu) : "--"} />
          <StatItem label="Memory" value={latestPoint ? formatMetricValue("memory", latestPoint.memory) : "--"} />
          <StatItem label="Latency" value={latestPoint ? formatMetricValue("latency", latestPoint.latency) : "--"} />
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
                aria-pressed={visibleMetrics.length === 1 && visibleMetrics[0] === metric}
                className={visibleMetrics.length === 1 && visibleMetrics[0] === metric ? "active" : ""}
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

      <div className={isCustomRange ? "chart-region selecting" : "chart-region"} ref={chartRegionRef}>
        {points.length === 0 || visibleMetrics.length === 0 ? (
          <div className="chart-empty-state">
            {points.length === 0 ? "Waiting for first monitoring sample" : "Select at least one data series"}
          </div>
        ) : null}
        {hasMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visiblePoints} margin={{ top: 18, right: 20, bottom: 8, left: 0 }}>
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
                <YAxis domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} tickLine={false} width={48} yAxisId="percent" />
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
                  metricLabels[name as MetricKey] ?? String(name),
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
                  width: selectionOverlay.width,
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
              <input checked={visibleMetricSet.has(metric)} onChange={() => onToggleMetric(metric)} type="checkbox" />
              <span className="series-swatch" style={{ backgroundColor: metricColors[metric] }} />
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
                  ? `${formatTime(customTimeRange.start)} - ${formatTime(customTimeRange.end)}`
                  : "Drag across the chart to zoom"
                : "Custom zoom requires Never polling"}
            </span>
            {customTimeRange ? (
              <button className="text-button" onClick={() => onSetCustomTimeRange(null)} type="button">
                Reset zoom
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
