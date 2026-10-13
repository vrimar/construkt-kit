import type { DateValue } from "@ark-ui/react/date-picker";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Calendar } from "./Calendar";
import { defaultRangePresets } from "./types";

const originalTimeZone = process.env.TZ;

const todayCell = () =>
  document.querySelector('[data-part="table-cell-trigger"][data-view="day"][data-today]');

beforeEach(() => {
  process.env.TZ = "America/Los_Angeles";
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-09T05:15:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  if (originalTimeZone === undefined) delete process.env.TZ;
  else process.env.TZ = originalTimeZone;
});

describe("useCalendarMachine", () => {
  it("marks today in the local time zone", () => {
    render(<Calendar />);
    expect(todayCell()?.getAttribute("data-value")).toBe("2026-10-08");
  });

  it("resolves range presets against the local today", async () => {
    const onValueChange = vi.fn<(value: DateValue[]) => void>();
    render(
      <Calendar
        selectionMode="range"
        presets={defaultRangePresets}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByText("Last 7 days"));
    expect(onValueChange.mock.lastCall?.[0].map(String)).toEqual(["2026-10-02", "2026-10-08"]);
  });

  it("honours an explicit time zone", () => {
    render(<Calendar timeZone="UTC" />);
    expect(todayCell()?.getAttribute("data-value")).toBe("2026-10-09");
  });
});
