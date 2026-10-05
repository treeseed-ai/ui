import { useEffect, useMemo, useState } from "react";
import type { AtlasActivity, AtlasAssignment } from "./types.ts";
import { LinkedDiagnosticTable } from "../workspace-surfaces/LinkedDiagnosticTable.tsx";

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
  activityWindow: { total: number; loaded: number; truncated: boolean };
  assignments: AtlasAssignment[];
  timeZone: string;
  open: "events" | "assignments" | "diagnostics" | null;
  onOpen: (value: "events" | "assignments" | "diagnostics" | null) => void;
  onInspect: (kind: string, id: string) => void;
  onOpenDag: () => void;
  diagnostic?: boolean;
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
  activityWindow,
  assignments,
  timeZone,
  open,
  onOpen,
  onInspect,
  onOpenDag,
  diagnostic = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [direction, setDirection] = useState("");
  const [severity, setSeverity] = useState("");
  const [showRoutine, setShowRoutine] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 25;
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
      [...activity].reverse().filter((item) => {
        const needle = query.trim().toLocaleLowerCase();
        const eventType = String(item.metadata.eventType ?? "").toLocaleLowerCase();
        const routine = /(?:tick|heartbeat|check[-_. ]?in|lease[._-]renew)/u.test(eventType) || /(?:compilation tick|heartbeat)/iu.test(item.summary);
        return (!category || item.category === category) &&
          (!direction || item.direction === direction) &&
          (!severity || item.severity === severity) &&
          (showRoutine || !routine) &&
          (!needle || [item.summary, item.agentId, item.projectId, item.signalContractId]
            .some((value) => value?.toLocaleLowerCase().includes(needle)));
      }),
    [activity, category, direction, query, severity, showRoutine],
  );
  useEffect(() => setPage(0), [category, direction, query, severity, showRoutine]);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageItems = visible.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
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
        {diagnostic && <button aria-pressed={open === "diagnostics"} onClick={() => onOpen(open === "diagnostics" ? null : "diagnostics")}>Datasets <b>{activity.length + assignments.length}</b></button>}
        <button
          aria-pressed={open === "assignments"}
          onClick={() => onOpen(open === "assignments" ? null : "assignments")}
        >
          Assignments <b>{assignments.length}</b>
        </button>
      </nav>
      {open === "events" && (
        <section className="ts-atlas-dock ts-atlas-event-dock">
          <header>
            <div>
              <small>Scoped monitor</small>
              <h2>Event log</h2>
            </div>
            <button onClick={() => onOpen(null)} aria-label="Close event log">
              ×
            </button>
          </header>
          <div className="ts-atlas-filters" role="search" aria-label="Filter Atlas events">
            <label><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Agent, project, or event" /></label>
            <label><span>Type</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All types</option>{choices.category.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>Severity</span><select value={severity} onChange={(event) => setSeverity(event.target.value)}><option value="">All severities</option>{choices.severity.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label><span>Flow</span><select value={direction} onChange={(event) => setDirection(event.target.value)}><option value="">All flows</option>{choices.direction.map((value) => <option key={value}>{value}</option>)}</select></label>
            <label className="ts-atlas-routine-filter"><input type="checkbox" checked={showRoutine} onChange={(event)=>setShowRoutine(event.target.checked)} /><span>Include routine scheduler activity</span></label>
          </div>
          <p className="ts-atlas-result-count" aria-live="polite">
            {visible.length} matching {visible.length === 1 ? "event" : "events"}
            {activityWindow.truncated ? ` in the latest ${activityWindow.loaded} of ${activityWindow.total}` : ""}
          </p>
          <ol className="ts-atlas-event-list">
            {pageItems.map((item) => (
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
          {!pageItems.length && <p className="ts-atlas-dock-empty">No events match these filters.</p>}
          {visible.length > pageSize && <nav className="ts-atlas-pagination" aria-label="Event log pages">
            <button disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous</button>
            <span>Page {currentPage + 1} of {pageCount}</span>
            <button disabled={currentPage + 1 >= pageCount} onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}>Next</button>
          </nav>}
        </section>
      )}
      {open === "assignments" && (
        <section className="ts-atlas-dock ts-atlas-assignment-dock">
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
      {open === "diagnostics" && diagnostic && <section className="ts-atlas-dock ts-atlas-diagnostic-dock">
        <header><div><small>Protected evidence</small><h2>Diagnostic datasets</h2></div><button onClick={() => onOpen(null)} aria-label="Close diagnostic datasets">×</button></header>
        <LinkedDiagnosticTable label="Workday activity evidence" rows={visible} columns={[
          { id: "sequence", label: "Sequence", value: (row) => <code>{row.sequence}</code> },
          { id: "type", label: "Type", value: (row) => row.category },
          { id: "subject", label: "Subject", value: (row) => row.agentId ?? row.projectId ?? "control plane" },
          { id: "time", label: "Observed", value: (row) => <time dateTime={row.timestamp}>{timestamp(row.timestamp, timeZone)}</time> },
        ]} onInspect={(row) => onInspect("event", row.id)} />
      </section>}
    </aside>
  );
}
