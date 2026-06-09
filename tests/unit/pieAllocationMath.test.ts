import { describe, expect, it } from 'vitest';
import {
  angleDeltaDegrees,
  applyAdjacentDelta,
  applyNumericEdit,
  describeArcSlice,
  normalizeAllocations,
  validateAllocations,
  type PieAllocationSlice,
} from '../../src/lib/pie-allocation/math.ts';

const sample: PieAllocationSlice[] = [
  { id: 'planning', name: 'Planning', percentage: 30 },
  { id: 'acting', name: 'Acting', percentage: 60 },
  { id: 'optimization', name: 'Optimization', percentage: 10 },
];

function total(slices: PieAllocationSlice[]) {
  return Number(slices.reduce((sum, slice) => sum + slice.percentage, 0).toFixed(2));
}

describe('pieAllocationMath', () => {
  it('normalizes valid allocations', () => {
    expect(normalizeAllocations(sample, 1, 0)).toEqual(sample);
  });

  it('normalizes totals below and above 100', () => {
    expect(total(normalizeAllocations(sample.map((slice) => ({ ...slice, percentage: slice.percentage / 2 })), 1, 0))).toBe(100);
    expect(total(normalizeAllocations(sample.map((slice) => ({ ...slice, percentage: slice.percentage * 2 })), 1, 0))).toBe(100);
  });

  it('respects locked slices', () => {
    const result = normalizeAllocations([
      { id: 'a', name: 'A', percentage: 25, locked: true },
      { id: 'b', name: 'B', percentage: 25 },
      { id: 'c', name: 'C', percentage: 25 },
    ], 1, 0);
    expect(result[0].percentage).toBe(25);
    expect(total(result)).toBe(100);
  });

  it('applies numeric and drag edits', () => {
    expect(applyNumericEdit(sample, 'planning', 40, 1, 0).map((slice) => slice.percentage)).toEqual([40, 51.4, 8.6]);
    expect(applyAdjacentDelta(sample, 0, 1, 5, 1, 0).map((slice) => slice.percentage)).toEqual([35, 55, 10]);
  });

  it('validates and describes geometry', () => {
    expect(validateAllocations([], 1).errors).toContain('At least one slice is required.');
    expect(angleDeltaDegrees(350, 10)).toBe(20);
    expect(describeArcSlice(160, 160, 130, 0, 90)).toMatch(/^M /);
  });
});
