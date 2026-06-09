import { describe, expect, it } from 'vitest';
import { aggregateProjectActivity, filterMonitoringPoints, isThresholdBreached } from '../../src/lib/charts/index.ts';

describe('chart utilities', () => {
  it('filters monitoring points by time range', () => {
    const points = [
      { timestamp: 1, values: { cpu: 1 } },
      { timestamp: 2, values: { cpu: 2 } },
      { timestamp: 3, values: { cpu: 3 } },
    ];
    expect(filterMonitoringPoints(points, { start: 2, end: 3 })).toHaveLength(2);
  });

  it('detects threshold breaches', () => {
    expect(isThresholdBreached(90, { value: 80, direction: 'above' })).toBe(true);
    expect(isThresholdBreached(30, { value: 40, direction: 'below' })).toBe(true);
  });

  it('aggregates project activity in cumulative mode', () => {
    const now = 120_000;
    const buckets = aggregateProjectActivity([
      { id: 'a', timestamp: 60_000, type: 'notes', action: 'created' },
      { id: 'b', timestamp: 120_000, type: 'notes', action: 'deleted' },
    ], ['notes'], { bucketSizeMs: 60_000, displayMode: 'cumulative', bucketCount: 3, now });
    expect(buckets.map((bucket) => bucket.cumulativeTotal)).toEqual([0, 1, 0]);
  });
});
