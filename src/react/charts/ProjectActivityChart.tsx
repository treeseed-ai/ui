import { useEffect, useMemo, useState } from "react";
import "../../styles/charts.css";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type ActivityType = "questions" | "objectives" | "notes" | "proposals" | "decisions";
type BucketSizeMs = 60_000 | 3_600_000 | 86_400_000 | 604_800_000;
type PollIntervalMs = 1_000 | 2_000 | 5_000 | 10_000 | null;
type DisplayMode = "cumulative" | "period";
type PollStatus = "idle" | "polling" | "error";

type ProjectActivityEvent = {
  id: string;
  timestamp: number;
  type: ActivityType;
  action: "created" | "deleted";
};

type BucketedActivity = {
  bucketStart: number;
  bucketEnd: number;
  questions: number;
  objectives: number;
  notes: number;
  proposals: number;
  decisions: number;
  created: number;
  deleted: number;
  total: number;
  net: number;
  cumulativeTotal: number;
  createdByType: Record<ActivityType, number>;
  deletedByType: Record<ActivityType, number>;
  netByType: Record<ActivityType, number>;
};

export type ProjectActivityChartProps = {
  title?: string;
  pollIntervalMs?: PollIntervalMs;
  maxEvents?: number;
  eventsEndpoint?: string;
};

const activityTypes: ActivityType[] = [
  "questions",
  "objectives",
  "notes",
  "proposals",
  "decisions"
];

const activityLabels: Record<ActivityType, string> = {
  questions: "Questions",
  objectives: "Objectives",
  notes: "Notes",
  proposals: "Proposals",
  decisions: "Decisions"
};

const activityColors: Record<ActivityType, string> = {
  questions: "var(--ts-chart-questions)",
  objectives: "var(--ts-chart-objectives)",
  notes: "var(--ts-chart-notes)",
  proposals: "var(--ts-chart-proposals)",
  decisions: "var(--ts-chart-decisions)"
};

const bucketOptions: Array<{ label: string; value: BucketSizeMs }> = [
  { label: "1m", value: 60_000 },
  { label: "1h", value: 3_600_000 },
  { label: "1d", value: 86_400_000 },
  { label: "1w", value: 604_800_000 }
];

const pollIntervalOptions: Array<{ label: string; value: PollIntervalMs }> = [
  { label: "1s", value: 1_000 },
  { label: "2s", value: 2_000 },
  { label: "5s", value: 5_000 },
  { label: "10s", value: 10_000 },
  { label: "Never", value: null }
];

const displayModeOptions: Array<{ label: string; value: DisplayMode }> = [
  { label: "Cumulative", value: "cumulative" },
  { label: "Period", value: "period" }
];

function formatTime(timestamp: number, bucketSizeMs = 60_000) {
  if (bucketSizeMs >= 86_400_000) {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric"
    }).format(timestamp);
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(timestamp);
}

function formatCount(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

function floorToBucket(timestamp: number, bucketSizeMs: BucketSizeMs) {
  return Math.floor(timestamp / bucketSizeMs) * bucketSizeMs;
}

const defaultEventsEndpoint = "/api/project-activity/events";

async function fetchProjectActivityEvents(
  eventsEndpoint: string
): Promise<ProjectActivityEvent[]> {
  const response = await fetch(eventsEndpoint);

  if (!response.ok) {
    throw new Error(`Project activity events request failed with ${response.status}`);
  }

  const payload = await response.json() as ProjectActivityEvent[] | {
    events?: ProjectActivityEvent[];
  };
  const events = Array.isArray(payload) ? payload : payload.events;

  if (!Array.isArray(events)) {
    throw new Error("Project activity events response was invalid");
  }

  for (const event of events) {
    if (
      typeof event.id !== "string" ||
      typeof event.timestamp !== "number" ||
      !activityTypes.includes(event.type) ||
      (event.action !== "created" && event.action !== "deleted")
    ) {
      throw new Error("Project activity events response was invalid");
    }
  }

  return events;
}

function DebugPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="debug-panel" aria-label={title}>
      <h2>{title}</h2>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </section>
  );
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

function useProjectActivityEvents({
  maxEvents,
  pollIntervalMs,
  eventsEndpoint
}: {
  maxEvents: number;
  pollIntervalMs: PollIntervalMs;
  eventsEndpoint: string;
}) {
  const [events, setEvents] = useState<ProjectActivityEvent[]>([]);
  const [status, setStatus] = useState<PollStatus>("idle");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
        const nextEvents = await fetchProjectActivityEvents(eventsEndpoint);

        if (cancelled) {
          return;
        }

        setEvents((current) => [...current, ...nextEvents].slice(-maxEvents));
        setLastUpdatedAt(Date.now());
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
            : "Unable to fetch project activity events"
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
  }, [eventsEndpoint, maxEvents, pollIntervalMs]);

  return {
    events,
    pollingState: {
      status,
      pollIntervalMs,
      maxEvents,
      eventsEndpoint,
      retainedEvents: events.length,
      pollCount,
      lastUpdatedAt,
      error
    }
  };
}

