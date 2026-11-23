import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatDateDefault, formatDateValue, formatIsoDate, parseDate, toIsoDay } from "./date";

beforeEach(() => {
  vi.stubEnv("TZ", "America/Los_Angeles");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("formatDateDefault", () => {
  it.each([
    ["2024-01-15T10:00:00", "Jan 15, 2024 2:00 AM"],
    ["2024-01-15 10:00:00", "Jan 15, 2024 2:00 AM"],
    ["2024-01-15T10:00:00.1234567", "Jan 15, 2024 2:00 AM"],
    ["2024-01-15T10:00:00Z", "Jan 15, 2024 2:00 AM"],
    ["2024-01-15T10:00:00z", "Jan 15, 2024 2:00 AM"],
    ["2024-01-15T12:00:00+02:00", "Jan 15, 2024 2:00 AM"],
    ["2024-01-15T12:00:00+0200", "Jan 15, 2024 2:00 AM"],
    ["2024-01-15T12:00:00+02", "Jan 15, 2024 2:00 AM"],
    ["2024-01-15T05:00:00-05", "Jan 15, 2024 2:00 AM"],
  ])("reads %j as an instant", (input, expected) => {
    expect(formatDateDefault(input)).toBe(expected);
  });

  it("keeps a date-only string on its calendar day", () => {
    expect(formatDateDefault("2024-01-15")).toBe("Jan 15, 2024 12:00 AM");
  });

  it("formats a Date in local time", () => {
    expect(formatDateDefault(new Date("2024-01-15T10:00:00Z"))).toBe("Jan 15, 2024 2:00 AM");
  });
});

describe("formatDateValue", () => {
  it("leaves the time off a date-only string", () => {
    expect(formatDateValue("2024-01-15")).toBe("Jan 15, 2024");
  });

  it("returns undefined for a value that isn't a date", () => {
    expect(formatDateValue("not a date")).toBeUndefined();
  });
});

describe("parseDate", () => {
  it("reads an offset-less timestamp as UTC", () => {
    expect(parseDate("2024-01-15T10:00:00").getTime()).toBe(Date.parse("2024-01-15T10:00:00Z"));
  });
});

describe("formatIsoDate", () => {
  it("formats calendar dates as zero-padded ISO dates", () => {
    expect(formatIsoDate({ year: 2024, month: 3, day: 7 })).toBe("2024-03-07");
  });
});

describe("toIsoDay", () => {
  it("puts an offset-less timestamp on the local day of its UTC instant", () => {
    expect(toIsoDay("2024-01-15T03:00:00")).toBe("2024-01-14");
  });
});
