import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToggleTip } from ".";

describe("ToggleTip", () => {
  it("renders text children as a keyboard-operable trigger", async () => {
    render(<ToggleTip label="Billed monthly">Plan details</ToggleTip>);

    const trigger = screen.getByRole("button", { name: "Plan details" });
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger);
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByText("Billed monthly")).not.toBeNull();
  });

  it("uses an element child as the trigger itself", () => {
    render(
      <ToggleTip label="Billed monthly">
        <a href="#plan">Plan</a>
      </ToggleTip>,
    );

    expect(screen.getByRole("link", { name: "Plan" }).getAttribute("data-part")).toBe("trigger");
  });
});