function aggregateEvents(
  events: ProjectActivityEvent[],
  bucketSizeMs: BucketSizeMs,
  displayMode: DisplayMode
): BucketedActivity[] {
  const now = Date.now();
  const bucketCount = 24;
  const currentBucketStart = floorToBucket(now, bucketSizeMs);
  const firstBucketStart = currentBucketStart - (bucketCount - 1) * bucketSizeMs;
  const buckets = new Map<
    number,
    {
      createdCounts: Record<ActivityType, number>;
      deletedCounts: Record<ActivityType, number>;
      created: number;
      deleted: number;
    }
  >();

  for (let index = 0; index < bucketCount; index += 1) {
    buckets.set(firstBucketStart + index * bucketSizeMs, {
      createdCounts: {
        questions: 0,
        objectives: 0,
        notes: 0,
        proposals: 0,
        decisions: 0
      },
      deletedCounts: {
        questions: 0,
        objectives: 0,
        notes: 0,
        proposals: 0,
        decisions: 0
      },
      created: 0,
      deleted: 0
    });
  }

  for (const event of events) {
    const bucketStart = floorToBucket(event.timestamp, bucketSizeMs);
    if (bucketStart < firstBucketStart || bucketStart > currentBucketStart) {
      continue;
    }

    const bucket =
      buckets.get(bucketStart) ??
      {
        createdCounts: {
          questions: 0,
          objectives: 0,
          notes: 0,
          proposals: 0,
          decisions: 0
        },
        deletedCounts: {
          questions: 0,
          objectives: 0,
          notes: 0,
          proposals: 0,
          decisions: 0
        },
        created: 0,
        deleted: 0
      };

    if (event.action === "created") {
      bucket.createdCounts[event.type] += 1;
      bucket.created += 1;
    } else {
      bucket.deletedCounts[event.type] += 1;
      bucket.deleted += 1;
    }

    buckets.set(bucketStart, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([left], [right]) => left - right)
    .reduce<{
      runningTotals: Record<ActivityType, number>;
      rows: BucketedActivity[];
    }>(
      (accumulator, [bucketStart, bucket]) => {
        const netByType = activityTypes.reduce<Record<ActivityType, number>>(
          (result, type) => ({
            ...result,
            [type]: bucket.createdCounts[type] - bucket.deletedCounts[type]
          }),
          {
            questions: 0,
            objectives: 0,
            notes: 0,
            proposals: 0,
            decisions: 0
          }
        );

        const nextRunningTotals = activityTypes.reduce<Record<ActivityType, number>>(
          (result, type) => ({
            ...result,
            [type]: Math.max(0, accumulator.runningTotals[type] + netByType[type])
          }),
          {
            questions: 0,
            objectives: 0,
            notes: 0,
            proposals: 0,
            decisions: 0
          }
        );

        const source = displayMode === "cumulative" ? nextRunningTotals : netByType;
        const values = activityTypes.reduce<Record<ActivityType, number>>(
          (result, type) => ({
            ...result,
            [type]: source[type]
          }),
          {
            questions: 0,
            objectives: 0,
            notes: 0,
            proposals: 0,
            decisions: 0
          }
        );

        accumulator.rows.push({
          bucketStart,
          bucketEnd: bucketStart + bucketSizeMs,
          ...values,
          created: bucket.created,
          deleted: bucket.deleted,
          total:
            displayMode === "cumulative"
              ? activityTypes.reduce(
                  (sum, type) => sum + nextRunningTotals[type],
                  0
                )
              : bucket.created - bucket.deleted,
          net: bucket.created - bucket.deleted,
          cumulativeTotal: activityTypes.reduce(
            (sum, type) => sum + nextRunningTotals[type],
            0
          ),
          createdByType: bucket.createdCounts,
          deletedByType: bucket.deletedCounts,
          netByType
        });

        return {
          runningTotals: nextRunningTotals,
          rows: accumulator.rows
        };
      },
      {
        runningTotals: {
          questions: 0,
          objectives: 0,
          notes: 0,
          proposals: 0,
          decisions: 0
        },
        rows: []
      }
    ).rows;
}

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

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
