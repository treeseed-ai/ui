import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { AtlasEndpoints } from "./types.ts";

type Selection = { kind: string; id: string };
function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function AtlasOverlay({
  selection,
  endpoints,
  observedAt,
  onClose,
  onDiscuss,
  onInspect,
}: {
  selection: Selection;
  endpoints: AtlasEndpoints;
  observedAt: string;
  onClose: () => void;
  onDiscuss: () => void;
  onInspect: (kind: string, id: string) => void;
}) {
  const [detail, setDetail] = useState<unknown>(null);
  const [mode, setMode] = useState<"designed" | "assigned" | "observed">(
    "observed",
  );
  const close = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const path =
      selection.kind === "assignment-graph"
        ? endpoints.assignmentGraphs
        : `${endpoints.detail}/${encodeURIComponent(selection.kind)}/${encodeURIComponent(selection.id)}`;
    const url = new URL(path, location.origin);
    const page = new URL(location.href);
    for (const key of ["date", "workday", "project", "group", "agent"]) {
      const value = page.searchParams.get(key);
      if (value) url.searchParams.set(key, value);
    }
    url.searchParams.set("at", observedAt);
    void fetch(`${url.pathname}${url.search}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    })
      .then((response) => response.json())
      .then((envelope) => setDetail(envelope.payload ?? envelope))
      .catch(() => setDetail(null));
    close.current?.focus();
    return () => controller.abort();
  }, [
    endpoints.assignmentGraphs,
    endpoints.detail,
    observedAt,
    selection.id,
    selection.kind,
  ]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose]);
  const data = record(detail);
  return (
    <section
      className="ts-atlas-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${selection.kind} detail`}
    >
      <header>
        <div>
          <small>Focused Atlas record</small>
          <h2>{selection.kind.replace(/-/gu, " ")}</h2>
          <code>{selection.id}</code>
        </div>
        <span>
          <button onClick={onDiscuss}>Discuss</button>
          <button ref={close} onClick={onClose} aria-label="Close detail">
            ×
          </button>
        </span>
      </header>
      {selection.kind === "agent" && (
        <nav
          className="ts-atlas-evidence-tabs"
          aria-label="Agent evidence mode"
        >
          {(["designed", "assigned", "observed"] as const).map((item) => (
            <button
              key={item}
              aria-pressed={mode === item}
              onClick={() => setMode(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      )}
      <div className="ts-atlas-overlay-body">
        {selection.kind === "assignment-graph" ? (
          <GraphDetail
            graphs={Array.isArray(detail) ? detail : []}
            onInspect={onInspect}
          />
        ) : detail ? (
          <RecordDetail data={data} mode={mode} />
        ) : (
          <p>Loading canonical detail…</p>
        )}
      </div>
    </section>
  );
}

function RecordDetail({
  data,
  mode,
}: {
  data: Record<string, unknown>;
  mode: string;
}) {
  const source = record(data.data);
  const primary = record(data.primary);
  const fields =
    data.kind === "agent"
      ? mode === "designed"
        ? record(source.definition)
        : mode === "assigned"
          ? { assignments: source.assignments ?? data.related }
          : {
              events: source.observed,
              evidence: data.evidence,
              status: data.status,
            }
      : source;
  return (
    <div className="ts-atlas-record-detail">
      <section>
        <small>{String(data.status ?? mode)}</small>
        <h3>{String(data.title ?? "Operational record")}</h3>
        <p>
          {String(
            data.description ??
              record(primary.content).body ??
              "No summary was reported.",
          )}
        </p>
      </section>
      <dl>
        {Object.entries(fields)
          .slice(0, 18)
          .map(([key, value]) => (
            <div key={key}>
              <dt>{key.replace(/([A-Z])/gu, " $1")}</dt>
              <dd>
                {typeof value === "object" ? (
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                ) : (
                  String(value ?? "—")
                )}
              </dd>
            </div>
          ))}
      </dl>
    </div>
  );
}

function GraphDetail({
  graphs,
  onInspect,
}: {
  graphs: unknown[];
  onInspect: (kind: string, id: string) => void;
}) {
  if (!graphs.length)
    return <p>No assignment control-plane graph is active in this scope.</p>;
  return (
    <div className="ts-atlas-graph-detail">
      {graphs.map((value) => {
        const graph = record(value);
        const nodes = Array.isArray(graph.nodes) ? graph.nodes.map(record) : [];
        const edges = Array.isArray(graph.edges) ? graph.edges.map(record) : [];
        return (
          <section key={String(graph.id)}>
            <header>
              <div>
                <small>{String(graph.status)}</small>
                <h3>{String(graph.id)}</h3>
              </div>
              <span>
                {nodes.length} assignments · {edges.length} dependencies
              </span>
            </header>
            <div className="ts-atlas-dag">
              {nodes.map((node, index) => {
                const assignmentIds = Array.isArray(node.assignmentIds)
                  ? node.assignmentIds.map(String)
                  : [];
                return (
                  <button
                    key={String(node.id)}
                    data-status={String(node.status)}
                    style={{ "--dag-column": index } as CSSProperties}
                    onClick={() =>
                      assignmentIds[0] &&
                      onInspect("assignment", assignmentIds[0])
                    }
                    disabled={!assignmentIds.length}
                  >
                    <strong>{String(node.id)}</strong>
                    <small>
                      {String(node.targetAgentClass ?? "unassigned")} ·{" "}
                      {String(node.status)}
                    </small>
                    {node.progressPercent == null ? (
                      <i>Progress not reported</i>
                    ) : (
                      <progress
                        max="100"
                        value={Number(node.progressPercent)}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <ul>
              {edges.map((edge, index) => (
                <li key={index}>
                  {String(edge.fromNodeId)} → {String(edge.toNodeId)} ·{" "}
                  {String(edge.edgeType)}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
