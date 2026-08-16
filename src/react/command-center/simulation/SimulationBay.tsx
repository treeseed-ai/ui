import { useEffect, useRef, useState } from "react";
import { requestJson } from "../../../forms-client.ts";
import { CommandCollection } from "../CommandCollection.tsx";
import { YamlIde, type YamlIdeDiagnostic } from "../editor/YamlIde.tsx";
import type { CommandEntity, CommandWorkspaceEndpoints } from "../types.ts";
import { WorkspaceFocusSurface } from "../../workspace-surfaces/WorkspaceFocusSurface.tsx";
import { useWorkspaceSurfaceMode } from "../../workspace-surfaces/use-workspace-surface-mode.ts";
import { safeWorkspaceReturnPath, setWorkspaceFocus } from "../../workspace-surfaces/workspace-navigation.ts";

interface Draft {
  projectId: string;
  projectName: string;
  seedPath: string;
  scenePath: string;
  testPath?: string;
  seedYaml: string;
  sceneYaml: string;
  testMdx?: string;
  expectedBase: string;
  diagnostics: YamlIdeDiagnostic[];
}
function requestId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}
function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }

export function simulationAtlasPath(workdayId: string, operationId: string, returnTo: string) {
  const url = new URL("/app/work", "https://workspace.invalid");
  url.searchParams.set("focus", "atlas");
  url.searchParams.set("workday", workdayId);
  url.searchParams.set("simulation", operationId);
  const safeReturn = safeWorkspaceReturnPath(returnTo);
  if (safeReturn) url.searchParams.set("returnTo", safeReturn);
  return `${url.pathname}${url.search}`;
}

