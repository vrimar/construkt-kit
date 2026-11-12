import { describe, expect, it } from "vitest";

import { getSortableInstruction } from "./sortableLogic";

describe("getSortableInstruction with drop-onto", () => {
  it("splits a vertical target into before, onto and after thirds", () => {
    const rect = { top: 100, left: 0, width: 200, height: 30 };
    const at = (y: number) =>
      getSortableInstruction({ client: { x: 50, y }, rect, axis: "vertical", allowOnto: true });

    expect(at(105)).toEqual({ type: "reorder", edge: "before" });
    expect(at(115)).toEqual({ type: "onto" });
    expect(at(125)).toEqual({ type: "reorder", edge: "after" });
  });

  it("splits a horizontal target into before, onto and after thirds", () => {
    const rect = { top: 0, left: 100, width: 30, height: 200 };
    const at = (x: number) =>
      getSortableInstruction({ client: { x, y: 50 }, rect, axis: "horizontal", allowOnto: true });

    expect(at(105)).toEqual({ type: "reorder", edge: "before" });
    expect(at(115)).toEqual({ type: "onto" });
    expect(at(125)).toEqual({ type: "reorder", edge: "after" });
  });
});
