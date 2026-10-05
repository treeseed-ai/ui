import { useState } from "react";
import { requestJson } from "../../../forms-client.ts";

export function GroupCreator({
  projects,
  saveEndpoint,
  onClose,
}: {
  projects: Array<[string, string]>;
  saveEndpoint: string;
  onClose: () => void;
}) {
  const [projectId, setProjectId] = useState(projects[0]?.[0] ?? "");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [classification, setClassification] = useState("agent-team");
  const [parentGroupId, setParentGroupId] = useState("");
  const [state, setState] = useState("");
  async function create() {
    if (!projectId || !name.trim()) {
      setState("Choose a project and name the group.");
      return;
    }
    setState("Validating group topology and committing through TreeDX…");
    const response = await requestJson(saveEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        projectId,
        intent: {
          name: name.trim(),
          description: description.trim(),
          classification,
          parentGroupId: parentGroupId.trim() || undefined,
        },
        changeSummary: `Create agent group ${name.trim()}`,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setState(result.error ?? "Group creation failed.");
      return;
    }
    setState(
      `Created ${String(result.payload?.changedPaths?.[0] ?? "group")} at ${String(result.payload?.commit ?? "").slice(0, 12)}.`,
    );
    setTimeout(onClose, 650);
  }
  return (
    <section
      className="ts-agent-creator"
      role="dialog"
      aria-modal="true"
      aria-label="Create repository group"
    >
      <header>
        <div>
          <span>Universal collection</span>
          <h3>Create a group</h3>
          <p>
            Groups organize agents without changing provider or scheduling
            authority.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close creator">
          ×
        </button>
      </header>
      <div>
        <label>
          <span>Project</span>
          <select
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            {projects.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Research team"
          />
        </label>
        <label>
          <span>Classification</span>
          <input
            value={classification}
            onChange={(event) => setClassification(event.target.value)}
          />
        </label>
        <label>
          <span>Parent group ID</span>
          <input
            value={parentGroupId}
            onChange={(event) => setParentGroupId(event.target.value)}
            placeholder="Optional"
          />
        </label>
        <label>
          <span>Description</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
      </div>
      <footer>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="button" onClick={() => void create()}>
          Commit group
        </button>
        {state ? <span role="status">{state}</span> : null}
      </footer>
    </section>
  );
}
