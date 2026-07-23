import "../../../styles/charts.css";
import { DebugPanel, MonitoringChartProps, defaultSnapshotEndpoint, useMonitoringSeries } from './metric-key.tsx';
import { buildChartConfiguration, useChartControls } from './use-chart-controls.tsx';
import { MonitoringChartFrame } from './monitoring-chart-frame.tsx';

export function MonitoringChart({
  title = "Cluster Health",
  pollIntervalMs = 2_000,
  maxPoints = 180,
  snapshotEndpoint = defaultSnapshotEndpoint,
}: MonitoringChartProps) {
  const controls = useChartControls(pollIntervalMs);
  const { points, latestPoint, pollingState } = useMonitoringSeries({
    maxPoints,
    pollIntervalMs: controls.pollIntervalMs,
    snapshotEndpoint,
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
    snapshotEndpoint,
  });
  const latestTimestamp = latestPoint?.timestamp ?? Date.now();
  const visiblePoints = (() => {
    if (controls.timeRangeMs === "custom" && controls.customTimeRange) {
      return points.filter(
        (point) => point.timestamp >= controls.customTimeRange!.start && point.timestamp <= controls.customTimeRange!.end,
      );
    }
    if (typeof controls.timeRangeMs !== "number") {
      return points;
    }
    const rangeMs = controls.timeRangeMs;
    return points.filter((point) => point.timestamp >= latestTimestamp - rangeMs);
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
    latestVisiblePoint,
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
              visibleMetrics: controls.visibleMetrics,
            },
          }}
        />
        <DebugPanel title="Series Buffer" value={points} />
        <DebugPanel title="Chart Configuration" value={chartConfiguration} />
      </div>
    </div>
  );
}
