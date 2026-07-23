import { useEffect, useState } from "react";
import "../../../styles/charts.css";


export type ActivityType = "questions" | "objectives" | "notes" | "proposals" | "decisions";

export type BucketSizeMs = 60_000 | 3_600_000 | 86_400_000 | 604_800_000;

export type PollIntervalMs = 1_000 | 2_000 | 5_000 | 10_000 | null;

export type DisplayMode = "cumulative" | "period";

export type PollStatus = "idle" | "polling" | "error";

export type ProjectActivityEvent = {
  id: string;
  timestamp: number;
  type: ActivityType;
  action: "created" | "deleted";
};

export type BucketedActivity = {
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

export const activityTypes: ActivityType[] = [
  "questions",
  "objectives",
  "notes",
  "proposals",
  "decisions"
];

export const activityLabels: Record<ActivityType, string> = {
  questions: "Questions",
  objectives: "Objectives",
  notes: "Notes",
  proposals: "Proposals",
  decisions: "Decisions"
};

export const activityColors: Record<ActivityType, string> = {
  questions: "var(--ts-chart-questions)",
  objectives: "var(--ts-chart-objectives)",
  notes: "var(--ts-chart-notes)",
  proposals: "var(--ts-chart-proposals)",
  decisions: "var(--ts-chart-decisions)"
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
      (event.action !== "created" && event.action !== "deleted")
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
