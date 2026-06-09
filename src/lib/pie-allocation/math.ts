export type Precision = 0 | 1 | 2;

export type PieAllocationSlice = {
  id: string;
  name: string;
  percentage: number;
  minPercentage?: number;
  maxPercentage?: number;
  locked?: boolean;
};

export type PieAllocationValidity = {
  valid: boolean;
  total: number;
  errors: string[];
};

const TARGET_TOTAL = 100;

function precisionScale(precision: Precision): number {
  return 10 ** precision;
}

function roundToPrecision(value: number, precision: Precision): number {
  const scale = precisionScale(precision);
  return Math.round((value + Number.EPSILON) * scale) / scale;
}

function sumPercentages(
  slices: PieAllocationSlice[],
  precision: Precision
): number {
  const scale = precisionScale(precision);
  const totalUnits = slices.reduce(
    (sum, slice) => sum + Math.round(slice.percentage * scale),
    0
  );
  return totalUnits / scale;
}

function getSliceMinimum(
  slice: PieAllocationSlice,
  minSlicePercentage: number
): number {
  return Math.max(minSlicePercentage, slice.minPercentage ?? 0);
}

function getSliceMaximum(slice: PieAllocationSlice): number {
  return slice.maxPercentage ?? TARGET_TOTAL;
}

function clampSliceValue(
  slice: PieAllocationSlice,
  requested: number,
  minSlicePercentage: number
): number {
  return Math.min(
    getSliceMaximum(slice),
    Math.max(getSliceMinimum(slice, minSlicePercentage), requested)
  );
}

function cloneSlices(slices: PieAllocationSlice[]): PieAllocationSlice[] {
  return slices.map((slice) => ({ ...slice }));
}

function assertBasicShape(slices: PieAllocationSlice[]): void {
  if (slices.length === 0) {
    throw new Error("Cannot normalize an empty allocation.");
  }

  const ids = new Set<string>();
  for (const slice of slices) {
    if (ids.has(slice.id)) {
      throw new Error("Slice IDs must be unique.");
    }
    ids.add(slice.id);
    if (!slice.name.trim()) {
      throw new Error("Every slice must have a name.");
    }
    if (!Number.isFinite(slice.percentage)) {
      throw new Error("Percentages must be finite numbers.");
    }
    if (slice.percentage < 0) {
      throw new Error("Percentages cannot be negative.");
    }
  }
}

function assertNormalizationPossible(
  slices: PieAllocationSlice[],
  minSlicePercentage: number
): void {
  let minTotal = 0;
  let maxTotal = 0;

  for (const slice of slices) {
    const min = getSliceMinimum(slice, minSlicePercentage);
    const max = getSliceMaximum(slice);
    if (min < 0 || max < 0 || min > max) {
      throw new Error("Slice constraints prevent a valid allocation.");
    }
    minTotal += min;
    maxTotal += max;
  }

  if (minTotal > TARGET_TOTAL || maxTotal < TARGET_TOTAL) {
    throw new Error("Slice constraints prevent a valid allocation.");
  }
}

function finalizeRounded(
  slices: PieAllocationSlice[],
  precision: Precision,
  minSlicePercentage: number
): PieAllocationSlice[] {
  const next = slices.map((slice) => ({
    ...slice,
    percentage: roundToPrecision(slice.percentage, precision)
  }));
  const diff = roundToPrecision(TARGET_TOTAL - sumPercentages(next, precision), precision);
  if (diff === 0) {
    return next;
  }

  const candidates = next
    .map((slice, index) => ({ slice, index }))
    .filter(({ slice }) => {
      if (slice.locked) return false;
      const adjusted = roundToPrecision(slice.percentage + diff, precision);
      return (
        adjusted >= getSliceMinimum(slice, minSlicePercentage) &&
        adjusted <= getSliceMaximum(slice)
      );
    })
    .sort((a, b) => slices[b.index].percentage - slices[a.index].percentage);

  if (candidates.length === 0) {
    throw new Error("Locked slices prevent a valid redistribution.");
  }

  const target = candidates[0];
  next[target.index] = {
    ...target.slice,
    percentage: roundToPrecision(target.slice.percentage + diff, precision)
  };

  return next;
}

