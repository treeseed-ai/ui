import { useState } from "react";
import "../../../styles/charts.css";
import { CustomTimeRange, MetricKey, MetricPoint, MetricThreshold, PollIntervalMs, TimeRangeValue, getThresholdLabel, isThresholdBreached, metricColors, metricKeys, metricLabels, metricThresholds, pollIntervalOptions, timeRangeOptions } from './metric-key.tsx';

export function useChartControls(initialPollIntervalMs: PollIntervalMs = 2_000) {
  const [timeRangeMs, setTimeRangeMs] = useState<TimeRangeValue>(60_000);
  const [pollIntervalMs, setPollIntervalMs] = useState<PollIntervalMs>(initialPollIntervalMs);
  const [customTimeRange, setCustomTimeRange] = useState<CustomTimeRange | null>(null);
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

      return [...current, metricKeys.find((item) => item === metric)].filter(Boolean) as MetricKey[];
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
    toggleMetric,
  };
}

export function StatItem({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" | "neutral" }) {
  return (
    <div className={`stat-item ${tone ?? "neutral"}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function buildChartConfiguration({
  title,
  maxPoints,
  points,
  visiblePoints,
  timeRangeMs,
  pollIntervalMs,
  customTimeRange,
  visibleMetrics,
  latestVisiblePoint,
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
      displayedSamples: visiblePoints.length,
    },
    controls: {
      timeRange: timeRangeMs,
      pollIntervalMs,
      customTimeRange,
      visibleMetrics,
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
          label: getThresholdLabel(metric),
        },
      })),
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
          breached: latestVisiblePoint ? isThresholdBreached(metric, latestVisiblePoint[metric]) : false,
          latestValue: latestVisiblePoint ? latestVisiblePoint[metric] : null,
          threshold: metricThresholds[metric],
        },
      }),
      {
        cpu: {
          breached: false,
          latestValue: null,
          threshold: metricThresholds.cpu,
        },
        memory: {
          breached: false,
          latestValue: null,
          threshold: metricThresholds.memory,
        },
        latency: {
          breached: false,
          latestValue: null,
          threshold: metricThresholds.latency,
        },
      },
    ),
  };
}
