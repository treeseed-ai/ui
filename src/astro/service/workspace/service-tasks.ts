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
  'workflow-configuration': 'Manage workflow variables',
  'secret-enclave': 'Manage workflow secrets',
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
  const paired = available.some(item => item.type === 'workflow-configuration')
    && available.some(item => item.type === 'secret-enclave');
  return [...new Map(available.map(item => [item.type, item])).values()]
    .filter(item => !(paired && item.type === 'secret-enclave'))
    .map(item => {
      const combined = paired && item.type === 'workflow-configuration';
      return {
        ...item,
        label: combined ? 'Manage workflow variables and secrets' : labels[item.type] ?? item.label,
        description: combined
          ? 'Supply configuration variables and encrypted secrets to approved project workflows.'
          : capabilityDescription(item.type, item.description),
        capabilityTypes: combined ? ['workflow-configuration', 'secret-enclave'] : [item.type],
      };
    });
}

export function matchesServiceTask(task: { capabilityTypes: string[] }, capabilities: readonly {capabilityType: string; status: string}[] = []) {
  return task.capabilityTypes.every(type => capabilities.some(item => item.capabilityType === type && item.status === 'configured'));
}
