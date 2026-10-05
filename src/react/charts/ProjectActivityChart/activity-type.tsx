import { useMemo } from "react";
import "../../../styles/charts.css";
import { useRealtimeResource } from "../../operations-monitor/use-realtime-resource";


export type ActivityType = "questions" | "objectives" | "notes" | "proposals" | "decisions" | "agents";

export type BucketSizeMs = 60_000 | 3_600_000 | 86_400_000 | 604_800_000;

export type PollIntervalMs = 1_000 | 2_000 | 5_000 | 10_000 | null;

export type DisplayMode = "cumulative" | "period";

export type PollStatus = "idle" | "polling" | "error";

export type ProjectActivityEvent = {
  id: string;
  timestamp: number;
  type: ActivityType;
  action: "created" | "updated" | "deleted";
};

export type BucketedActivity = {
  bucketStart: number;
  bucketEnd: number;
  questions: number;
  objectives: number;
  notes: number;
  proposals: number;
  decisions: number;
  agents: number;
  created: number;
  updated: number;
  deleted: number;
  activity: number;
  total: number;
  net: number;
  cumulativeTotal: number;
  createdByType: Record<ActivityType, number>;
  updatedByType: Record<ActivityType, number>;
  deletedByType: Record<ActivityType, number>;
  activityByType: Record<ActivityType, number>;
};

export type ProjectActivityChartProps = {
  title?: string;
  description?: string;
  eyebrow?: string;
  pollIntervalMs?: PollIntervalMs;
  maxEvents?: number;
  eventsEndpoint?: string;
  initialEvents?: ProjectActivityEvent[];
  initialBucketSizeMs?: BucketSizeMs;
  initialDisplayMode?: DisplayMode;
  showPollingControl?: boolean;
  showDiagnostics?: boolean;
};

export const activityTypes: ActivityType[] = [
  "questions",
  "objectives",
  "notes",
  "proposals",
  "decisions",
  "agents"
];

export const activityLabels: Record<ActivityType, string> = {
  questions: "Questions",
  objectives: "Objectives",
  notes: "Notes",
  proposals: "Proposals",
  decisions: "Decisions",
  agents: "Agents"
};

export const activityColors: Record<ActivityType, string> = {
  questions: "var(--ts-chart-questions)",
  objectives: "var(--ts-chart-objectives)",
  notes: "var(--ts-chart-notes)",
  proposals: "var(--ts-chart-proposals)",
  decisions: "var(--ts-chart-decisions)",
  agents: "var(--ts-color-success)"
};

export const bucketOptions: Array<{ label: string; value: BucketSizeMs }> = [
  { label: "1m", value: 60_000 },
  { label: "1h", value: 3_600_000 },
  { label: "1d", value: 86_400_000 },
  { label: "1w", value: 604_800_000 }
];

export const pollIntervalOptions: Array<{ label: string; value: PollIntervalMs }> = [
  { label: "1s", value: 1_000 },
  { label: "2s", value: 2_000 },
  { label: "5s", value: 5_000 },
  { label: "10s", value: 10_000 },
  { label: "Never", value: null }
];

export const displayModeOptions: Array<{ label: string; value: DisplayMode }> = [
  { label: "Cumulative", value: "cumulative" },
  { label: "Period", value: "period" }
];

export function formatTime(timestamp: number, bucketSizeMs = 60_000) {
  return formatTimestamp(timestamp, {
    timeZone: typeof document === "undefined" ? "UTC" : documentTimeZone(),
    style: bucketSizeMs >= 86_400_000 ? "date" : "time",
  });
}

export function formatCount(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

export function floorToBucket(timestamp: number, bucketSizeMs: BucketSizeMs) {
  return Math.floor(timestamp / bucketSizeMs) * bucketSizeMs;
}

export const defaultEventsEndpoint = "/api/project-activity/events";

export async function fetchProjectActivityEvents(
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
      (event.action !== "created" && event.action !== "updated" && event.action !== "deleted")
    ) {
      throw new Error("Project activity events response was invalid");
    }
  }

  return events;
}

export function DebugPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="debug-panel" aria-label={title}>
      <h2>{title}</h2>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}

export function StatItem({
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

export function useProjectActivityEvents({
  maxEvents,
  pollIntervalMs,
  eventsEndpoint,
  initialEvents = []
}: {
  maxEvents: number;
  pollIntervalMs: PollIntervalMs;
  eventsEndpoint: string;
  initialEvents?: ProjectActivityEvent[];
}) {
	const endpoint = useMemo(() => () => eventsEndpoint, [eventsEndpoint]);
	const parse = useMemo(() => (payload: unknown) => {
		const events = Array.isArray(payload) ? payload : typeof payload === 'object' && payload !== null ? (payload as { events?: unknown }).events : null;
		if (!Array.isArray(events) || events.some((event) => typeof event?.id !== 'string' || typeof event?.timestamp !== 'number' || !activityTypes.includes(event.type) || !['created', 'updated', 'deleted'].includes(event.action))) throw new Error('Project activity events response was invalid');
		return { data: events as ProjectActivityEvent[] };
	}, []);
	const merge = useMemo(() => (current: ProjectActivityEvent[], next: ProjectActivityEvent[]) => {
		const byId = new Map(current.map((event) => [event.id, event])); for (const event of next) byId.set(event.id, event);
		return [...byId.values()].sort((left, right) => left.timestamp - right.timestamp).slice(-maxEvents);
	}, [maxEvents]);
	const live = useRealtimeResource({ initialData: initialEvents.slice(-maxEvents), endpoint, intervalMs: pollIntervalMs ?? 1_000, enabled: pollIntervalMs !== null, parse, merge });
	const events = live.data;

  return {
    events,
    pollingState: {
		status: live.status === 'degraded' || live.status === 'offline' ? 'error' : live.status === 'snapshot' ? 'idle' : 'polling',
      pollIntervalMs,
      maxEvents,
      eventsEndpoint,
      retainedEvents: events.length,
		pollCount: live.refreshCount,
		lastUpdatedAt: live.lastUpdatedAt,
		error: live.error
    }
  };
}
import { documentTimeZone, formatTimestamp } from "../../../timestamps";
