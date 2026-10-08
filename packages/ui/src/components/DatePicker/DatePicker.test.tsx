import { parseDate } from "@ark-ui/react/date-picker";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Calendar } from "./Calendar";
import { DatePicker } from "./DatePicker";
import { DatePickerSelect } from "./DatePickerSelect";

const rootClassesOf = (container: HTMLElement) => {
  const root = container.querySelector('[data-scope="date-picker"][data-part="root"]');
  expect(root).toBe(container.firstElementChild);
  return root?.className.split(" ") ?? [];
};

const triggerOf = (container: HTMLElement) => {
  const trigger = container.querySelector<HTMLButtonElement>(
    '[data-scope="date-picker"][data-part="trigger"]',
  );
  if (!trigger) throw new Error("No date picker trigger");
  return trigger;
};

const dayTrigger = (iso: string) => {
  const day = document.querySelector<HTMLElement>(
    `[data-part="table-cell-trigger"][data-view="day"][data-value="${iso}"]`,
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

  it("labels a DatePickerSelect range from the machine's selection mode", () => {
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
    expect(container.querySelectorAll('[data-part="table-head"]')).toHaveLength(2);
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
      '[data-part="table-cell-trigger"][data-view="day"][data-selectable]',
    );
    if (!day) throw new Error("No selectable day");
    const iso = day.dataset.value;

    await user.click(day);

    expect(triggerOf(container).textContent).toBe(iso);
  });
});
