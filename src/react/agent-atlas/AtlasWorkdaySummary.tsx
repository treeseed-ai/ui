import type { AtlasProjection } from "./types.ts";

interface Props {
  summary: NonNullable<AtlasProjection["workdaySummary"]>;
  timeZone: string;
  onOpenEvents(): void;
  onOpenAssignments(): void;
}

function time(value: string | null, timeZone: string) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function tone(status: string, failures: number) {
  if (failures || ["failed", "degraded"].includes(status)) return "error";
  if (status === "cancelled") return "warning";
  if (status === "completed") return "success";
  return "info";
}

export function AtlasWorkdaySummary({ summary, timeZone, onOpenEvents, onOpenAssignments }: Props) {
  const started = time(summary.startedAt, timeZone);
  const finished = time(summary.finishedAt, timeZone);
  return (
    <section className="ts-atlas-workday-summary" data-tone={tone(summary.status, summary.assignments.failed)} aria-label="Selected workday status">
      <div>
        <small>Selected workday</small>
        <h2>{summary.title}</h2>
        <p>{summary.message}</p>
      </div>
      <dl>
        <div><dt>Status</dt><dd>{summary.status}</dd></div>
        <div><dt>Assignments</dt><dd>{summary.assignments.completed}/{summary.assignments.total} complete</dd></div>
        <div><dt>Attention</dt><dd>{summary.assignments.failed}</dd></div>
        <div><dt>Events</dt><dd>{summary.eventCount}</dd></div>
      </dl>
      <div className="ts-atlas-workday-summary__actions">
        <button onClick={onOpenAssignments}>Review assignments</button>
        <button onClick={onOpenEvents}>Review events</button>
        <a href="/app/work">Return to live portfolio</a>
      </div>
      {(started || finished) && <p className="ts-atlas-workday-summary__timing">
        {started ? <>Started <time dateTime={summary.startedAt!}>{started}</time></> : null}
        {started && finished ? " · " : null}
        {finished ? <>Finished <time dateTime={summary.finishedAt!}>{finished}</time></> : null}
      </p>}
    </section>
  );
}
