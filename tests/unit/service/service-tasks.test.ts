import {describe, expect, it} from 'vitest';
import {SERVICE_PROVIDER_CATALOG} from '@treeseed/sdk/secrets-capability';
import {serviceTasks, matchesServiceTask} from '../../../src/astro/service/workspace/service-tasks';

describe('shared service tasks', () => {
  const all = serviceTasks(SERVICE_PROVIDER_CATALOG.flatMap(provider => provider.capabilities));
  it('uses exactly the union of selectable provider tasks', () => {
    const selectable = SERVICE_PROVIDER_CATALOG.flatMap(provider => serviceTasks(provider.capabilities));
    expect(all.map(task => task.type).sort()).toEqual([...new Set(selectable.map(task => task.type))].sort());
    for (const task of selectable) {
      expect(all.find(item => item.type === task.type)?.label).toBe(task.label);
      expect(task.label + ' ' + task.description).not.toMatch(/GitHub|Cloudflare|Railway/);
    }
  });
  it('combines variables and secrets and requires both when filtering', () => {
    const task = all.find(item => item.type === 'workflow-configuration')!;
    expect(task.label).toBe('Manage workflow variables and secrets');
    expect(all.some(item => item.type === 'secret-enclave')).toBe(false);
    expect(matchesServiceTask(task, [{capabilityType: 'workflow-configuration', status: 'configured'}])).toBe(false);
    expect(matchesServiceTask(task, task.capabilityTypes.map(capabilityType => ({capabilityType, status: 'configured'})))).toBe(true);
    expect(matchesServiceTask(task)).toBe(false);
  });
  it('hides planned tasks but preserves configured historical capabilities', () => {
    expect(serviceTasks([{type: 'future', label: 'Future', status: 'planned'}])).toEqual([]);
    expect(serviceTasks([{type: 'future', label: 'Future', status: 'planned', checked: true}])).toHaveLength(1);
  });
});
