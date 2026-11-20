import {
  type DateValue,
  JapaneseCalendar,
  parseDate,
  parseDateTime,
  toCalendar,
} from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Calendar } from "./Calendar";
import { defaultRangePresets } from "./types";

const originalTimeZone = process.env.TZ;

const todayCell = () => document.querySelector('[data-slot="tableCellTrigger"][data-today]');

const dayTrigger = (iso: string) => {
  const day = document.querySelector<HTMLElement>(
    `[data-slot="tableCellTrigger"][data-value="${iso}"]`,
  );
  if (!day) throw new Error(`No day cell for ${iso}`);
  return day;
};

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

describe("useCalendar", () => {
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

  it("starts the week presets on the calendar's first weekday", async () => {
    const onValueChange = vi.fn<(value: DateValue[]) => void>();
    render(
      <Calendar
        selectionMode="range"
        presets={[{ label: "This week", value: "thisWeek" }]}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByText("This week"));
    expect(onValueChange.mock.lastCall?.[0].map(String)).toEqual(["2026-10-05", "2026-10-11"]);
  });

  it("compares dates that carry a time of day with the bounds and the range by day", () => {
    render(
      <Calendar
        timeZone="UTC"
        selectionMode="range"
        max={parseDate("2026-10-20")}
        defaultValue={[parseDateTime("2026-10-12T09:30"), parseDateTime("2026-10-14T18:00")]}
      />,
    );
    expect(dayTrigger("2026-10-20").hasAttribute("data-disabled")).toBe(false);
    expect(dayTrigger("2026-10-12").hasAttribute("data-in-range")).toBe(true);
  });

  it("unselects a day whatever time of day its selected date holds", async () => {
    const onValueChange = vi.fn<(value: DateValue[]) => void>();
    render(
      <Calendar
        timeZone="UTC"
        selectionMode="multiple"
        defaultValue={[parseDateTime("2026-10-12T09:30"), parseDateTime("2026-10-14T18:00")]}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(dayTrigger("2026-10-14"));
    expect(onValueChange.mock.lastCall?.[0].map(String)).toEqual(["2026-10-12T09:30:00"]);
  });

  it("lets the month view pick a month min starts partway through", () => {
    render(
      <Calendar
        timeZone="UTC"
        min={parseDate("2026-03-15")}
        defaultValue={parseDate("2026-05-10")}
        defaultView="month"
      />,
    );
    expect(screen.getByRole("button", { name: "Mar 2026" }).hasAttribute("aria-disabled")).toBe(
      false,
    );
  });

  it("names a non-Gregorian calendar's months in a time zone behind UTC", () => {
    render(
      <Calendar
        defaultValue={toCalendar(parseDate("2026-03-01"), new JapaneseCalendar())}
        defaultView="month"
      />,
    );
    const months = document.querySelectorAll('[data-view="month"] [data-slot="tableCellTrigger"]');
    expect(months[0]?.textContent).toBe("Jan");
  });
});
