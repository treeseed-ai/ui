import { capabilityDescription } from './service-guidance';

export interface TaskCapability {
  type: string;
  label: string;
  description?: string;
  status?: string;
  checked?: boolean;
}

const labels: Record<string, string> = {
  'repository-hosting': 'Read and update repositories',
  'workflow-execution': 'Run workflows',
  'frontend-hosting': 'Publish websites and apps',
  'dns-management': 'Manage domain records',
  'object-storage': 'Store files',
  'backend-hosting': 'Run backend services',
  'database-hosting': 'Host databases',
  'private-knowledge-index-hosting': 'Host team knowledge',
  'ai-inference-hosting': 'Provide AI service',
  'ai-training-hosting': 'Run training',
};

/** Shared presentation only: underlying authorization capabilities remain distinct. */
export function serviceTasks<T extends TaskCapability>(capabilities: readonly T[]) {
  const available = capabilities.filter(item => item.status !== 'planned' || item.checked);
  return [...new Map(available.map(item => [item.type, item])).values()]
    .map(item => {
      return {
        ...item,
        label: labels[item.type] ?? item.label,
        description: capabilityDescription(item.type, item.description),
        capabilityTypes: [item.type],
      };
    });
}

export function matchesServiceTask(task: { capabilityTypes: string[] }, capabilities: readonly {capabilityType: string; status: string}[] = []) {
  return task.capabilityTypes.every(type => capabilities.some(item => item.capabilityType === type && item.status === 'configured'));
}
