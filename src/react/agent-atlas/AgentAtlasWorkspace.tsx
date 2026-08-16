import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { requestJson } from "../../forms-client.ts";
import { WorkspaceFocusSurface } from "../workspace-surfaces/WorkspaceFocusSurface.tsx";
import { closeTopWorkspaceOverlay, openWorkspaceOverlay, readWorkspaceNavigation, safeWorkspaceReturnPath, setWorkspaceFocus } from "../workspace-surfaces/workspace-navigation.ts";
import type { WorkspaceSurfaceMode } from "../workspace-surfaces/types.ts";
import { AtlasCanvas } from "./AtlasCanvas.tsx";
import { AtlasDocks } from "./AtlasDocks.tsx";
import { PlaybackControls } from "./PlaybackControls.tsx";
import { AtlasOverlay } from "./AtlasOverlay.tsx";
import { AtlasWorkdaySummary } from "./AtlasWorkdaySummary.tsx";
import type {
  AtlasContextReference,
  AtlasEndpoints,
  AgentLabInterfaceMode,
  AtlasNode,
  AtlasProjection,
  AtlasSizingMetric,
} from "./types.ts";
import "../../styles/agent-atlas.css";

interface Props {
  initialProjection: AtlasProjection;
  endpoints: AtlasEndpoints;
  canManage?: boolean;
  canDiagnose?: boolean;
  initialSurfaceMode?: WorkspaceSurfaceMode;
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

export function selectedWorkdayUnavailable(projection: AtlasProjection, search: string) {
  const requested = new URLSearchParams(search).get("workday")?.trim();
  return Boolean(requested && projection.scope.workdayIds.length === 0);
}

export function selectedDefinitionRevision(projection: AtlasProjection, selection: { kind: string; id: string }) {
  if (selection.kind !== "agent") return null;
  const canonicalId = selection.id.replace(/@[a-f0-9]{8}$/u, "");
  return projection.topologies.find((topology) => topology.nodes.some((node) => node.kind === "agent" && node.id.replace(/@[a-f0-9]{8}$/u, "") === canonicalId))?.immutableRef ?? null;
}

export function atlasDesignerReturnPath(search: string) {
  return safeWorkspaceReturnPath(new URLSearchParams(search).get("returnTo")) ?? "";
}

export function AgentAtlasWorkspace({
  initialProjection,
  endpoints,
  canManage = false,
  canDiagnose = false,
  initialSurfaceMode = "inline",
}: Props) {
  const [projection, setProjection] = useState(initialProjection);
  const [metric, setMetric] = useState<AtlasSizingMetric>(
    initialProjection.scope.sizingMetric,
  );
  const [signals, setSignals] = useState(true);
  const [seed, setSeed] = useState(0);
  const [dock, setDock] = useState<"events" | "assignments" | "diagnostics" | null>(null);
  const [interfaceMode, setInterfaceMode] = useState<AgentLabInterfaceMode>(() =>
    canDiagnose && typeof location !== "undefined" && new URL(location.href).searchParams.get("mode") === "diagnostic" ? "diagnostic" : "easy",
  );
  const [surfaceMode, setSurfaceMode] = useState(initialSurfaceMode);
  const [newEvents, setNewEvents] = useState(0);
  const [overlays, setOverlays] = useState<Array<{ kind: string; id: string }>>([]);
  const [viewReady, setViewReady] = useState(!endpoints.viewState);
  const unavailableSelection = typeof location !== "undefined"
    && selectedWorkdayUnavailable(projection, location.search);
  const returnFocus = useRef<{ focus: () => void } | null>(null);
  useEffect(() => {
    const pop = () => {
      const url = new URL(location.href);
      const navigation = readWorkspaceNavigation(url.search);
      setSurfaceMode(url.searchParams.get("focus") === "atlas" ? "focused" : "inline");
      setInterfaceMode(canDiagnose && url.searchParams.get("mode") === "diagnostic" ? "diagnostic" : "easy");
      if (!navigation.overlays.length) {
        setOverlays([]);
        requestAnimationFrame(() => returnFocus.current?.focus());
        return;
      }
      setOverlays(navigation.overlays);
    };
    pop();
    addEventListener("popstate", pop);
    return () => removeEventListener("popstate", pop);
  }, [canDiagnose]);
  useEffect(() => {
    const url = new URL(location.href);
    if (url.searchParams.get("research") !== "1") return;
    url.searchParams.delete("research");
    url.searchParams.set("focus", "atlas");
    history.replaceState({ ...history.state, workspaceFocus: "atlas" }, "", url);
    setSurfaceMode("focused");
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
      if (projection.playback.mode === "historical" || overlays.length) {
        setNewEvents((value) => value + (delta.activity?.length ?? 0));
        return;
      }
      void load({});
    });
    return () => source.close();
  }, [endpoints.stream, load, overlays.length, projection.playback.mode, projection.revision]);
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
          ["events", "assignments", ...(canDiagnose ? ["diagnostics"] : [])].includes(layout.dock) ||
          layout.dock === null
        )
          setDock(layout.dock);
        if (Number.isInteger(layout.redrawSeed)) setSeed(layout.redrawSeed);
        else if (Number.isInteger(layout.seed)) setSeed(layout.seed);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setViewReady(true);
      });
    return () => {
      active = false;
    };
  }, [canDiagnose, endpoints.viewState, projection.scope.teamId]);
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
          layoutPatch: { metric, dock, redrawSeed: seed },
        }),
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    dock,
    endpoints.viewState,
    metric,
    projection.scope.teamId,
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
    openWorkspaceOverlay({ kind, id: canonicalId });
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
  const openDag = () => openWorkspaceOverlay({ kind: "assignment-graph", id: "scope" });
  const title = useMemo(
    () =>
      projection.scope.workdayIds.length === 1
        ? "Workday circuit"
        : "Operating portfolio",
    [projection.scope.workdayIds.length],
  );
  const returnTo = useMemo(() => {
    if (typeof location === "undefined") return "";
    return atlasDesignerReturnPath(location.search);
  }, []);
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
  const changeSurfaceMode = (mode: WorkspaceSurfaceMode) => {
    setSurfaceMode(mode);
    if (mode === "focused") {
      setWorkspaceFocus("atlas");
      return;
    }
    setWorkspaceFocus(null, "replace");
  };
  const changeInterfaceMode = (mode: AgentLabInterfaceMode) => {
    const url = new URL(location.href);
    setInterfaceMode(mode);
    if (mode === "diagnostic") url.searchParams.set("mode", "diagnostic");
    else url.searchParams.delete("mode");
    history.pushState({ ...history.state, agentLabInterfaceMode: mode }, "", url);
  };
  return (
    <WorkspaceFocusSurface
      id="agent-atlas"
      label="Agent Atlas"
      boundary="workspace-content"
      mode={surfaceMode}
      onModeChange={changeSurfaceMode}
      headerContext={<span><strong>Agent Atlas</strong> · {title} · {projection.playback.mode === "live" ? "Live" : "Historical"}</span>}
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
            {returnTo && <a href={returnTo}>Return to Designer</a>}
            {canDiagnose && <button aria-pressed={interfaceMode === "diagnostic"} onClick={() => changeInterfaceMode(interfaceMode === "easy" ? "diagnostic" : "easy")}>{interfaceMode === "easy" ? "Diagnostic" : "Easy mode"}</button>}
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
        {projection.workdaySummary && <AtlasWorkdaySummary
          summary={projection.workdaySummary}
          timeZone={projection.timeZone}
          onOpenEvents={() => setDock("events")}
          onOpenAssignments={() => setDock("assignments")}
        />}
        <div className="ts-atlas-workspace">
          {projection.topologies.length ? <AtlasCanvas
              topologies={projection.topologies}
              states={projection.nodeStates}
              metric={metric}
              redrawSeed={seed}
              signalsVisible={signals}
              storageKey={`agent-atlas:${projection.scope.teamId}:${topologyRevision}:viewport`}
              onInspect={openInspect}
            /> : <section className="ts-atlas-empty" data-scene="agent-lab.atlas.empty">
              <small>{unavailableSelection ? "Active team boundary" : "Nothing is hidden"}</small>
              <h2>{unavailableSelection ? "This workday is not available here" : "No agent circuit is available"}</h2>
              <p>{unavailableSelection
                ? "The requested workday is not visible to the active team. Choose a team that owns the workday, or clear the selection to view this team's operating portfolio."
                : projection.alerts[0]?.message ?? "This scope has no configured agent topology to draw."}</p>
              <div>
                {unavailableSelection
                  ? <a href="/app/work">Clear workday selection</a>
                  : <>{endpoints.createAgent && <a href={endpoints.createAgent}>Review agent definitions</a>}<a href="/app/work/workdays">Choose a workday</a></>}
              </div>
              <dl>
                <div><dt>Workdays in scope</dt><dd>{projection.scope.workdayIds.length}</dd></div>
                <div><dt>Assignments observed</dt><dd>{projection.assignments.length}</dd></div>
                <div><dt>Events observed</dt><dd>{projection.activityWindow.total}</dd></div>
              </dl>
            </section>}
          <AtlasDocks
            activity={projection.activity}
            activityWindow={projection.activityWindow}
            assignments={projection.assignments}
            timeZone={projection.timeZone}
            open={dock}
            onOpen={setDock}
            onInspect={openInspect}
            onOpenDag={openDag}
            diagnostic={interfaceMode === "diagnostic"}
          />
        </div>
        {projection.scope.workdayIds.length > 0 && <PlaybackControls
          start={projection.playback.startedAt}
          end={projection.playback.endedAt ?? projection.playback.liveEdgeAt}
          current={projection.playback.cursor.observedAt}
          live={projection.playback.liveEdgeAt}
          mode={projection.playback.mode}
          newEvents={newEvents}
          onSeek={seek}
          onLive={live}
        />}
        {projection.alerts.length > 0 && (
          <div className="ts-atlas-alerts">
            {projection.alerts.map((alert) => (
              <p key={alert.id} data-severity={alert.severity}>
                {alert.message}
              </p>
            ))}
          </div>
        )}
        {overlays.map((overlay, index) => (
          <AtlasOverlay
            key={`${index}:${overlay.kind}:${overlay.id}`}
            selection={overlay}
            endpoints={endpoints}
            observedAt={projection.playback.cursor.observedAt}
            onClose={closeTopWorkspaceOverlay}
            onDiscuss={() =>
              document.dispatchEvent(
                new CustomEvent("treeseed:discussion-open"),
              )
            }
            onInspect={(kind, id) => openWorkspaceOverlay({ kind, id })}
            interfaceMode={interfaceMode}
            definitionRevision={selectedDefinitionRevision(projection, overlay)}
            historical={projection.playback.mode === "historical"}
            top={index === overlays.length - 1}
            depth={index}
          />
        ))}
      </section>
    </WorkspaceFocusSurface>
  );
}
