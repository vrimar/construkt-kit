import { describe, expect, it } from "vitest";

import { matchesSubset } from "./net";
import { operationTable } from "./operations";

describe("operationTable", () => {
  it("prefers a literal path over a parameterised one, whatever order the spec lists them", () => {
    const table = operationTable([
      { method: "POST", path: "/api/items/{id}", read: false },
      { method: "POST", path: "/api/items/search", read: true },
    ]);

    expect(table.find("post", "/api/items/search")?.read).toBe(true);
    expect(table.find("POST", "/api/items/12")?.path).toBe("/api/items/{id}");
  });
});

describe("matchesSubset", () => {
  it("matches objects by the fields given but arrays only at the same length", () => {
    expect(matchesSubset({ a: 1, b: { c: 2, d: 3 } }, { b: { c: 2 } })).toBe(true);
    expect(matchesSubset({ ids: [1, 2, 3] }, { ids: [1, 2] })).toBe(false);
  });
});
