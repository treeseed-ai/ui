import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AtlasWorkdaySummary } from "../../../src/react/agent-atlas/AtlasWorkdaySummary.tsx";
import { DefinitionProvenance } from "../../../src/react/agent-atlas/AtlasOverlay.tsx";

describe("Atlas workday summary", () => {
  it("makes a terminal failure understandable and links to bounded evidence", () => {
    const onOpenEvents = vi.fn();
    const onOpenAssignments = vi.fn();
    render(<AtlasWorkdaySummary
      timeZone="America/New_York"
      onOpenEvents={onOpenEvents}
      onOpenAssignments={onOpenAssignments}
      summary={{
        id: "run-one",
        title: "Short human acceptance",
        status: "cancelled",
        startedAt: "2026-08-08T12:00:00.000Z",
        finishedAt: "2026-08-08T12:05:00.000Z",
        assignments: { total: 1, active: 0, completed: 0, failed: 1, cancelled: 0 },
        eventCount: 7,
        message: "Short human acceptance was cancelled. 1 assignment needs attention.",
      }}
    />);
    expect(screen.getByRole("region", { name: "Selected workday status" })).toHaveAttribute("data-tone", "error");
    expect(screen.getByText("Short human acceptance was cancelled. 1 assignment needs attention.")).toBeInTheDocument();
    expect(screen.getByText("0/1 complete")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Review assignments" }));
    fireEvent.click(screen.getByRole("button", { name: "Review events" }));
    expect(onOpenAssignments).toHaveBeenCalledOnce();
    expect(onOpenEvents).toHaveBeenCalledOnce();
  });

  it("identifies the immutable definition retained by historical playback", () => {
    const revision = "6261f588dcba499452240f3b1f3ac0f1881edb45";
    render(<DefinitionProvenance revision={revision} historical />);
    const provenance = screen.getByRole("region", { name: "Historical agent definition" });
    expect(provenance).toHaveAttribute("data-mode", "historical");
    expect(provenance).toHaveTextContent("Captured for this workday");
    expect(provenance).toHaveTextContent(revision);
    expect(provenance).toHaveTextContent("Later agent edits do not rewrite this evidence");
  });
});
