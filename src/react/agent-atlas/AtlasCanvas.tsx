import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from "react";
import { layoutAtlas } from "./layout.ts";
import type {
  AtlasEdge,
  AtlasNode,
  AtlasNodeState,
  AtlasSizingMetric,
  AtlasTopology,
  PositionedAtlasNode,
} from "./types.ts";

const profileColors: Record<string, string> = {
  planning: "var(--ts-color-info)",
  acting: "var(--ts-color-success)",
  reviewing: "var(--ts-color-warning)",
  estimating: "var(--ts-color-warning)",
  reporting: "var(--ts-color-accent)",
  chat: "var(--ts-color-info)",
};

interface Props {
  topologies: AtlasTopology[];
  states: AtlasNodeState[];
  metric: AtlasSizingMetric;
  redrawSeed: number;
  signalsVisible: boolean;
  storageKey?: string;
  onInspect: (kind: string, id: string, node?: AtlasNode) => void;
}

export function AtlasCanvas({
  topologies,
  states,
  metric,
  redrawSeed,
  signalsVisible,
  storageKey,
  onInspect,
}: Props) {
  const viewport = useRef<SVGSVGElement | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, width: 1000, height: 620 });
  const drag = useRef<{
    x: number;
    y: number;
    viewX: number;
    viewY: number;
  } | null>(null);
  const scores = useMemo(
    () =>
      new Map(
        states.map((state) => [
          state.nodeId,
          state.metrics.find((item) => item.metric === metric)
            ?.normalizedValue ?? 0,
        ]),
      ),
    [metric, states],
  );
  const layout = useMemo(
    () => layoutAtlas(topologies, scores, redrawSeed),
    [redrawSeed, scores, topologies],
  );
  const nodes = useMemo(
    () => new Map(layout.nodes.map((node) => [node.id, node])),
    [layout],
  );
  const fit = () =>
    setView({ x: 0, y: 0, width: layout.width, height: layout.height });
  useEffect(() => {
    if (storageKey)
      try {
        const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
        if (
          saved &&
          [saved.x, saved.y, saved.width, saved.height].every(Number.isFinite)
        ) {
          setView(saved);
          return;
        }
      } catch {}
    fit();
  }, [layout.width, layout.height, storageKey]);
  useEffect(() => {
    if (!storageKey) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(view));
    } catch {}
  }, [storageKey, view]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (!viewport.current?.contains(document.activeElement)) return;
      if (event.key === "0") fit();
      if (event.key === "+" || event.key === "=") zoom(0.85);
      if (event.key === "-") zoom(1.18);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [layout.width, layout.height, view]);
  const zoom = (factor: number) =>
    setView((current) => {
      const width = Math.max(
        280,
        Math.min(layout.width * 2.5, current.width * factor),
      );
      const height = width * (current.height / current.width);
      return {
        x: current.x + (current.width - width) / 2,
        y: current.y + (current.height - height) / 2,
        width,
        height,
      };
    });
  const wheel = (event: WheelEvent) => {
    event.preventDefault();
    zoom(event.deltaY > 0 ? 1.12 : 0.88);
  };
  const pointerDown = (event: ReactPointerEvent) => {
    if ((event.target as Element).closest("[data-atlas-selectable]")) return;
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      viewX: view.x,
      viewY: view.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: ReactPointerEvent) => {
    if (!drag.current) return;
    const scale = view.width / (viewport.current?.clientWidth || 1);
    setView((current) => ({
      ...current,
      x: drag.current!.viewX - (event.clientX - drag.current!.x) * scale,
      y: drag.current!.viewY - (event.clientY - drag.current!.y) * scale,
    }));
  };
  const pointerUp = () => {
    drag.current = null;
  };
  const path = (edge: AtlasEdge) => {
    const from = nodes.get(edge.fromNodeId),
      to = nodes.get(edge.toNodeId);
    if (!from || !to) return "";
    const x1 = from.x + from.width,
      y1 = from.y + from.height / 2,
      x2 = to.x,
      y2 = to.y + to.height / 2,
      middle = (x1 + x2) / 2;
    return `M${x1} ${y1}H${middle}V${y2}H${x2}`;
  };
  const state = (node: PositionedAtlasNode) =>
    states.find((item) => item.nodeId === node.id);
  const nodeColor = (node: PositionedAtlasNode) =>
    profileColors[node.activityProfile ?? ""] ?? "var(--ts-color-text-muted)";
  return (
    <div className="ts-atlas-canvas-wrap">
      <div className="ts-atlas-zoom">
        <button onClick={() => zoom(0.85)} aria-label="Zoom in">
          ＋
        </button>
        <button onClick={() => zoom(1.18)} aria-label="Zoom out">
          −
        </button>
        <button onClick={fit}>Fit</button>
      </div>
      <svg
        ref={viewport}
        className="ts-atlas-canvas"
        viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
        tabIndex={0}
        role="application"
        aria-label="Agent Atlas circuit"
        onWheel={wheel}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
      >
        <defs>
          <marker
            id="ts-atlas-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0 0l10 5-10 5z" />
          </marker>
        </defs>
        <g className="ts-atlas-projects">
          {layout.nodes
            .filter((node) => node.kind === "project")
            .map((node) => (
              <g key={node.id}>
                <rect
                  className="ts-atlas-project"
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                />
                <text
                  className="ts-atlas-board-label"
                  x={node.x + 18}
                  y={node.y + 25}
                >
                  {node.name}
                </text>
              </g>
            ))}
          {layout.nodes
            .filter((node) => node.kind === "group")
            .map((node) => (
              <g key={node.id}>
                <rect
                  className="ts-atlas-group"
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                />
                <text
                  className="ts-atlas-group-label"
                  x={node.x + 14}
                  y={node.y + 23}
                >
                  {node.name}
                </text>
              </g>
            ))}
        </g>
        {signalsVisible && (
          <g className="ts-atlas-signals">
            {topologies
              .flatMap((topology) => topology.edges)
              .filter((edge) => edge.kind.includes("signal"))
              .map((edge) =>
                path(edge) ? (
                  <g
                    key={edge.id}
                    className="ts-atlas-trace"
                    data-atlas-selectable
                    tabIndex={0}
                    role="button"
                    aria-label={`Signal ${edge.contractId}`}
                    onClick={() => onInspect("signal", edge.id)}
                  >
                    <path className="ts-atlas-trace-hit" d={path(edge)} />
                    <path d={path(edge)} markerEnd="url(#ts-atlas-arrow)" />
                  </g>
                ) : null,
              )}
          </g>
        )}
        <g>
          {layout.nodes
            .filter((node) => node.kind === "agent")
            .map((node) => {
              const observed = state(node);
              const progress = observed?.progressPercent;
              return (
                <g
                  key={node.id}
                  className="ts-atlas-agent"
                  data-status={observed?.status ?? "idle"}
                  data-atlas-selectable
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.name}, ${node.activityProfile}, ${observed?.status ?? "idle"}`}
                  onClick={() => onInspect("agent", node.id, node)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onInspect("agent", node.id, node);
                    }
                  }}
                  style={
                    { "--atlas-agent-color": nodeColor(node) } as CSSProperties
                  }
                >
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                  />
                  <path
                    className="ts-atlas-agent-notch"
                    d={`M${node.x + node.width - 18} ${node.y}h18v18z`}
                  />
                  <text
                    className="ts-atlas-agent-name"
                    x={node.x + 12}
                    y={node.y + 25}
                  >
                    {node.name.slice(0, 24)}
                  </text>
                  <text
                    className="ts-atlas-agent-meta"
                    x={node.x + 12}
                    y={node.y + 43}
                  >
                    capacity {node.capacityClass} · {node.activityProfile}
                  </text>
                  {observed?.status === "running" && (
                    <>
                      <rect
                        className="ts-atlas-progress-track"
                        x={node.x + 12}
                        y={node.y + node.height - 17}
                        width={node.width - 24}
                        height="5"
                      />
                      <rect
                        className="ts-atlas-progress"
                        x={node.x + 12}
                        y={node.y + node.height - 17}
                        width={
                          progress == null
                            ? Math.max(18, (node.width - 24) * 0.28)
                            : ((node.width - 24) * progress) / 100
                        }
                        height="5"
                        data-indeterminate={progress == null ? "true" : "false"}
                      />
                    </>
                  )}
                </g>
              );
            })}
        </g>
      </svg>
      <details className="ts-atlas-relationships">
        <summary>Accessible circuit relationships</summary>
        <ul>
          {topologies
            .flatMap((topology) => topology.edges)
            .filter((edge) => edge.kind.includes("signal"))
            .map((edge) => (
              <li key={edge.id}>
                <button onClick={() => onInspect("signal", edge.id)}>
                  {nodes.get(edge.fromNodeId)?.name ?? edge.fromNodeId} →{" "}
                  {nodes.get(edge.toNodeId)?.name ?? edge.toNodeId}:{" "}
                  {edge.contractId}
                </button>
              </li>
            ))}
        </ul>
      </details>
    </div>
  );
}
