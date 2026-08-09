import type { AtlasTopology, PositionedAtlasNode } from "./types.ts";

export interface AtlasLayout {
  nodes: PositionedAtlasNode[];
  width: number;
  height: number;
}

function dimensions(kind: PositionedAtlasNode["kind"], score: number) {
  if (kind !== "agent") return { width: 0, height: 0 };
  const scale = 0.68 + (Math.max(0, Math.min(100, score)) / 100) * 0.72;
  return { width: Math.round(150 * scale), height: Math.round(76 * scale) };
}

export function layoutAtlas(
  topologies: AtlasTopology[],
  metricScores: Map<string, number>,
  seed = 0,
): AtlasLayout {
  const placed: PositionedAtlasNode[] = [];
  let projectX = 28;
  let maximumHeight = 520;
  for (const topology of topologies) {
    const agents = topology.nodes.filter((node) => node.kind === "agent");
    const groups = topology.nodes.filter((node) => node.kind === "group");
    const groupAgents = new Map(
      groups.map((group) => [
        group.id,
        agents.filter((agent) => agent.parentId === group.id),
      ]),
    );
    const ungrouped = agents.filter(
      (agent) => !groups.some((group) => group.id === agent.parentId),
    );
    const columns = Math.max(
      1,
      Math.ceil(Math.sqrt(Math.max(1, agents.length))),
    );
    const projectWidth = Math.max(430, columns * 190 + 80);
    let cursorY = 74;
    for (const [groupIndex, group] of groups.entries()) {
      const members = groupAgents.get(group.id) ?? [];
      if (!members.length) continue;
      const groupColumns = Math.max(
        1,
        Math.min(columns, Math.ceil(Math.sqrt(members.length))),
      );
      const rows = Math.ceil(members.length / groupColumns);
      const groupHeight = Math.max(138, rows * 116 + 58);
      const groupWidth = Math.max(350, groupColumns * 190 + 34);
      placed.push({
        ...group,
        x: projectX + 28,
        y: cursorY,
        width: groupWidth,
        height: groupHeight,
      });
      members.forEach((agent, index) => {
        const size = dimensions("agent", metricScores.get(agent.id) ?? 0);
        const column = (index + seed + groupIndex) % groupColumns;
        const row = Math.floor(index / groupColumns);
        placed.push({
          ...agent,
          x: projectX + 48 + column * 190,
          y: cursorY + 42 + row * 116,
          ...size,
        });
      });
      cursorY += groupHeight + 24;
    }
    if (ungrouped.length) {
      ungrouped.forEach((agent, index) => {
        const size = dimensions("agent", metricScores.get(agent.id) ?? 0);
        placed.push({
          ...agent,
          x: projectX + 48 + (index % columns) * 190,
          y: cursorY + Math.floor(index / columns) * 116,
          ...size,
        });
      });
      cursorY += Math.ceil(ungrouped.length / columns) * 116 + 24;
    }
    const project = topology.nodes.find((node) => node.kind === "project");
    if (project)
      placed.push({
        ...project,
        x: projectX,
        y: 28,
        width: projectWidth,
        height: Math.max(260, cursorY),
      });
    projectX += projectWidth + 34;
    maximumHeight = Math.max(maximumHeight, cursorY + 46);
  }
  return {
    nodes: placed,
    width: Math.max(720, projectX),
    height: maximumHeight,
  };
}
