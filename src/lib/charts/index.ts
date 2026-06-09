export type ThresholdDirection = 'above' | 'below';

export type MetricThreshold = {
  value: number;
  direction: ThresholdDirection;
};

export type MonitoringMetricPoint = {
  timestamp: number;
  values: Record<string, number>;
};

export type ProjectActivityEvent = {
  id: string;
  timestamp: number;
  type: string;
  action: 'created' | 'deleted';
};

export type BucketedActivity = {
  bucketStart: number;
  bucketEnd: number;
  created: number;
  deleted: number;
  total: number;
  net: number;
  cumulativeTotal: number;
  valuesByType: Record<string, number>;
};

export function filterMonitoringPoints(
  points: MonitoringMetricPoint[],
  range?: { start: number; end: number } | null,
) {
  if (!range) return points;
  return points.filter((point) => point.timestamp >= range.start && point.timestamp <= range.end);
}

export function isThresholdBreached(value: number, threshold?: MetricThreshold) {
  if (!threshold) return false;
  return threshold.direction === 'above' ? value >= threshold.value : value <= threshold.value;
}

export function floorToBucket(timestamp: number, bucketSizeMs: number) {
  return Math.floor(timestamp / bucketSizeMs) * bucketSizeMs;
}

export function aggregateProjectActivity(
  events: ProjectActivityEvent[],
  activityTypes: string[],
  options: {
    bucketSizeMs: number;
    displayMode: 'cumulative' | 'period';
    bucketCount?: number;
    now?: number;
  },
): BucketedActivity[] {
  const bucketCount = options.bucketCount ?? 24;
  const currentBucketStart = floorToBucket(options.now ?? Date.now(), options.bucketSizeMs);
  const firstBucketStart = currentBucketStart - (bucketCount - 1) * options.bucketSizeMs;
  const buckets = new Map<number, { created: number; deleted: number; byType: Record<string, number> }>();

  for (let index = 0; index < bucketCount; index += 1) {
    buckets.set(firstBucketStart + index * options.bucketSizeMs, {
      created: 0,
      deleted: 0,
      byType: Object.fromEntries(activityTypes.map((type) => [type, 0])),
    });
  }

  for (const event of events) {
    const bucketStart = floorToBucket(event.timestamp, options.bucketSizeMs);
    const bucket = buckets.get(bucketStart);
    if (!bucket) continue;
    if (event.action === 'created') {
      bucket.created += 1;
      bucket.byType[event.type] = (bucket.byType[event.type] ?? 0) + 1;
    } else {
      bucket.deleted += 1;
      bucket.byType[event.type] = (bucket.byType[event.type] ?? 0) - 1;
    }
  }

  let cumulativeTotal = 0;
  const cumulativeByType = Object.fromEntries(activityTypes.map((type) => [type, 0]));

  return Array.from(buckets.entries())
    .sort(([left], [right]) => left - right)
    .map(([bucketStart, bucket]) => {
      const net = bucket.created - bucket.deleted;
      cumulativeTotal = Math.max(0, cumulativeTotal + net);
      for (const type of activityTypes) {
        cumulativeByType[type] = Math.max(0, (cumulativeByType[type] ?? 0) + (bucket.byType[type] ?? 0));
      }
      const valuesByType = options.displayMode === 'cumulative'
        ? { ...cumulativeByType }
        : { ...bucket.byType };
      return {
        bucketStart,
        bucketEnd: bucketStart + options.bucketSizeMs,
        created: bucket.created,
        deleted: bucket.deleted,
        total: bucket.created + bucket.deleted,
        net,
        cumulativeTotal,
        valuesByType,
      };
    });
}