export function SimulationBay({
  items,
  endpoints,
  stateEndpoint,
  timeZone,
}: {
  items: CommandEntity[];
  endpoints: CommandWorkspaceEndpoints;
  stateEndpoint: string;
  timeZone: string;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [seed, setSeed] = useState("");
  const [scene, setScene] = useState("");
  const [agentTest, setAgentTest] = useState("");
  const [commit, setCommit] = useState("");
  const [message, setMessage] = useState("Loading the current team profile…");
  const [busy, setBusy] = useState("");
  const [sourceVisible, setSourceVisible] = useState(() => typeof location !== "undefined" && new URL(location.href).searchParams.get("mode") === "diagnostic");
  const [surfaceMode, changeSurfaceMode] = useWorkspaceSurfaceMode({ surfaceId: "simulation", inlineParameters: { return: null } });
  const loaded = useRef("");
  const followController = useRef<AbortController | null>(null);
  const selectedProjectId = typeof location !== "undefined" ? new URL(location.href).searchParams.get("project") ?? "" : "";
  useEffect(() => {
    if (!endpoints.draft) return;
    const url = new URL(endpoints.draft, location.origin);
    if (selectedProjectId) url.searchParams.set("project", selectedProjectId);
    const draftEndpoint = `${url.pathname}${url.search}`;
    if (loaded.current === draftEndpoint) return;
    loaded.current = draftEndpoint;
    const controller = new AbortController();
    setDraft(null); setCommit(""); setMessage("Loading the selected project profile…");
    void requestJson(draftEndpoint, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error ?? "Could not generate the team simulation draft.",
          );
        const next = result.payload as Draft;
        setDraft(next);
        setSeed(next.seedYaml);
        setScene(next.sceneYaml);
        setAgentTest(next.testMdx ?? "");
        setMessage(
          next.diagnostics?.length
            ? "The generated profile needs attention before launch."
            : "Generated from the current team, repositories, memberships, and local provider.",
        );
      })
      .catch((error) => {
        if (error?.name !== "AbortError")
          setMessage(
            error instanceof Error ? error.message : "Draft unavailable.",
          );
      });
    return () => controller.abort();
  }, [endpoints.draft, selectedProjectId]);
  useEffect(() => () => followController.current?.abort(), []);
  async function followSimulation(operationId: string, returnTo: string) {
    followController.current?.abort(); const controller = new AbortController(); followController.current = controller;
    for (let attempt = 0; attempt < 120 && !controller.signal.aborted; attempt += 1) {
      const response = await requestJson(endpoints.collection, { signal: controller.signal }).catch(() => null);
      const envelope = response?.ok ? await response.json().catch(() => null) : null;
      const run = (Array.isArray(envelope?.payload?.items) ? envelope.payload.items : []).find((item: CommandEntity) => item.id === operationId);
      const data = object(run?.data); const workdayId = typeof data.workdayId === "string" ? data.workdayId : "";
      if (workdayId) {
        location.assign(simulationAtlasPath(workdayId, operationId, returnTo)); return;
      }
      if (["failed", "cancelled"].includes(String(run?.status))) { setMessage(`Simulation ${String(run.status)} before a workday became available.`); return; }
      await new Promise((resolve) => window.setTimeout(resolve, 1_000));
    }
    if (!controller.signal.aborted) setMessage("Simulation is still starting. Its retained run remains available below.");
  }
  async function save() {
    if (!draft || !endpoints.authoringBundle) return;
    setBusy("save");
    setMessage("Validating and committing both definitions through TreeDX…");
    try {
      const response = await requestJson(endpoints.authoringBundle, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId: draft.projectId,
          expectedBase: draft.expectedBase,
          changeSummary: "Agent Lab simulation definition",
          files: [
            { path: draft.seedPath, source: seed },
            { path: draft.scenePath, source: scene },
            ...(draft.testPath && agentTest ? [{ path: draft.testPath, source: agentTest }] : []),
          ],
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error ?? "The definitions could not be committed.",
        );
      setCommit(String(result.payload.commit));
      setMessage(
        `Saved definitions at ${String(result.payload.commit).slice(0, 12)}.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy("");
    }
  }
  async function launch(rerun = false) {
    if (!draft || !commit || !endpoints.simulations) return;
    setBusy("launch");
    setMessage("Queueing the committed scene for the seeded provider manager…");
    try {
      const navigation = new URL(location.href);
      const returnTo = safeWorkspaceReturnPath(navigation.searchParams.get("returnTo")) ?? `${location.pathname}${location.search}`;
      const response = await requestJson(endpoints.simulations, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId: draft.projectId,
          scenePath: draft.scenePath,
          immutableRef: commit,
          requestId: requestId(),
          rerun,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Simulation launch failed.");
      setMessage(
        `Simulation ${String(result.payload.id).slice(0, 12)} queued. Atlas will open when its workday is ready.`,
      );
      void followSimulation(String(result.payload.id), returnTo);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Launch failed.");
    } finally {
      setBusy("");
    }
  }
  const simulations = items.filter((item) => item.kind === "simulation");
  const returningToDesigner = typeof location !== "undefined" && new URL(location.href).searchParams.get("return") === "designer";
  function returnToDesigner() {
    setWorkspaceFocus("designer", "push", { return: null, returnTo: null, view: "edit", project: null });
  }
  return (
    <WorkspaceFocusSurface id="simulation-bay" label="Simulation Bay" mode={surfaceMode} boundary="workspace-content" onModeChange={changeSurfaceMode} headerContext={<span><strong>Simulation Bay</strong> · {draft?.projectName ?? "Loading team profile"} · {commit ? commit.slice(0, 12) : "Working draft"}</span>}>
    <section className="ts-command-bay">
      <header>
        <div>
          <span>Production path</span>
          <h2>Simulation Bay</h2>
          <p>
            Generate a secret-free project profile, author the validated definitions
            atomically, then launch the immutable scene through the existing
            provider.
          </p>
        </div>
        <div className="ts-simulation-bay__actions">
          {surfaceMode === "focused" && returningToDesigner ? <button type="button" onClick={returnToDesigner}>Return to Designer</button> : null}
          <button type="button" aria-expanded={sourceVisible} onClick={() => setSourceVisible((value) => !value)}>{sourceVisible ? "Hide generated source" : "Show generated source"}</button>
          <button
            type="button"
            onClick={save}
            disabled={!draft || Boolean(busy)}
          >
            Save definitions
          </button>
          <button
            type="button"
            onClick={() => void launch()}
            disabled={!commit || Boolean(busy)}
          >
            Launch simulation
          </button>
        </div>
      </header>
      {draft ? (
        <>
          <div className="ts-simulation-bay__identity">
            <strong>{draft.projectName}</strong>
            <span>
              {commit
                ? `Immutable ref ${commit.slice(0, 12)}`
                : "Working draft"}
            </span>
          </div>
          <section className="ts-simulation-bay__readiness" aria-label="Simulation readiness">
            <div><span>Project profile</span><strong>{draft.seedPath}</strong></div>
            <div><span>Workday scene</span><strong>{draft.scenePath}</strong></div>
            <div data-state={draft.diagnostics.length ? "attention" : "ready"}><span>Readiness</span><strong>{draft.diagnostics.length ? `${draft.diagnostics.length} issue${draft.diagnostics.length === 1 ? "" : "s"} to resolve` : "Ready to validate"}</strong></div>
            {draft.diagnostics.length ? <ol>{draft.diagnostics.map((diagnostic,index) => <li key={`${diagnostic.line}:${diagnostic.column}:${index}`}><span>{diagnostic.line ? `Line ${diagnostic.line}${diagnostic.column ? `:${diagnostic.column}` : ""}` : "Definition"}</span>{diagnostic.message}</li>)}</ol> : <p>The generated definitions use the current team inventory, exact repository authority, and governed provider configuration.</p>}
          </section>
          {sourceVisible ? <div className="ts-simulation-bay__editors" data-mode="diagnostic">
            <section>
              <header>
                <span>Seed profile</span>
                <code>{draft.seedPath}</code>
              </header>
              <YamlIde
                value={seed}
                onChange={(value) => {
                  setSeed(value);
                  setCommit("");
                }}
                label="Seed YAML"
                diagnostics={draft.diagnostics}
              />
            </section>
            <section>
              <header>
                <span>Scene definition</span>
                <code>{draft.scenePath}</code>
              </header>
              <YamlIde
                value={scene}
                onChange={(value) => {
                  setScene(value);
                  setCommit("");
                }}
                label="Scene YAML"
              />
            </section>
            {draft.testPath ? <section>
              <header><span>Agent test</span><code>{draft.testPath}</code></header>
              <YamlIde value={agentTest} onChange={(value) => { setAgentTest(value); setCommit(""); }} label="Agent test MDX" />
            </section> : null}
          </div> : null}
        </>
      ) : (
        <div className="ts-command-empty">
          Generating the current team profile…
        </div>
      )}
      <p role="status">{message}</p>
      {simulations.length ? (
        <section>
          <header>
            <div>
              <span>Retained runs</span>
              <h3>Follow, inspect, cancel, or rerun</h3>
            </div>
          </header>
          <CommandCollection
            items={simulations}
            splitLabel="simulations"
            stateEndpoint={stateEndpoint}
            timeZone={timeZone}
          />
        </section>
      ) : null}
    </section>
    </WorkspaceFocusSurface>
  );
}
