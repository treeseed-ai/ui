import { describe, expect, it } from 'vitest';
import { platformOperationHref } from '../../src/lib/app/platform-operation-status';

describe('app helper exports', () => {
  it('resolves platform operation links with a fallback', () => {
    expect(platformOperationHref(null, '/fallback')).toBe('/fallback');
    expect(platformOperationHref({ id: 'op-1', status: 'queued' }, '/fallback')).toBe('/fallback');
    expect(platformOperationHref({ id: 'op-2', status: 'succeeded', output: { href: '/app/work/objectives/new' } }, '/fallback')).toBe('/app/work/objectives/new');
  });
});
