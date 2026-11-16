import { expect, test } from "vitest";

import { OffsetIndex } from "./offsetIndex";

test("indexAt finds the row starting at an offset, and the previous row just before it", () => {
  const index = new OffsetIndex();
  index.reset(200, (i) => 20 + (i % 7) * 3);

  for (let i = 1; i < index.count; i++) {
    expect(index.indexAt(index.offsetOf(i))).toBe(i);
    expect(index.indexAt(index.offsetOf(i) - 0.5)).toBe(i - 1);
  }
});
