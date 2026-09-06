const providers: Record<string, string> = {
  github: 'Connect source repositories and automate project work with a GitHub App or API token.',
  cloudflare: 'Publish applications, manage domains, and store project content or deployment state.',
  railway: 'Run your project services and databases in a hosted environment.',
};
const capabilities: Record<string, string> = {
  'repository-hosting': 'Connect project source and library repositories so TreeSeed can read code and publish authorized changes.',
  'workflow-execution': 'Start approved GitHub Actions workflows for project checks, builds, and releases, and retrieve their results.',
  'workflow-configuration': 'Supply non-secret configuration variables to approved GitHub Actions workflows.',
  'secret-enclave': 'Supply encrypted secrets to GitHub Actions for approved workflows. GitHub does not return stored secret values.',
  'frontend-hosting': 'Publish web interfaces through the provider using a reviewed deployment configuration.',
  'backend-hosting': 'Deploy APIs and background services from your project’s reviewed hosting configuration.',
  'database-hosting': 'Provision the databases required by a reviewed project deployment.',
  'object-storage': 'Store and mirror project files and published library content in configured buckets.',
  'dns-management': 'Connect application domains by reconciling the DNS records required by your deployment.',
  'state-encryption': 'Protect deployment state used to plan and reconcile infrastructure changes.',
};
export const providerDescription = (id: string, fallback?: string) => providers[id] ?? fallback;
export const capabilityDescription = (id: string, fallback?: string) => capabilities[id] ?? fallback;
