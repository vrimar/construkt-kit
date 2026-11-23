import { expect, it } from "vitest";

import { RangeSelection } from "./RangeSelection";

const entriesOf = (...values: string[]) => values.map((value) => ({ value, disabled: false }));

it("has no range to extend once its anchor leaves the entries", () => {
  const range = new RangeSelection();
  range.reset("b");

  expect(range.extendTo(entriesOf("a", "c", "d"), ["b"], "d")).toBeNull();
});

it("drops what its last range selected once the far end of that range is hidden", () => {
  const range = new RangeSelection();
  range.reset("a");
  const selected = range.extendTo(entriesOf("a", "b", "c"), [], "c") ?? [];

  expect(range.extendTo(entriesOf("a", "b"), selected, "b")).toEqual(["a", "b"]);
});
