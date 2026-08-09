import { useMemo, useState } from "react";
import type { AtlasActivity, AtlasAssignment } from "./types.ts";

const categories = [
  "question",
  "note",
  "proposal",
  "assignment",
  "estimate",
  "execution",
  "message",
  "artifact",
  "tool",
  "signal",
  "usage",
  "failure",
];
const directions = ["input", "output", "internal"];
const severities = ["debug", "info", "warning", "error"];
interface Props {
  activity: AtlasActivity[];
  assignments: AtlasAssignment[];
  timeZone: string;
  open: "events" | "assignments" | null;
  onOpen: (value: "events" | "assignments" | null) => void;
  onInspect: (kind: string, id: string) => void;
  onOpenDag: () => void;
}

function timestamp(value: string, timeZone: string) {
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

export function AtlasDocks({
  activity,
  assignments,
  timeZone,
  open,
  onOpen,
  onInspect,
  onOpenDag,
}: Props) {
  const [selected, setSelected] = useState<Record<string, Set<string>>>({
    category: new Set(categories),
    direction: new Set(directions),
    severity: new Set(severities),
    project: new Set(),
    agent: new Set(),
    signal: new Set(),
  });
  const choices = useMemo(
    () => ({
      category: categories,
      direction: directions,
      severity: severities,
      project: [
        ...new Set(activity.map((item) => item.projectId).filter(Boolean)),
      ] as string[],
      agent: [
        ...new Set(activity.map((item) => item.agentId).filter(Boolean)),
      ] as string[],
      signal: [
        ...new Set(
          activity.map((item) => item.signalContractId).filter(Boolean),
        ),
      ] as string[],
    }),
    [activity],
  );
  const visible = useMemo(
    () =>
      activity.filter(
        (item) =>
          selected.category.has(item.category) &&
          selected.direction.has(item.direction) &&
          selected.severity.has(item.severity) &&
          (!selected.project.size ||
            Boolean(item.projectId && selected.project.has(item.projectId))) &&
          (!selected.agent.size ||
            Boolean(item.agentId && selected.agent.has(item.agentId))) &&
          (!selected.signal.size ||
            Boolean(
              item.signalContractId &&
              selected.signal.has(item.signalContractId),
            )),
      ),
    [activity, selected],
  );
  const toggle = (bucket: string, value: string) =>
    setSelected((current) => {
      const next = { ...current, [bucket]: new Set(current[bucket]) };
      next[bucket].has(value)
        ? next[bucket].delete(value)
        : next[bucket].add(value);
      return next;
    });
  return (
    <aside
      className="ts-atlas-docks"
      data-open={open ?? "none"}
      aria-label="Atlas operations"
    >
      <nav>
        <button
          aria-pressed={open === "events"}
          onClick={() => onOpen(open === "events" ? null : "events")}
        >
          Events <b>{visible.length}</b>
        </button>
        <button
          aria-pressed={open === "assignments"}
          onClick={() => onOpen(open === "assignments" ? null : "assignments")}
        >
          Assignments <b>{assignments.length}</b>
        </button>
      </nav>
      {open === "events" && (
        <section className="ts-atlas-dock">
          <header>
            <div>
              <small>Scoped monitor</small>
              <h2>Event log</h2>
            </div>
            <button onClick={() => onOpen(null)} aria-label="Close event log">
              ×
            </button>
          </header>
          <details className="ts-atlas-filters">
            <summary>Filter monitored evidence</summary>
            <div>
              {Object.entries(choices)
                .filter(([, values]) => values.length)
                .map(([bucket, values]) => (
                  <fieldset key={bucket}>
                    <legend>{bucket}</legend>
                    {values.map((value) => (
                      <label key={value}>
                        <input
                          type="checkbox"
                          checked={selected[bucket].has(value)}
                          onChange={() => toggle(bucket, value)}
                        />
                        {value}
                      </label>
                    ))}
                  </fieldset>
                ))}
            </div>
          </details>
          <ol className="ts-atlas-event-list">
            {visible.map((item) => (
              <li key={item.id}>
                <button onClick={() => onInspect("event", item.id)}>
                  <span data-severity={item.severity}>{item.category}</span>
                  <strong>{item.summary}</strong>
                  <small>
                    {item.agentId ?? item.projectId ?? "control plane"} ·{" "}
                    {item.direction}
                  </small>
                  <time dateTime={item.timestamp}>
                    {timestamp(item.timestamp, timeZone)}
                  </time>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
      {open === "assignments" && (
        <section className="ts-atlas-dock">
          <header>
            <div>
              <small>Control plane</small>
              <h2>Assignments</h2>
            </div>
            <span>
              <button onClick={onOpenDag}>Expand DAG</button>
              <button
                onClick={() => onOpen(null)}
                aria-label="Close assignments"
              >
                ×
              </button>
            </span>
          </header>
          <ol className="ts-atlas-assignment-list">
            {assignments.map((item) => (
              <li key={item.id}>
                <button onClick={() => onInspect("assignment", item.id)}>
                  <span
                    className="ts-atlas-assignment-state"
                    data-status={item.status}
                  />
                  <strong>{item.name}</strong>
                  <small>
                    {item.agentId ?? "Unassigned"} · {item.status}
                  </small>
                  {item.progressPercent === null ? (
                    <i>Progress not reported</i>
                  ) : (
                    <progress value={item.progressPercent} max="100">
                      {item.progressPercent}%
                    </progress>
                  )}
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
    </aside>
  );
}
