import { useEffect, useState } from "react";
import "../../../styles/charts.css";
import { ActivityType, BucketSizeMs, BucketedActivity, DisplayMode, ProjectActivityEvent, activityTypes, floorToBucket } from './activity-type.tsx';

function emptyCounts(): Record<ActivityType, number> {
  return Object.fromEntries(activityTypes.map((type) => [type, 0])) as Record<ActivityType, number>;
}

export function aggregateEvents(
  events: ProjectActivityEvent[],
  bucketSizeMs: BucketSizeMs,
  displayMode: DisplayMode
): BucketedActivity[] {
  const now = Date.now();
  const bucketCount = 24;
  const currentBucketStart = floorToBucket(now, bucketSizeMs);
  const firstBucketStart = currentBucketStart - (bucketCount - 1) * bucketSizeMs;
  const buckets = new Map<
    number,
    {
      createdCounts: Record<ActivityType, number>;
      updatedCounts: Record<ActivityType, number>;
      deletedCounts: Record<ActivityType, number>;
      created: number;
      updated: number;
      deleted: number;
    }
  >();

  for (let index = 0; index < bucketCount; index += 1) {
    buckets.set(firstBucketStart + index * bucketSizeMs, {
      createdCounts: emptyCounts(),
      updatedCounts: emptyCounts(),
      deletedCounts: emptyCounts(),
      created: 0,
      updated: 0,
      deleted: 0
    });
  }

  for (const event of events) {
    const bucketStart = floorToBucket(event.timestamp, bucketSizeMs);
    if (bucketStart < firstBucketStart || bucketStart > currentBucketStart) {
      continue;
    }

    const bucket =
      buckets.get(bucketStart) ??
      {
        createdCounts: emptyCounts(),
        updatedCounts: emptyCounts(),
        deletedCounts: emptyCounts(),
        created: 0,
        updated: 0,
        deleted: 0
      };

    if (event.action === "created") {
      bucket.createdCounts[event.type] += 1;
      bucket.created += 1;
    } else if (event.action === "updated") {
      bucket.updatedCounts[event.type] += 1;
      bucket.updated += 1;
    } else {
      bucket.deletedCounts[event.type] += 1;
      bucket.deleted += 1;
    }

    buckets.set(bucketStart, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([left], [right]) => left - right)
    .reduce<{
      runningTotals: Record<ActivityType, number>;
      rows: BucketedActivity[];
    }>(
      (accumulator, [bucketStart, bucket]) => {
        const activityByType = activityTypes.reduce<Record<ActivityType, number>>(
          (result, type) => ({
            ...result,
            [type]: bucket.createdCounts[type] + bucket.updatedCounts[type] + bucket.deletedCounts[type]
          }),
          emptyCounts()
        );

        const nextRunningTotals = activityTypes.reduce<Record<ActivityType, number>>(
          (result, type) => ({
            ...result,
            [type]: accumulator.runningTotals[type] + activityByType[type]
          }),
          emptyCounts()
        );

        const source = displayMode === "cumulative" ? nextRunningTotals : activityByType;
        const values = activityTypes.reduce<Record<ActivityType, number>>(
          (result, type) => ({
            ...result,
            [type]: source[type]
          }),
          emptyCounts()
        );
        const activity = bucket.created + bucket.updated + bucket.deleted;
        const cumulativeActivity = activityTypes.reduce(
          (sum, type) => sum + nextRunningTotals[type],
          0
        );

        accumulator.rows.push({
          bucketStart,
          bucketEnd: bucketStart + bucketSizeMs,
          ...values,
          created: bucket.created,
          updated: bucket.updated,
          deleted: bucket.deleted,
          activity,
          total: displayMode === "cumulative" ? cumulativeActivity : activity,
          net: bucket.created - bucket.deleted,
          cumulativeTotal: cumulativeActivity,
          createdByType: bucket.createdCounts,
          updatedByType: bucket.updatedCounts,
          deletedByType: bucket.deletedCounts,
          activityByType
        });

        return {
          runningTotals: nextRunningTotals,
          rows: accumulator.rows
        };
      },
      {
        runningTotals: emptyCounts(),
        rows: []
      }
    ).rows;
}

export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
