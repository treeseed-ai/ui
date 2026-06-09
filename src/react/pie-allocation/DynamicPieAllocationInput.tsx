import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import "../../styles/pie-allocation.css";
import {
  angleDeltaDegrees,
  applyAdjacentDelta,
  applyNumericEdit,
  describeArcSlice,
  normalizeAllocations,
  pointToAngleDegrees,
  validateAllocations,
  type PieAllocationSlice,
  type PieAllocationValidity,
  type Precision
} from "../../lib/pie-allocation/math";

export type { PieAllocationSlice, PieAllocationValidity };

export type DynamicPieAllocationInputProps = {
  name: string;
  initialValue: PieAllocationSlice[];
  minSlicePercentage?: number;
  precision?: Precision;
  disabled?: boolean;
  allowNumericEditing?: boolean;
  allowDragEditing?: boolean;
  allowAddRemove?: boolean;
  ariaLabel?: string;
  palette?: string[];
  onChange?: (
    slices: PieAllocationSlice[],
    validity: PieAllocationValidity
  ) => void;
};

const size = 320;
const center = 160;
const radius = 130;
const defaultPalette = [
  "#2563eb",
  "#0f766e",
  "#ca8a04",
  "#c026d3",
  "#dc2626",
  "#16a34a",
  "#7c3aed",
  "#ea580c",
  "#0891b2",
  "#4f46e5",
  "#be123c",
  "#65a30d"
];

type DragState = {
  boundaryIndex: number;
  pointerId: number;
  startAngle: number;
  startSlices: PieAllocationSlice[];
};

function toInputValue(value: number, precision: Precision): string {
  return value.toFixed(precision);
}

function toSubmittedSlices(slices: PieAllocationSlice[]) {
  return slices.map(({ id, name, percentage }) => ({ id, name, percentage }));
}

function getBoundaryAngle(slices: PieAllocationSlice[], boundaryIndex: number): number {
  return slices
    .slice(0, boundaryIndex + 1)
    .reduce((sum, slice) => sum + slice.percentage * 3.6, 0);
}

function getPointOnCircle(angle: number): { x: number; y: number } {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians)
  };
}

