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

describe('Atlas fitting uses observed content bounds',()=>{
 it('keeps an unavailable sizing metric neutral rather than treating it as a measured zero',()=>{
  const layout=layoutAtlas([topology],new Map());
  expect(layout.nodes.find(node=>node.id==='agent:small')).toMatchObject({width:150,height:76});
  const zero=layoutAtlas([topology],new Map([['agent:small',0]]));
  expect(zero.nodes.find(node=>node.id==='agent:small')!.width).toBeLessThan(150);
 });
 it('does not add hundreds of empty logical pixels below a small project',()=>{
  const layout=layoutAtlas([topology],new Map());
  const bottom=Math.max(...layout.nodes.map(node=>node.y+node.height));
  expect(layout.height).toBeGreaterThanOrEqual(bottom);
  expect(layout.height-bottom).toBeLessThanOrEqual(28);
 });
});

it("treats non-finite metrics as unavailable while preserving finite metric bounds", () => {
  for (const score of [NaN, Infinity, -Infinity]) {
    const layout = layoutAtlas([topology], new Map([["agent:small", score]]));
    expect(layout.nodes.find((node) => node.id === "agent:small"))
      .toMatchObject({ width: 150, height: 76 });
  }

  const zero = layoutAtlas([topology], new Map([["agent:small", 0]]));
  const full = layoutAtlas([topology], new Map([["agent:small", 100]]));
  const below = layoutAtlas([topology], new Map([["agent:small", -10]]));
  const above = layoutAtlas([topology], new Map([["agent:small", 110]]));

  expect(zero.nodes.find((node) => node.id === "agent:small")!.width).toBeLessThan(150);
  expect(full.nodes.find((node) => node.id === "agent:small")!.width).toBe(210);
  expect(below.nodes.find((node) => node.id === "agent:small")!.width).toBe(
    zero.nodes.find((node) => node.id === "agent:small")!.width,
  );
  expect(above.nodes.find((node) => node.id === "agent:small")!.width).toBe(210);
});
