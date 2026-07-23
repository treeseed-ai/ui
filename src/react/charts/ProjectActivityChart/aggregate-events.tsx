import { useEffect, useState } from "react";
import "../../../styles/charts.css";
import { ActivityType, BucketSizeMs, BucketedActivity, DisplayMode, ProjectActivityEvent, activityTypes, floorToBucket } from './activity-type.tsx';

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
      deletedCounts: Record<ActivityType, number>;
      created: number;
      deleted: number;
    }
  >();

  for (let index = 0; index < bucketCount; index += 1) {
    buckets.set(firstBucketStart + index * bucketSizeMs, {
      createdCounts: {
        questions: 0,
        objectives: 0,
        notes: 0,
        proposals: 0,
        decisions: 0
      },
      deletedCounts: {
        questions: 0,
        objectives: 0,
        notes: 0,
        proposals: 0,
        decisions: 0
      },
      created: 0,
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
        createdCounts: {
          questions: 0,
          objectives: 0,
          notes: 0,
          proposals: 0,
          decisions: 0
        },
        deletedCounts: {
          questions: 0,
          objectives: 0,
          notes: 0,
          proposals: 0,
          decisions: 0
        },
        created: 0,
        deleted: 0
      };

    if (event.action === "created") {
      bucket.createdCounts[event.type] += 1;
      bucket.created += 1;
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
        const netByType = activityTypes.reduce<Record<ActivityType, number>>(
          (result, type) => ({
            ...result,
            [type]: bucket.createdCounts[type] - bucket.deletedCounts[type]
          }),
          {
            questions: 0,
            objectives: 0,
            notes: 0,
            proposals: 0,
            decisions: 0
          }
        );

        const nextRunningTotals = activityTypes.reduce<Record<ActivityType, number>>(
          (result, type) => ({
            ...result,
            [type]: Math.max(0, accumulator.runningTotals[type] + netByType[type])
          }),
          {
            questions: 0,
            objectives: 0,
            notes: 0,
            proposals: 0,
            decisions: 0
          }
        );

        const source = displayMode === "cumulative" ? nextRunningTotals : netByType;
        const values = activityTypes.reduce<Record<ActivityType, number>>(
          (result, type) => ({
            ...result,
            [type]: source[type]
          }),
          {
            questions: 0,
            objectives: 0,
            notes: 0,
            proposals: 0,
            decisions: 0
          }
        );

        accumulator.rows.push({
          bucketStart,
          bucketEnd: bucketStart + bucketSizeMs,
          ...values,
          created: bucket.created,
          deleted: bucket.deleted,
          total:
            displayMode === "cumulative"
              ? activityTypes.reduce(
                  (sum, type) => sum + nextRunningTotals[type],
                  0
                )
              : bucket.created - bucket.deleted,
          net: bucket.created - bucket.deleted,
          cumulativeTotal: activityTypes.reduce(
            (sum, type) => sum + nextRunningTotals[type],
            0
          ),
          createdByType: bucket.createdCounts,
          deletedByType: bucket.deletedCounts,
          netByType
        });

        return {
          runningTotals: nextRunningTotals,
          rows: accumulator.rows
        };
      },
      {
        runningTotals: {
          questions: 0,
          objectives: 0,
          notes: 0,
          proposals: 0,
          decisions: 0
        },
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