export default function DynamicPieAllocationInput({
  name,
  initialValue,
  minSlicePercentage = 0,
  precision = 1,
  disabled = false,
  allowNumericEditing = true,
  allowDragEditing = true,
  allowAddRemove: _allowAddRemove = false,
  ariaLabel = "Percentage allocation pie chart",
  palette = defaultPalette,
  onChange
}: DynamicPieAllocationInputProps) {
  const initial = useMemo(() => {
    try {
      return {
        slices: normalizeAllocations(initialValue, precision, minSlicePercentage),
        error: null
      };
    } catch (error) {
      return {
        slices: [],
        error: error instanceof Error ? error.message : "Invalid allocation."
      };
    }
  }, [initialValue, minSlicePercentage, precision]);

  const [slices, setSlices] = useState<PieAllocationSlice[]>(initial.slices);
  const [initializationError, setInitializationError] = useState<string | null>(
    initial.error
  );
  const [hydrated, setHydrated] = useState(false);
  const dragStateRef = useRef<DragState | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    setSlices(initial.slices);
    setInitializationError(initial.error);
  }, [initial]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const validity = useMemo(() => {
    const base = validateAllocations(slices, precision);
    if (initializationError) {
      return {
        valid: false,
        total: base.total,
        errors: [initializationError, ...base.errors]
      };
    }
    return base;
  }, [initializationError, precision, slices]);

  useEffect(() => {
    onChange?.(slices, validity);
  }, [onChange, slices, validity]);

  const geometry = useMemo(() => {
    let startAngle = 0;
    return slices.map((slice, index) => {
      const endAngle = startAngle + slice.percentage * 3.6;
      const item = {
        slice,
        index,
        startAngle,
        endAngle,
        color: palette[index % palette.length]
      };
      startAngle = endAngle;
      return item;
    });
  }, [slices]);

  const updateSlices = (next: PieAllocationSlice[]) => {
    setSlices(next);
    setInitializationError(null);
  };

  const handleNumericChange = (sliceId: string, value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    try {
      updateSlices(
        applyNumericEdit(slices, sliceId, parsed, precision, minSlicePercentage)
      );
    } catch (error) {
      setInitializationError(error instanceof Error ? error.message : "Invalid allocation.");
    }
  };

  const getClientAngle = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * size;
    const y = ((clientY - rect.top) / rect.height) * size;
    return pointToAngleDegrees(x, y, center, center);
  };

  const getPointerAngle = (event: ReactPointerEvent<SVGElement>) =>
    getClientAngle(event.clientX, event.clientY);

  const processDrag = (clientX: number, clientY: number, pointerId: number) => {
    const activeDrag = dragStateRef.current;
    if (!activeDrag || activeDrag.pointerId !== pointerId) return;
    const deltaDegrees = angleDeltaDegrees(
      activeDrag.startAngle,
      getClientAngle(clientX, clientY)
    );
    const deltaPercentage = (deltaDegrees / 360) * 100;
    const rightIndex = (activeDrag.boundaryIndex + 1) % activeDrag.startSlices.length;
    try {
      updateSlices(
        applyAdjacentDelta(
          activeDrag.startSlices,
          activeDrag.boundaryIndex,
          rightIndex,
          deltaPercentage,
          precision,
          minSlicePercentage
        )
      );
    } catch (error) {
      setInitializationError(error instanceof Error ? error.message : "Invalid allocation.");
    }
  };

  const startDrag = (
    boundaryIndex: number,
    pointerId: number,
    startAngle: number
  ) => {
    dragStateRef.current = {
      boundaryIndex,
      pointerId,
      startAngle,
      startSlices: slices
    };
  };

  const handlePointerDown = (
    event: ReactPointerEvent<SVGCircleElement>,
    boundaryIndex: number
  ) => {
    if (disabled || !allowDragEditing) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic PointerEvents in tests may not have an active native pointer.
    }
    startDrag(boundaryIndex, event.pointerId, getPointerAngle(event));
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGElement>) => {
    processDrag(event.clientX, event.clientY, event.pointerId);
  };

  const handlePointerEnd = (event: ReactPointerEvent<SVGElement>) => {
    if (dragStateRef.current?.pointerId === event.pointerId) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may belong to the original handle while this bubbles on SVG.
      }
      dragStateRef.current = null;
    }
  };

  const handleMouseDown = (
    event: ReactMouseEvent<SVGCircleElement>,
    boundaryIndex: number
  ) => {
    if (disabled || !allowDragEditing || dragStateRef.current) return;
    startDrag(boundaryIndex, -1, getClientAngle(event.clientX, event.clientY));
  };

  const handleMouseMove = (event: ReactMouseEvent<SVGSVGElement>) => {
    processDrag(event.clientX, event.clientY, -1);
  };

  const handleMouseUp = () => {
    if (dragStateRef.current?.pointerId === -1) {
      dragStateRef.current = null;
    }
  };

  const hiddenValue = validity.valid ? JSON.stringify(toSubmittedSlices(slices)) : "[]";

  useEffect(() => {
    const handleWindowPointerMove = (event: PointerEvent) => {
      processDrag(event.clientX, event.clientY, event.pointerId);
    };
    const handleWindowPointerEnd = (event: PointerEvent) => {
      if (dragStateRef.current?.pointerId === event.pointerId) {
        dragStateRef.current = null;
      }
    };
    const handleWindowMouseMove = (event: MouseEvent) => {
      processDrag(event.clientX, event.clientY, -1);
    };
    const handleWindowMouseEnd = () => {
      if (dragStateRef.current?.pointerId === -1) {
        dragStateRef.current = null;
      }
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerEnd);
    window.addEventListener("pointercancel", handleWindowPointerEnd);
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseEnd);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerEnd);
      window.removeEventListener("pointercancel", handleWindowPointerEnd);
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseEnd);
    };
  });

  return (
    <div
      className="dynamic-pie-allocation"
      data-hydrated={hydrated ? "true" : "false"}
      data-testid="dynamic-pie-allocation"
    >
      <input
        data-testid="allocation-hidden-input"
        name={name}
        type="hidden"
        value={hiddenValue}
      />

      <div className="dynamic-pie-allocation__body">
        <div className="dynamic-pie-allocation__chart">
          <svg
            aria-label={ariaLabel}
            className="dynamic-pie-allocation__svg"
            data-testid="pie-svg"
            onPointerCancel={handlePointerEnd}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            ref={svgRef}
            role="img"
            viewBox={`0 0 ${size} ${size}`}
          >
            {geometry.map(({ slice, startAngle, endAngle, color }) =>
              slice.percentage > 0 ? (
                <path
                  className="dynamic-pie-allocation__slice"
                  d={describeArcSlice(center, center, radius, startAngle, endAngle)}
                  data-testid={`slice-path-${slice.id}`}
                  fill={color}
                  key={slice.id}
                >
                  <title>{`${slice.name} ${toInputValue(slice.percentage, precision)}%`}</title>
                </path>
              ) : null
            )}
            {allowDragEditing && !disabled && slices.length > 1
              ? slices.map((slice, boundaryIndex) => {
                  const rightIndex = (boundaryIndex + 1) % slices.length;
                  const rightSlice = slices[rightIndex];
                  const isWrapBoundary = rightIndex === 0;
                  const canMoveBoundary =
                    !isWrapBoundary &&
                    !slice.locked &&
                    !rightSlice.locked &&
                    slice.percentage > 0 &&
                    rightSlice.percentage > 0;
                  if (!canMoveBoundary) return null;
                  const point = getPointOnCircle(getBoundaryAngle(slices, boundaryIndex));
                  return (
                    <circle
                      aria-label={`Resize boundary between ${slice.name} and ${rightSlice.name}`}
                      className="dynamic-pie-allocation__handle"
                      cx={point.x}
                      cy={point.y}
                      data-testid={`slice-handle-${boundaryIndex}`}
                      key={`${slice.id}-${rightSlice.id}`}
                      onMouseDown={(event) => handleMouseDown(event, boundaryIndex)}
                      onPointerDown={(event) => handlePointerDown(event, boundaryIndex)}
                      r="7"
                      role="slider"
                      tabIndex={0}
                    />
                  );
                })
              : null}
          </svg>
        </div>

        <div className="dynamic-pie-allocation__legend">
          {slices.map((slice, index) => (
            <div className="dynamic-pie-allocation__row" key={slice.id}>
              <span
                aria-hidden="true"
                className="dynamic-pie-allocation__swatch"
                style={{ backgroundColor: palette[index % palette.length] }}
              />
              <label
                className="dynamic-pie-allocation__label"
                htmlFor={`slice-input-${slice.id}`}
              >
                {slice.name}
              </label>
              {allowNumericEditing ? (
                <input
                  className="dynamic-pie-allocation__input"
                  data-testid={`slice-input-${slice.id}`}
                  disabled={disabled || slice.locked}
                  id={`slice-input-${slice.id}`}
                  inputMode="decimal"
                  max={slice.maxPercentage ?? 100}
                  min={Math.max(minSlicePercentage, slice.minPercentage ?? 0)}
                  onBlur={(event) => handleNumericChange(slice.id, event.currentTarget.value)}
                  onChange={(event) => handleNumericChange(slice.id, event.currentTarget.value)}
                  step={1 / 10 ** precision}
                  type="number"
                  value={toInputValue(slice.percentage, precision)}
                />
              ) : (
                <span data-testid={`slice-input-${slice.id}`}>
                  {toInputValue(slice.percentage, precision)}
                </span>
              )}
              <span className="dynamic-pie-allocation__percent">%</span>
              {slice.locked ? (
                <span className="dynamic-pie-allocation__locked">Locked</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {!validity.valid ? (
        <div className="dynamic-pie-allocation__status">
          <div
            aria-live="polite"
            className="dynamic-pie-allocation__validation dynamic-pie-allocation__validation--error"
            data-testid="allocation-validation"
          >
            {validity.errors.join(" ")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
