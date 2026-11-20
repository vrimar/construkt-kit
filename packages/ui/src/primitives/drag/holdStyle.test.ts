import { afterEach, expect, it } from "vitest";

import { holdStyle } from "./holdStyle";

afterEach(() => document.documentElement.removeAttribute("style"));

it("puts back the inline value the element had once the last holder lets go", () => {
  const { style } = document.documentElement;
  style.setProperty("cursor", "progress", "important");

  const releaseOuter = holdStyle(document.documentElement, "cursor", "ew-resize");
  const releaseInner = holdStyle(document.documentElement, "cursor", "ew-resize");
  releaseInner();
  expect(style.getPropertyValue("cursor")).toBe("ew-resize");

  releaseOuter();
  expect([style.getPropertyValue("cursor"), style.getPropertyPriority("cursor")]).toEqual([
    "progress",
    "important",
  ]);
});
