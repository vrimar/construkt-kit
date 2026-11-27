import path from "node:path";

import { expect, test } from "vitest";

import { routeUrlOf } from "./routes";

test("a hand-written route's URL drops pathless folders and follows dot nesting and non-nested suffixes", () => {
  const root = path.join("/site", "src", "routes");

  expect(routeUrlOf(root, path.join(root, "_site", "docs", "api.ref_.tsx"))).toBe("/docs/api/ref");
});
