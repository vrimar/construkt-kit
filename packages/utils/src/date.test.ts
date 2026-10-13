import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatDateDefault } from "./date";

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
