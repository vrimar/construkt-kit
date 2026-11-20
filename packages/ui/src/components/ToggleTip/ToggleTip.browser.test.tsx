import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { ToggleTip } from ".";

it("wraps text children in a keyboard-operable trigger", async () => {
  render(<ToggleTip label="Billed monthly">Plan details</ToggleTip>);

  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Plan details" }));
  await userEvent.keyboard("{Enter}");

  expect(await screen.findByText("Billed monthly")).not.toBeNull();
});

it("uses an element child as the trigger itself", () => {
  render(
    <ToggleTip label="Billed monthly">
      <a href="#plan">Plan</a>
    </ToggleTip>,
  );

  expect(screen.getByRole("link", { name: "Plan" }).getAttribute("aria-haspopup")).toBe("dialog");
});

it("keeps its trigger element and opens nothing while the label is empty", async () => {
  const onOpenChange = vi.fn();
  const tip = (label: string) => (
    <ToggleTip
      label={label}
      onOpenChange={onOpenChange}
    >
      <button type="button">Plan</button>
    </ToggleTip>
  );
  const { rerender } = render(tip(""));
  const trigger = screen.getByRole("button", { name: "Plan" });

  await userEvent.click(trigger);

  expect(trigger.hasAttribute("aria-haspopup")).toBe(false);
  expect(trigger.hasAttribute("aria-expanded")).toBe(false);
  expect(onOpenChange).not.toHaveBeenCalled();

  rerender(tip("Billed monthly"));

  expect(screen.getByRole("button", { name: "Plan" })).toBe(trigger);
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
  expect(screen.queryByText("Billed monthly")).toBeNull();
});
