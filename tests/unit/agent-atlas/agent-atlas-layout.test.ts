import { describe, expect, it } from "vitest";
import { layoutAtlas } from "../../../src/react/agent-atlas/layout.ts";
import type { AtlasTopology } from "../../../src/react/agent-atlas/types.ts";

const topology: AtlasTopology = {
  contract: "treeseed.agent-atlas-topology/v1",
  revision: "one",
  projectId: "project",
  immutableRef: "ref",
  capturedAt: new Date(0).toISOString(),
  planningGraphRevision: "graph",
  nodes: [
    {
      id: "project:project",
      kind: "project",
      projectId: "project",
      parentId: null,
      name: "Project",
      slug: "project",
      capacityClass: null,
      activityProfile: null,
      directGroupIds: [],
      effectiveGroupIds: [],
      contentPath: null,
      metadata: {},
    },
    {
      id: "group:project:team",
      kind: "group",
      projectId: "project",
      parentId: "project:project",
      name: "Team",
      slug: "team",
      capacityClass: null,
      activityProfile: null,
      directGroupIds: [],
      effectiveGroupIds: [],
      contentPath: null,
      metadata: {},
    },
    {
      id: "agent:small",
      kind: "agent",
      projectId: "project",
      parentId: "group:project:team",
      name: "Small",
      slug: "small",
      capacityClass: "writer",
      activityProfile: "planning",
      directGroupIds: ["team"],
      effectiveGroupIds: ["team"],
      contentPath: null,
      metadata: {},
    },
    {
      id: "agent:large",
      kind: "agent",
      projectId: "project",
      parentId: "group:project:team",
      name: "Large",
      slug: "large",
      capacityClass: "writer",
      activityProfile: "acting",
      directGroupIds: ["team"],
      effectiveGroupIds: ["team"],
      contentPath: null,
      metadata: {},
    },
  ],
  edges: [],
};

describe("layoutAtlas", () => {
  it("keeps grouped agents inside a project with meaningful metric size variation", () => {
    const result = layoutAtlas(
      [topology],
      new Map([
        ["agent:small", 0],
        ["agent:large", 100],
      ]),
    );
    const small = result.nodes.find((node) => node.id === "agent:small")!;
    const large = result.nodes.find((node) => node.id === "agent:large")!;
    const project = result.nodes.find((node) => node.kind === "project")!;
    expect(large.width).toBeGreaterThan(small.width);
    expect(small.x).toBeGreaterThan(project.x);
    expect(result.width).toBeGreaterThanOrEqual(720);
  });
});
