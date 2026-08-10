import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { requestJson } from "../../forms-client.ts";
import { ExpandableMonitorSurface } from "../operations-monitor/ExpandableMonitorSurface.tsx";
import { AtlasCanvas } from "./AtlasCanvas.tsx";
import { AtlasDocks } from "./AtlasDocks.tsx";
import { PlaybackControls } from "./PlaybackControls.tsx";
import { AtlasOverlay } from "./AtlasOverlay.tsx";
import type {
  AtlasContextReference,
  AtlasEndpoints,
  AtlasNode,
  AtlasProjection,
  AtlasSizingMetric,
} from "./types.ts";
import "../../styles/agent-atlas.css";

interface Props {
  initialProjection: AtlasProjection;
  endpoints: AtlasEndpoints;
  canManage?: boolean;
  initialResearch?: boolean;
}
const metrics: AtlasSizingMetric[] = [
  "activity",
  "queue",
  "executions",
  "artifacts",
  "cost",
  "attention",
];

function withQuery(
  endpoint: string,
  values: Record<string, string | undefined>,
) {
  const url = new URL(endpoint, location.origin);
  for (const [key, value] of Object.entries(values))
    value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
  return `${url.pathname}${url.search}`;
}
function inspect(kind: string, id: string) {
  const url = new URL(location.href);
  url.searchParams.set("inspect", `${kind}~${encodeURIComponent(id)}`);
  history.pushState({ ...history.state, atlasInspect: true }, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
function closeInspect() {
  if (history.state?.atlasInspect) {
    history.back();
    return;
  }
  const url = new URL(location.href);
  url.searchParams.delete("inspect");
  history.replaceState(history.state, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function AgentAtlasWorkspace({
  initialProjection,
  endpoints,
  canManage = false,
  initialResearch = false,
}: Props) {
  const [projection, setProjection] = useState(initialProjection);
  const [metric, setMetric] = useState<AtlasSizingMetric>(
    initialProjection.scope.sizingMetric,
  );
  const [signals, setSignals] = useState(true);
  const [seed, setSeed] = useState(0);
  const [dock, setDock] = useState<"events" | "assignments" | null>("events");
  const [research, setResearch] = useState(initialResearch);
  const [newEvents, setNewEvents] = useState(0);
  const [overlay, setOverlay] = useState<{ kind: string; id: string } | null>(
    null,
  );
  const [viewReady, setViewReady] = useState(!endpoints.viewState);
  const returnFocus = useRef<{ focus: () => void } | null>(null);
  useEffect(() => {
    const pop = () => {
      const value = new URL(location.href).searchParams.get("inspect");
      if (!value) {
        setOverlay(null);
        requestAnimationFrame(() => returnFocus.current?.focus());
        return;
      }
      const [kind, id] = value.split("~");
      setOverlay(kind && id ? { kind, id: decodeURIComponent(id) } : null);
    };
    pop();
    addEventListener("popstate", pop);
    return () => removeEventListener("popstate", pop);
  }, []);
  const load = useCallback(
    async (values: Record<string, string | undefined>) => {
      const response = await fetch(
        withQuery(endpoints.projection, { metric, ...values }),
        { headers: { accept: "application/json" } },
      );
      if (!response.ok) return;
      const envelope = await response.json();
      setProjection(envelope.payload);
    },
    [endpoints.projection, metric],
  );
  useEffect(() => {
    if (!endpoints.stream || projection.playback.mode !== "live") return;
    const source = new EventSource(
      withQuery(endpoints.stream, { revision: projection.revision }),
    );
    source.addEventListener("atlas.delta", (event) => {
      const delta = JSON.parse((event as MessageEvent).data);
      if (projection.playback.mode === "historical") {
        setNewEvents((value) => value + (delta.activity?.length ?? 0));
        return;
      }
      void load({});
    });
    return () => source.close();
  }, [endpoints.stream, load, projection.playback.mode, projection.revision]);
  useEffect(() => {
    try {
      sessionStorage.setItem(
        `agent-atlas:${projection.scope.teamId}:preferences`,
        JSON.stringify({ metric, dock, seed }),
      );
    } catch {}
  }, [dock, metric, projection.scope.teamId, seed]);
  useEffect(() => {
    if (!endpoints.viewState) return;
    let active = true;
    void fetch(`${endpoints.viewState}?namespace=atlas`, {
      headers: { accept: "application/json" },
    })
      .then((response) => response.json())
      .then((envelope) => {
        if (!active) return;
        const entry = (envelope.payload ?? []).find(
          (item: { kind?: string; id?: string }) =>
            item.kind === "atlas-workspace" &&
            item.id === projection.scope.teamId,
        );
        const layout = entry?.layout ?? {};
        if (metrics.includes(layout.metric)) setMetric(layout.metric);
        if (
          ["events", "assignments"].includes(layout.dock) ||
          layout.dock === null
        )
          setDock(layout.dock);
        if (Number.isInteger(layout.seed)) setSeed(layout.seed);
        if (
          typeof layout.research === "boolean" &&
          !new URL(location.href).searchParams.has("research")
        )
          setResearch(layout.research);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setViewReady(true);
      });
    return () => {
      active = false;
    };
  }, [endpoints.viewState, projection.scope.teamId]);
  useEffect(() => {
    if (!endpoints.viewState || !viewReady) return;
    const timer = window.setTimeout(() => {
      void requestJson(endpoints.viewState!, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          namespace: "atlas",
          kind: "atlas-workspace",
          id: projection.scope.teamId,
          layout: { metric, dock, seed, research },
        }),
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    dock,
    endpoints.viewState,
    metric,
    projection.scope.teamId,
    research,
    seed,
    viewReady,
  ]);
  const openInspect = (kind: string, id: string, node?: AtlasNode) => {
    returnFocus.current =
      document.activeElement && "focus" in document.activeElement
        ? (document.activeElement as { focus: () => void })
        : null;
    const canonicalId = ["agent", "group", "project", "signal"].includes(kind)
      ? id.replace(/@[a-f0-9]{8}$/u, "")
      : id;
    inspect(kind, canonicalId);
    const event = projection.activity.find((item) => item.id === id);
    const assignment = projection.assignments.find((item) => item.id === id);
    const topology = projection.topologies.find(
      (item) =>
        item.projectId ===
          (node?.projectId ?? event?.projectId ?? assignment?.projectId) ||
        item.edges.some((edge) => edge.id === id),
    );
    const projectId =
      node?.projectId ??
      event?.projectId ??
      assignment?.projectId ??
      topology?.projectId;
    if (projectId) {
      const reference: AtlasContextReference = {
        kind,
        id: canonicalId,
        projectId,
        workdayId:
          event?.workdayId ??
          assignment?.workdayId ??
          projection.scope.workdayIds[0],
        eventSequence: event?.sequence,
        immutableRef: topology?.immutableRef,
      };
      document.dispatchEvent(
        new CustomEvent("treeseed:discussion-context-change", {
          detail: {
            references: [reference],
            identityLabel:
              node?.name ?? event?.summary ?? assignment?.name ?? kind,
          },
        }),
      );
    }
  };
  const seek = (at: string) => void load({ at });
  const live = () => {
    setNewEvents(0);
    void load({});
  };
  const openDag = () => inspect("assignment-graph", "scope");
  const title = useMemo(
    () =>
      projection.scope.workdayIds.length === 1
        ? "Workday circuit"
        : "Operating portfolio",
    [projection.scope.workdayIds.length],
  );
  const observedLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        timeZone: projection.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(projection.generatedAt));
    } catch {
      return projection.generatedAt;
    }
  }, [projection.generatedAt, projection.timeZone]);
  const topologyRevision = useMemo(
    () =>
      projection.topologies
        .map((topology) => topology.revision)
        .sort()
        .join(":"),
    [projection.topologies],
  );
  return (
    <ExpandableMonitorSurface
      id="agent-atlas"
      label="Agent Atlas research view"
      expanded={research}
      onExpand={() => {
        setResearch(true);
        const url = new URL(location.href);
        url.searchParams.set("research", "1");
        history.replaceState({}, "", url);
      }}
      onDismiss={() => {
        setResearch(false);
        const url = new URL(location.href);
        url.searchParams.delete("research");
        history.replaceState({}, "", url);
      }}
      className="ts-agent-atlas-surface"
    >
      <section
        className="ts-agent-atlas"
        data-scene="agent-lab.atlas"
        data-mode={projection.playback.mode}
      >
        <header className="ts-atlas-toolbar">
          <div>
            <small>Operational topology</small>
            <h1>Agent Atlas</h1>
            <span>
              {title} · {projection.topologies.length} circuits
            </span>
          </div>
          <label>
            Size by
            <select
              value={metric}
              onChange={(event) => {
                const value = event.target.value as AtlasSizingMetric;
                setMetric(value);
                void load({ metric: value });
              }}
            >
              {metrics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="ts-atlas-toolbar-actions">
            <button
              aria-pressed={signals}
              onClick={() => setSignals((value) => !value)}
            >
              Signals
            </button>
            <button onClick={() => setSeed((value) => value + 1)}>
              Redraw
            </button>
            {canManage && (
              <>
                <a href={endpoints.createAgent}>New agent</a>
                <a href={endpoints.createGroup}>New group</a>
              </>
            )}
          </div>
          <span className="ts-atlas-freshness">
            <i />
            Observed {observedLabel}
          </span>
        </header>
        <div className="ts-atlas-workspace">
          <AtlasCanvas
            topologies={projection.topologies}
            states={projection.nodeStates}
            metric={metric}
            redrawSeed={seed}
            signalsVisible={signals}
            storageKey={`agent-atlas:${projection.scope.teamId}:${topologyRevision}:viewport`}
            onInspect={openInspect}
          />
          <AtlasDocks
            activity={projection.activity}
            assignments={projection.assignments}
            timeZone={projection.timeZone}
            open={dock}
            onOpen={setDock}
            onInspect={openInspect}
            onOpenDag={openDag}
          />
        </div>
        <PlaybackControls
          start={projection.playback.startedAt}
          end={projection.playback.endedAt ?? projection.playback.liveEdgeAt}
          current={projection.playback.cursor.observedAt}
          live={projection.playback.liveEdgeAt}
          mode={projection.playback.mode}
          newEvents={newEvents}
          onSeek={seek}
          onLive={live}
        />
        {projection.alerts.length > 0 && (
          <div className="ts-atlas-alerts">
            {projection.alerts.map((alert) => (
              <p key={alert.id} data-severity={alert.severity}>
                {alert.message}
              </p>
            ))}
          </div>
        )}
        {overlay && (
          <AtlasOverlay
            selection={overlay}
            endpoints={endpoints}
            observedAt={projection.playback.cursor.observedAt}
            onClose={closeInspect}
            onDiscuss={() =>
              document.dispatchEvent(
                new CustomEvent("treeseed:discussion-open"),
              )
            }
            onInspect={inspect}
          />
        )}
      </section>
    </ExpandableMonitorSurface>
  );
}
