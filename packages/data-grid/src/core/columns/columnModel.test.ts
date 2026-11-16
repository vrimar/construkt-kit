import { expect, test } from "vitest";

import { ColumnModel } from "./columnModel";

test("a flex column clamped at maxWidth gives its excess to the other flex columns", () => {
  const model = new ColumnModel(
    [
      { id: "fixed", width: 200 },
      { id: "capped", flex: 1, maxWidth: 150 },
      { id: "free", flex: 1 },
    ],
    { columnSizing: {}, columnPinning: {}, columnVisibility: {} },
    1000,
  );

  expect(model.leaves.map((leaf) => leaf.width)).toEqual([200, 150, 650]);
});
