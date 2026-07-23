import { useMemo, useState } from "react";
import "../../../styles/charts.css";
import { Area, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ActivityType, BucketSizeMs, BucketedActivity, DebugPanel, DisplayMode, PollIntervalMs, ProjectActivityChartProps, StatItem, activityColors, activityLabels, activityTypes, bucketOptions, defaultEventsEndpoint, displayModeOptions, formatCount, formatTime, pollIntervalOptions, useProjectActivityEvents } from './activity-type.tsx';
import { aggregateEvents, useHasMounted } from './aggregate-events.tsx';

export function ProjectActivityChart({
  title = "Project Activity",
  pollIntervalMs: initialPollIntervalMs = 2_000,
  maxEvents = 720,
  eventsEndpoint = defaultEventsEndpoint
}: ProjectActivityChartProps) {
  const hasMounted = useHasMounted();
  const [bucketSizeMs, setBucketSizeMs] = useState<BucketSizeMs>(60_000);
  const [pollIntervalMs, setPollIntervalMs] =
    useState<PollIntervalMs>(initialPollIntervalMs);
  const [displayMode, setDisplayMode] =
    useState<DisplayMode>("cumulative");
  const [visibleTypes, setVisibleTypes] =
    useState<ActivityType[]>(activityTypes);
  const { events, pollingState } = useProjectActivityEvents({
    maxEvents,
    pollIntervalMs,
    eventsEndpoint
  });
  const buckets = useMemo(
    () => aggregateEvents(events, bucketSizeMs, displayMode),
    [bucketSizeMs, displayMode, events]
  );
  const latestBucket = buckets.at(-1) ?? null;
  const visibleTypeSet = new Set(visibleTypes);
  const yAxisLabel =
    displayMode === "cumulative" ? "current count" : "period net";
  const chartModeLabel =
    displayMode === "cumulative" ? "Current count" : "Period net";
  const xAxisDomain: [number, number] =
    buckets.length > 0
      ? [buckets[0].bucketStart, buckets[buckets.length - 1].bucketEnd]
      : [Date.now() - 23 * bucketSizeMs, Date.now() + bucketSizeMs];

  const toggleType = (activityType: ActivityType) => {
    setVisibleTypes((current) =>
      current.includes(activityType)
        ? current.filter((item) => item !== activityType)
        : [...current, activityType]
    );
  };

  const chartConfiguration = {
    component: {
      title,
      renderer: "recharts",
      chartType: "stacked-area",
      maxEvents,
      retainedEvents: events.length,
      bucketCount: buckets.length
    },
    controls: {
      bucketSizeMs,
      pollIntervalMs,
      displayMode,
      visibleTypes
    },
    options: {
      bucketSizes: bucketOptions,
      pollIntervals: pollIntervalOptions,
      displayModes: displayModeOptions,
      activityTypes: activityTypes.map((type) => ({
        key: type,
        label: activityLabels[type],
        color: activityColors[type]
      }))
    },
    latestBucket
  };

  return (
    <div className="lab">
      <section className="chart-surface" aria-label={`${title} stacked chart`} data-testid="project-activity-chart">
        <div className="chart-header">
          <div>
            <p className="eyebrow">Bucketed real-time activity</p>
            <h2>{title}</h2>
          </div>
          <div className="chart-stats" aria-label="Project activity statistics">
            <StatItem label="Status" value={pollingState.status} tone="ok" />
            <StatItem label="Events" value={`${events.length}`} />
            <StatItem label="Buckets" value={`${buckets.length}`} />
            <StatItem
              label="Created"
              value={latestBucket ? `${latestBucket.created}` : "--"}
            />
            <StatItem
              label="Deleted"
              value={latestBucket ? `${latestBucket.deleted}` : "--"}
            />
            <StatItem
              label="Net"
              tone={latestBucket && latestBucket.net < 0 ? "warn" : "neutral"}
              value={latestBucket ? `${latestBucket.net}` : "--"}
            />
          </div>
        </div>

        <div className="chart-controls" aria-label="Project activity controls">
          <div className="control-group">
            <span className="control-label">Bucket</span>
            <div className="button-group" role="group" aria-label="Bucket size">
              {bucketOptions.map((option) => (
                <button
                  aria-pressed={bucketSizeMs === option.value}
                  className={bucketSizeMs === option.value ? "active" : ""}
                  key={option.label}
                  onClick={() => setBucketSizeMs(option.value)}
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
                  onClick={() => setPollIntervalMs(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <span className="control-label">Mode</span>
            <div className="button-group" role="group" aria-label="Display mode">
              {displayModeOptions.map((option) => (
                <button
                  aria-pressed={displayMode === option.value}
                  className={displayMode === option.value ? "active" : ""}
                  key={option.label}
                  onClick={() => setDisplayMode(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-region">
          {buckets.length === 0 ? (
            <div className="chart-empty-state">Waiting for project activity</div>
          ) : null}
          {hasMounted ? (
            <ResponsiveContainer height="100%" width="100%">
              <ComposedChart
                data={buckets}
                margin={{ top: 18, right: 24, bottom: 8, left: 0 }}
              >
                <CartesianGrid stroke="var(--ts-color-grid)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="bucketStart"
                  domain={xAxisDomain}
                  minTickGap={28}
                  scale="time"
                  tickFormatter={(value: number) => formatTime(value, bucketSizeMs)}
                  tickLine={false}
                  type="number"
                />
                <YAxis
                  allowDecimals={false}
                  domain={displayMode === "period" ? ["auto", "auto"] : [0, "auto"]}
                  label={{
                    value: yAxisLabel,
                    angle: -90,
                    position: "insideLeft"
                  }}
                  tickLine={false}
                  width={58}
	                />
	                <Tooltip
	                  labelFormatter={(value) => formatTime(Number(value), bucketSizeMs)}
                  content={({ active, label, payload }) => {
                    if (!active || !payload?.length) {
                      return null;
                    }

                    const bucket = payload[0].payload as BucketedActivity;

                    return (
                      <div className="chart-tooltip">
                        <strong>{formatTime(Number(label), bucketSizeMs)}</strong>
                        <div>Created: {bucket.created}</div>
                        <div>Deleted: {bucket.deleted}</div>
                        <div>Net: {bucket.net}</div>
                        <div>Current total: {bucket.cumulativeTotal}</div>
                        <hr />
	                        {payload.map((entry) => (
	                          <div key={String(entry.dataKey)}>
                            {entry.name}: {formatCount(Number(entry.value))}
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                {activityTypes.map((type) =>
                  visibleTypeSet.has(type) ? (
                    <Area
                      dataKey={type}
                      fill={activityColors[type]}
                      fillOpacity={0.72}
                      isAnimationActive={false}
                      key={type}
                      name={`${activityLabels[type]} ${chartModeLabel}`}
                      stackId="activity"
                      stroke={activityColors[type]}
                      strokeWidth={2}
                      type="monotone"
                    />
                  ) : null
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        <div className="chart-legend-controls" aria-label="Visible activity types">
          <span className="control-label">Visible activity</span>
          <div className="series-toggles">
            {activityTypes.map((type) => (
              <label className="series-toggle" key={type}>
                <input
                  checked={visibleTypeSet.has(type)}
                  onChange={() => toggleType(type)}
                  type="checkbox"
                />
                <span
                  className="series-swatch"
                  style={{ backgroundColor: activityColors[type] }}
                />
                {activityLabels[type]}
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className="debug-grid" aria-label="Project activity debug output">
        <DebugPanel title="Latest Events" value={events.slice(-12)} />
        <DebugPanel title="Bucketed Activity" value={buckets} />
        <DebugPanel title="Polling State" value={pollingState} />
        <DebugPanel title="Chart Configuration" value={chartConfiguration} />
      </div>
    </div>
  );
}

export default function ProjectActivityChartLab() {
  return <ProjectActivityChart />;
}
