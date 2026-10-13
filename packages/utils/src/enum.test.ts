import { describe, expect, expectTypeOf, it } from "vitest";

import { enumToEntries, isEnumKey, toListItems, toNumericListItems } from "./enum";

enum Status {
  Active = 1,
  Archived = 2,
}

enum Color {
  Red = "red",
  Blue = "blue",
}

enum Level {
  Low = 1,
  Minimal = Low,
  High = 2,
}

describe("isEnumKey", () => {
  it("accepts the keys of numeric and string enums", () => {
    expect(isEnumKey(Status, "Active")).toBe(true);
    expect(isEnumKey(Color, "Red")).toBe(true);
  });

  it("rejects values and reverse-mapping keys", () => {
    expect(isEnumKey(Status, "1")).toBe(false);
    expect(isEnumKey(Color, "red")).toBe(false);
    expect(isEnumKey(Color, "toString")).toBe(false);
  });
});

describe("enumToEntries", () => {
  it("keeps every key when values are aliased", () => {
    expect(enumToEntries(Level)).toEqual([
      ["Low", 1],
      ["Minimal", 1],
      ["High", 2],
    ]);
  });

  it("pairs string enum keys with their values", () => {
    expect(enumToEntries(Color)).toEqual([
      ["Red", "red"],
      ["Blue", "blue"],
    ]);
  });
});

describe("toListItems", () => {
  it("keeps string keys as values", () => {
    const items = toListItems({ [Color.Red]: "Red", [Color.Blue]: "Blue" });

    expect(items).toEqual([
      { label: "Red", value: "red" },
      { label: "Blue", value: "blue" },
    ]);
    expectTypeOf(items[0].value).toEqualTypeOf<Color>();
  });

  it("rejects a numeric key type", () => {
    // @ts-expect-error
    toListItems<Status>({ [Status.Active]: "Active", [Status.Archived]: "Archived" });
  });
});

describe("toNumericListItems", () => {
  it("converts keys back to the numeric enum values", () => {
    const items = toNumericListItems({ [Status.Active]: "Active", [Status.Archived]: "Archived" });

    expect(items).toEqual([
      { label: "Active", value: Status.Active },
      { label: "Archived", value: Status.Archived },
    ]);
    expect(items.find((item) => item.value === Status.Archived)?.label).toBe("Archived");
    expectTypeOf(items[0].value).toEqualTypeOf<Status>();
  });
});
