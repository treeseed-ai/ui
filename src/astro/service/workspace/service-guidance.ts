const providers: Record<string, string> = {
  github: 'Connect source repositories and automate project work with a GitHub App or API token.',
  cloudflare: 'Publish applications, manage domains, and store project content.',
  railway: 'Run your project services and databases in a hosted environment.',
  hyperstack: 'Run TreeAI inference, training, or both on rented GPUs. Saving a connection does not start billing; hardware and schedules are selected in deployment.',
};
const capabilities: Record<string, string> = {
  'repository-hosting': 'Connect project source and library repositories so TreeSeed can read code and publish authorized changes.',
  'workflow-execution': 'Start approved workflows for project checks, builds, and releases, and retrieve their results.',
  'workflow-configuration': 'Supply non-secret configuration variables to approved project workflows.',
  'secret-enclave': 'Supply encrypted secrets to approved workflows without exposing stored values.',
  'frontend-hosting': 'Publish web interfaces through the provider using a reviewed deployment configuration.',
  'backend-hosting': 'Deploy APIs and background services from your project’s reviewed hosting configuration.',
  'database-hosting': 'Provision the databases required by a reviewed project deployment.',
  'object-storage': 'Store and mirror project files and published library content in configured buckets.',
  'dns-management': 'Connect application domains by reconciling the DNS records required by your deployment.',
  'private-knowledge-index-hosting': 'Host private search and knowledge services for your team’s projects.',
  'ai-inference-hosting': 'Serve models through the authenticated TreeAI inference API, backed by vLLM. Storage access is granted separately.',
  'ai-training-hosting': 'Train models with TreeAI and Axolotl. Save datasets and checkpoints through an authorized storage connection. Inference and training can share a machine with managed GPU admission.',
};
export const providerDescription = (id: string, fallback?: string) => providers[id] ?? fallback;
export const capabilityDescription = (id: string, fallback?: string) => capabilities[id] ?? fallback;