function distributeTarget(
  slices: PieAllocationSlice[],
  target: number,
  precision: Precision,
  minSlicePercentage: number,
  fixedIndexes: Set<number> = new Set()
): PieAllocationSlice[] {
  const next = cloneSlices(slices);
  let remaining = target;
  let active = next
    .map((slice, index) => ({ slice, index }))
    .filter(({ slice, index }) => !fixedIndexes.has(index) && !slice.locked)
    .map(({ index }) => index);

  for (const index of fixedIndexes) {
    remaining -= next[index].percentage;
  }

  next.forEach((slice, index) => {
    if (slice.locked && !fixedIndexes.has(index)) {
      remaining -= slice.percentage;
    }
  });

  while (active.length > 0) {
    const activeTotal = active.reduce(
      (sum, index) => sum + Math.max(0, next[index].percentage),
      0
    );
    const evenShare = remaining / active.length;
    let changed = false;
    const stillActive: number[] = [];

    for (const index of active) {
      const rawShare =
        activeTotal > 0
          ? (Math.max(0, next[index].percentage) / activeTotal) * remaining
          : evenShare;
      const min = getSliceMinimum(next[index], minSlicePercentage);
      const max = getSliceMaximum(next[index]);

      if (rawShare < min) {
        next[index].percentage = min;
        remaining -= min;
        changed = true;
      } else if (rawShare > max) {
        next[index].percentage = max;
        remaining -= max;
        changed = true;
      } else {
        next[index].percentage = rawShare;
        stillActive.push(index);
      }
    }

    if (!changed) {
      break;
    }
    active = stillActive;
  }

  return finalizeRounded(next, precision, minSlicePercentage);
}

export function normalizeAllocations(
  slices: PieAllocationSlice[],
  precision: Precision,
  minSlicePercentage: number
): PieAllocationSlice[] {
  const next = cloneSlices(slices);
  assertBasicShape(next);
  assertNormalizationPossible(next, minSlicePercentage);

  if (next.length === 1) {
    if (next[0].locked && roundToPrecision(next[0].percentage, precision) !== TARGET_TOTAL) {
      throw new Error("Locked slices prevent a valid redistribution.");
    }
    return [{ ...next[0], percentage: TARGET_TOTAL }];
  }

  const lockedTotal = next.reduce(
    (sum, slice) => sum + (slice.locked ? slice.percentage : 0),
    0
  );
  if (lockedTotal > TARGET_TOTAL) {
    throw new Error("Locked slices prevent a valid redistribution.");
  }

  const unlockedCount = next.filter((slice) => !slice.locked).length;
  if (unlockedCount === 0) {
    if (roundToPrecision(sumPercentages(next, precision), precision) !== TARGET_TOTAL) {
      throw new Error("Locked slices prevent a valid redistribution.");
    }
    return finalizeRounded(next, precision, minSlicePercentage);
  }

  return distributeTarget(next, TARGET_TOTAL, precision, minSlicePercentage);
}

export function validateAllocations(
  slices: PieAllocationSlice[],
  precision: Precision
): PieAllocationValidity {
  const errors: string[] = [];

  if (slices.length === 0) {
    errors.push("At least one slice is required.");
  }

  const ids = new Set<string>();
  for (const slice of slices) {
    if (ids.has(slice.id)) {
      errors.push("Slice IDs must be unique.");
      break;
    }
    ids.add(slice.id);
  }

  if (slices.some((slice) => !slice.name.trim())) {
    errors.push("Every slice must have a name.");
  }
  if (slices.some((slice) => !Number.isFinite(slice.percentage))) {
    errors.push("Percentages must be finite numbers.");
  }
  if (slices.some((slice) => slice.percentage < 0)) {
    errors.push("Percentages cannot be negative.");
  }

  for (const slice of slices) {
    if (!Number.isFinite(slice.percentage)) continue;
    if (slice.percentage < (slice.minPercentage ?? 0)) {
      errors.push(`Slice "${slice.name}" is below its minimum percentage.`);
    }
    if (slice.percentage > (slice.maxPercentage ?? TARGET_TOTAL)) {
      errors.push(`Slice "${slice.name}" is above its maximum percentage.`);
    }
  }

  const total = roundToPrecision(sumPercentages(slices, precision), precision);
  if (slices.length > 0 && Number.isFinite(total) && total !== TARGET_TOTAL) {
    errors.push("Total must equal 100.");
    if (slices.every((slice) => slice.locked)) {
      errors.push("Locked slices prevent a valid redistribution.");
    }
  }

  return {
    valid: errors.length === 0,
    total: Number.isFinite(total) ? total : 0,
    errors
  };
}

