import {
  type DateValue,
  JapaneseCalendar,
  parseDate,
  parseDateTime,
  toCalendar,
} from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { setupUser, settle, useFakeTime } from "../../_shared/fakeTime";
import { mockMatchMedia, viewportWidth } from "../../_shared/matchMedia";
import { Calendar } from "./Calendar";
import { DatePicker } from "./DatePicker";
import { DatePickerSelect } from "./DatePickerSelect";
import { defaultRangePresets } from "./types";

const rootClassesOf = (container: HTMLElement) => {
  const root = container.querySelector('[data-slot="root"]');
  expect(root).toBe(container.firstElementChild);
  return root?.className.split(" ") ?? [];
};

const triggerOf = (container: HTMLElement) => {
  const trigger = container.querySelector<HTMLButtonElement>('[data-slot="trigger"]');
  if (!trigger) throw new Error("No date picker trigger");
  return trigger;
};

const originalTimeZone = process.env.TZ;

const todayCell = () => document.querySelector('[data-slot="tableCellTrigger"][data-today]');

const dayTrigger = (iso: string) => {
  const day = document.querySelector<HTMLElement>(
    `[data-slot="tableCellTrigger"][data-value="${iso}"]`,
  );
  if (!day) throw new Error(`No day cell for ${iso}`);
  return day;
};

describe("DatePicker", () => {
  it("applies style props to its outermost element", () => {
    const { container } = render(<DatePicker w="240px" />);
    expect(rootClassesOf(container)).toEqual(
      expect.arrayContaining(["date-picker__root", "w_240px"]),
    );
  });

  it("forwards DatePickerSelect style props to the picker root", () => {
    const { container } = render(
      <DatePickerSelect
        selectionMode="range"
        flex="1"
      />,
    );
    expect(rootClassesOf(container)).toContain("flex_1");
  });

  it("renders the Calendar as a single styled root", () => {
    const { container } = render(<Calendar />);
    expect(rootClassesOf(container)).toContain("date-picker__root");
  });

  it("labels a DatePickerSelect range from its selection mode", () => {
    const { container } = render(
      <DatePickerSelect
        selectionMode="range"
        defaultValue={[parseDate("2024-01-10"), parseDate("2024-01-12")]}
      />,
    );
    expect(triggerOf(container).textContent).toBe("2024-01-10 – 2024-01-12");
  });

  it("disables the DatePickerSelect trigger and clear button when disabled", () => {
    const { container } = render(
      <DatePickerSelect
        disabled
        defaultValue={parseDate("2024-01-15")}
      />,
    );
    expect(triggerOf(container).disabled).toBe(true);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Clear date" }).disabled).toBe(
      true,
    );
  });

  it("shows two months for a range on desktop", () => {
    const { container } = render(<Calendar selectionMode="range" />);
    expect(container.querySelectorAll('[data-slot="tableHead"]')).toHaveLength(2);
  });

  it("stops adding dates once maxSelectedDates is reached", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Calendar
        selectionMode="multiple"
        maxSelectedDates={1}
        defaultValue={[parseDate("2024-01-10")]}
        onValueChange={onValueChange}
      />,
    );

    await user.click(dayTrigger("2024-01-11"));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(dayTrigger("2024-01-11").hasAttribute("data-selected")).toBe(false);
  });

  it("names its trigger by the date it shows, not by its open state", () => {
    render(<DatePicker defaultValue={parseDate("2024-01-15")} />);

    expect(screen.getByRole("button", { name: "2024-01-15" }).getAttribute("data-slot")).toBe(
      "trigger",
    );
  });

  it("shows the placeholder once a controlled single value is cleared", () => {
    const { container, rerender } = render(<DatePicker value={parseDate("2024-01-15")} />);
    expect(triggerOf(container).textContent).toBe("2024-01-15");

    rerender(<DatePicker value={undefined} />);

    expect(triggerOf(container).textContent).toBe("Select date");
  });

  it("keeps a DatePickerSelect without a value prop uncontrolled", async () => {
    const user = userEvent.setup();
    const { container } = render(<DatePickerSelect defaultOpen />);
    const day = document.querySelector<HTMLElement>(
      '[data-slot="tableCellTrigger"]:not([data-disabled])',
    );
    if (!day) throw new Error("No selectable day");
    const iso = day.dataset.value;

    await user.click(day);

    expect(triggerOf(container).textContent).toBe(iso);
  });

  describe("on phones", () => {
    useFakeTime();

    it("stays open on a tap on its sheet's grabber", async () => {
      // jsdom loads no stylesheet, so the sheet's pointer-events override on its content is absent.
      const user = setupUser({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      mockMatchMedia(viewportWidth(375));
      render(<DatePicker defaultOpen />);
      await settle();

      await user.click(document.querySelector('[data-slot="grabber"]') as Element);

      await settle();
      expect(screen.queryByRole("grid")).not.toBeNull();
    });
  });
});

describe("useCalendar", () => {
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
