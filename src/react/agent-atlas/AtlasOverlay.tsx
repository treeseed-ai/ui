import { useEffect, useState, type CSSProperties } from "react";
import { WorkspaceOverlay } from "../workspace-surfaces/WorkspaceOverlay.tsx";
import type { AtlasEndpoints } from "./types.ts";
import type { AgentLabInterfaceMode } from "./types.ts";

type Selection = { kind: string; id: string };
function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function DefinitionProvenance({ revision, historical = false }: { revision: string; historical?: boolean }) {
  return <section className="ts-atlas-definition-provenance" data-mode={historical ? "historical" : "live"} data-scene="agent-lab.definition-provenance" aria-label={historical ? "Historical agent definition" : "Agent definition authority"}>
    <div><small>{historical ? "Historical definition" : "Definition authority"}</small><strong>{historical ? "Captured for this workday" : "Active immutable revision"}</strong></div>
    <code title={revision}>{revision}</code>
    <p>{historical ? "Atlas is showing the immutable definition used by this recorded workday. Later agent edits do not rewrite this evidence." : "Assignments in this topology resolve the agent definition from this exact repository revision."}</p>
  </section>;
}

export function AtlasOverlay({
  selection,
  endpoints,
  observedAt,
  onClose,
  onDiscuss,
  onInspect,
  interfaceMode,
  definitionRevision,
  historical,
  top,
  depth,
}: {
  selection: Selection;
  endpoints: AtlasEndpoints;
  observedAt: string;
  onClose: () => void;
  onDiscuss: () => void;
  onInspect: (kind: string, id: string) => void;
  interfaceMode: AgentLabInterfaceMode;
  definitionRevision?: string | null;
  historical?: boolean;
  top: boolean;
  depth: number;
}) {
  const [detail, setDetail] = useState<unknown>(null);
  const [mode, setMode] = useState<"designed" | "assigned" | "observed">(
    "observed",
  );
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
    url.searchParams.set("detail", interfaceMode);
    void fetch(`${url.pathname}${url.search}`, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    })
      .then((response) => response.json())
      .then((envelope) => setDetail(envelope.payload ?? envelope))
      .catch(() => setDetail(null));
    return () => controller.abort();
  }, [
    endpoints.assignmentGraphs,
    endpoints.detail,
    observedAt,
    selection.id,
    selection.kind,
    interfaceMode,
  ]);
  const data = record(detail);
  return (
    <WorkspaceOverlay reference={{ kind: selection.kind === "assignment-graph" ? "diagnostic" : "detail", id: selection.id }} label={`${selection.kind} detail`} onClose={onClose} top={top} depth={depth}>
    <section className="ts-atlas-overlay">
      <header>
        <div>
          <small>Focused Atlas record</small>
          <h2>{selection.kind.replace(/-/gu, " ")}</h2>
          <code>{selection.id}</code>
        </div>
        <span>
          <button onClick={onDiscuss}>Discuss</button>
          <button onClick={onClose} aria-label="Close detail">
            ×
          </button>
        </span>
      </header>
      {selection.kind === "agent" && interfaceMode === "diagnostic" && (
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
        {selection.kind === "agent" && definitionRevision ? <DefinitionProvenance revision={definitionRevision} historical={historical} /> : null}
        {selection.kind === "assignment-graph" ? (
          <GraphDetail
            graphs={Array.isArray(detail) ? detail : []}
            onInspect={onInspect}
          />
        ) : detail ? (
          <RecordDetail data={data} mode={interfaceMode === "diagnostic" ? mode : "easy"} />
        ) : (
          <p>Loading canonical detail…</p>
        )}
      </div>
    </section>
    </WorkspaceOverlay>
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
    mode === "easy"
      ? record(data.summary)
      : data.kind === "agent"
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