export function applyNumericEdit(
  slices: PieAllocationSlice[],
  sliceId: string,
  requestedPercentage: number,
  precision: Precision,
  minSlicePercentage: number
): PieAllocationSlice[] {
  const next = normalizeAllocations(slices, precision, minSlicePercentage);
  const editedIndex = next.findIndex((slice) => slice.id === sliceId);
  if (editedIndex === -1 || next[editedIndex].locked) {
    return next;
  }

  const edited = next[editedIndex];
  const requested = clampSliceValue(
    edited,
    Number.isFinite(requestedPercentage) ? requestedPercentage : edited.percentage,
    minSlicePercentage
  );
  if (requested === edited.percentage) {
    return next;
  }

  const siblings = next.filter((_, index) => index !== editedIndex && !next[index].locked);
  if (siblings.length === 0) {
    return next;
  }

  next[editedIndex] = { ...edited, percentage: requested };
  return distributeTarget(
    next,
    TARGET_TOTAL,
    precision,
    minSlicePercentage,
    new Set([editedIndex])
  );
}

export function applyAdjacentDelta(
  slices: PieAllocationSlice[],
  leftIndex: number,
  rightIndex: number,
  deltaPercentage: number,
  precision: Precision,
  minSlicePercentage: number
): PieAllocationSlice[] {
  const next = normalizeAllocations(slices, precision, minSlicePercentage);
  const left = next[leftIndex];
  const right = next[rightIndex];
  if (!left || !right || left.locked || right.locked) {
    return next;
  }

  const maxPositive = Math.min(
    getSliceMaximum(left) - left.percentage,
    right.percentage - getSliceMinimum(right, minSlicePercentage)
  );
  const maxNegative = -Math.min(
    left.percentage - getSliceMinimum(left, minSlicePercentage),
    getSliceMaximum(right) - right.percentage
  );
  const delta = Math.max(maxNegative, Math.min(maxPositive, deltaPercentage));

  next[leftIndex] = {
    ...left,
    percentage: roundToPrecision(left.percentage + delta, precision)
  };
  next[rightIndex] = {
    ...right,
    percentage: roundToPrecision(right.percentage - delta, precision)
  };

  return finalizeRounded(next, precision, minSlicePercentage);
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number
): { x: number; y: number } {
  const angleRadians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY + radius * Math.sin(angleRadians)
  };
}

export function describeArcSlice(
  centerX: number,
  centerY: number,
  radius: number,
  startAngleDegrees: number,
  endAngleDegrees: number
): string {
  const span = Math.abs(endAngleDegrees - startAngleDegrees);
  if (span >= 359.999) {
    const top = polarToCartesian(centerX, centerY, radius, 0);
    const bottom = polarToCartesian(centerX, centerY, radius, 180);
    return [
      `M ${centerX} ${centerY}`,
      `L ${top.x} ${top.y}`,
      `A ${radius} ${radius} 0 1 1 ${bottom.x} ${bottom.y}`,
      `A ${radius} ${radius} 0 1 1 ${top.x} ${top.y}`,
      "Z"
    ].join(" ");
  }

  const start = polarToCartesian(centerX, centerY, radius, endAngleDegrees);
  const end = polarToCartesian(centerX, centerY, radius, startAngleDegrees);
  const largeArcFlag = span > 180 ? "1" : "0";

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z"
  ].join(" ");
}

export function angleDeltaDegrees(
  previousAngleDegrees: number,
  nextAngleDegrees: number
): number {
  return ((nextAngleDegrees - previousAngleDegrees + 540) % 360) - 180;
}

export function pointToAngleDegrees(
  x: number,
  y: number,
  centerX: number,
  centerY: number
): number {
  const degrees = (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI + 90;
  return degrees < 0 ? degrees + 360 : degrees;
}
