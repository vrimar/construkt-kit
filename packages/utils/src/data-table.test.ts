import { describe, expect, it } from "vitest";

import {
  type NumberFilterValue,
  matchesNumberFilter,
  parseNumberFilter,
  serializeNumberFilter,
} from "./data-table";

const comparisons: NumberFilterValue[] = [
  { operator: "eq", value: -3.25 },
  { operator: "gt", value: -3.25 },
  { operator: "gte", value: -3.25 },
  { operator: "lt", value: -3.25 },
  { operator: "lte", value: -3.25 },
];

describe("serializeNumberFilter", () => {
  it("serializes comparison operators as op:value", () => {
    expect(serializeNumberFilter({ operator: "eq", value: 5 })).toBe("eq:5");
    expect(serializeNumberFilter({ operator: "gte", value: -2.5 })).toBe("gte:-2.5");
    expect(serializeNumberFilter({ operator: "lt", value: 1e6 })).toBe("lt:1000000");
  });

  it("serializes between with the <> separator", () => {
    expect(serializeNumberFilter({ operator: "between", value: 100, to: 200 })).toBe(
      "between:100<>200",
    );
    expect(serializeNumberFilter({ operator: "between", value: -10, to: -5 })).toBe(
      "between:-10<>-5",
    );
  });
});

describe("parseNumberFilter", () => {
  it("round-trips every operator", () => {
    for (const filter of [...comparisons, { operator: "between", value: -3.25, to: 7 } as const]) {
      expect(parseNumberFilter(serializeNumberFilter(filter))).toEqual(filter);
    }
  });

  it("accepts a bare number as eq", () => {
    expect(parseNumberFilter("5")).toEqual({ operator: "eq", value: 5 });
    expect(parseNumberFilter("-0.5")).toEqual({ operator: "eq", value: -0.5 });
    expect(parseNumberFilter("1e3")).toEqual({ operator: "eq", value: 1000 });
  });

  it("returns undefined for malformed input", () => {
    const malformed = [
      "",
      ":5",
      "gte:",
      "gte:abc",
      "foo:1",
      "between:1",
      "between:1<>x",
      "between:1<>2<>3",
      "between:1<>undefined",
      "Infinity",
      "gt:Infinity",
    ];

    for (const raw of malformed) expect(parseNumberFilter(raw)).toBeUndefined();
  });
});

describe("matchesNumberFilter", () => {
  it("compares with each operator", () => {
    expect(matchesNumberFilter(5, { operator: "eq", value: 5 })).toBe(true);
    expect(matchesNumberFilter(4, { operator: "eq", value: 5 })).toBe(false);
    expect(matchesNumberFilter(6, { operator: "gt", value: 5 })).toBe(true);
    expect(matchesNumberFilter(5, { operator: "gt", value: 5 })).toBe(false);
    expect(matchesNumberFilter(5, { operator: "gte", value: 5 })).toBe(true);
    expect(matchesNumberFilter(4, { operator: "lt", value: 5 })).toBe(true);
    expect(matchesNumberFilter(5, { operator: "lt", value: 5 })).toBe(false);
    expect(matchesNumberFilter(5, { operator: "lte", value: 5 })).toBe(true);
  });

  it("treats between as inclusive on both ends", () => {
    const between: NumberFilterValue = { operator: "between", value: 10, to: 20 };

    expect(matchesNumberFilter(10, between)).toBe(true);
    expect(matchesNumberFilter(20, between)).toBe(true);
    expect(matchesNumberFilter(15, between)).toBe(true);
    expect(matchesNumberFilter(9.99, between)).toBe(false);
    expect(matchesNumberFilter(20.01, between)).toBe(false);
  });
});
