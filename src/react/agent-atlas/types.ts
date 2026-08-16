export type AtlasSizingMetric =
  | "activity"
  | "queue"
  | "executions"
  | "artifacts"
  | "cost"
  | "attention";
export type AtlasNodeKind = "project" | "group" | "agent" | "external";

export interface AtlasNode {
  id: string;
  kind: AtlasNodeKind;
  projectId: string | null;
  parentId: string | null;
  name: string;
  slug: string;
  capacityClass: string | null;
  activityProfile: string | null;
  directGroupIds: string[];
  effectiveGroupIds: string[];
  contentPath: string | null;
  metadata: Record<string, unknown>;
}
export interface AtlasEdge {
  id: string;
  kind:
    | "group-membership"
    | "declared-signal"
    | "observed-signal"
    | "assignment"
    | "artifact";
  fromNodeId: string;
  toNodeId: string;
  contractId: string | null;
  direction: "input" | "output" | "relation";
  metadata: Record<string, unknown>;
}
export interface AtlasTopology {
  contract: string;
  revision: string;
  projectId: string;
  immutableRef: string;
  capturedAt: string;
  planningGraphRevision: string;
  nodes: AtlasNode[];
  edges: AtlasEdge[];
}
export interface AtlasMetric {
  metric: AtlasSizingMetric;
  rawValue: number;
  normalizedValue: number;
  unit: string;
}
export interface AtlasNodeState {
  nodeId: string;
  workdayIds: string[];
  status:
    | "idle"
    | "queued"
    | "running"
    | "waiting"
    | "blocked"
    | "degraded"
    | "completed";
  progressPercent: number | null;
  elapsedSeconds: number | null;
  timeboxSeconds: number | null;
  metrics: AtlasMetric[];
  activeAssignmentIds: string[];
  lastEventSequence: number | null;
  observedAt: string | null;
}
export interface AtlasAssignment {
  id: string;
  projectId: string;
  workdayId: string;
  agentId: string | null;
  name: string;
  status: string;
  progressPercent: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  decisionId: string | null;
  proposalId: string | null;
  graphId: string | null;
  graphNodeId: string | null;
}
export interface AtlasActivity {
  id: string;
  workdayId: string;
  sequence: number;
  timestamp: string;
  category: string;
  direction: "input" | "output" | "internal";
  severity: "debug" | "info" | "warning" | "error";
  summary: string;
  projectId: string | null;
  agentId: string | null;
  activityProfile: string | null;
  signalContractId: string | null;
  assignmentId: string | null;
  artifactRefs: Record<string, unknown>[];
  metadata: Record<string, unknown>;
}
export interface AtlasProjection {
  revision: string;
  generatedAt: string;
  timeZone: string;
  scope: {
    teamId: string;
    selectedDate: string;
    workdayIds: string[];
    projectIds: string[];
    groupIds: string[];
    agentIds: string[];
    activityProfiles: string[];
    sizingMetric: AtlasSizingMetric;
  };
  topologies: AtlasTopology[];
  nodeStates: AtlasNodeState[];
  assignments: AtlasAssignment[];
  activity: AtlasActivity[];
  workdaySummary: {
    id: string;
    title: string;
    status: string;
    startedAt: string | null;
    finishedAt: string | null;
    assignments: { total: number; active: number; completed: number; failed: number; cancelled: number };
    eventCount: number;
    message: string;
  } | null;
  activityWindow: {
    total: number;
    loaded: number;
    truncated: boolean;
  };
  playback: {
    mode: "live" | "historical";
    startedAt: string;
    endedAt: string | null;
    liveEdgeAt: string;
    cursor: {
      cursor: string | null;
      observedAt: string;
      positions: Record<string, number>;
    };
  };
  alerts: Array<{
    id: string;
    severity: "info" | "warning" | "error";
    message: string;
  }>;
}
export interface AtlasEndpoints {
  projection: string;
  delta: string;
  stream: string;
  detail: string;
  assignmentGraphs: string;
  viewState?: string;
  createAgent?: string;
  createGroup?: string;
}
export type AgentLabInterfaceMode = "easy" | "diagnostic";
export interface AtlasContextReference {
  kind: string;
  id: string;
  projectId: string;
  workdayId?: string;
  eventSequence?: number;
  immutableRef?: string;
  path?: string;
  digest?: string;
}
export interface PositionedAtlasNode extends AtlasNode {
  x: number;
  y: number;
  width: number;
  height: number;
}
