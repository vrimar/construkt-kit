import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import { Collapsible } from ".";

it("keeps a keepMounted content's DOM and state while it is closed", async () => {
  const user = userEvent.setup();
  render(
    <Collapsible.Root>
      <Collapsible.Trigger>Notes</Collapsible.Trigger>
      <Collapsible.Content keepMounted>
        <input aria-label="Note" />
      </Collapsible.Content>
    </Collapsible.Root>,
  );
  const trigger = screen.getByRole("button", { name: "Notes" });

  await user.click(trigger);
  await user.type(screen.getByRole("textbox", { name: "Note" }), "Call back");
  await user.click(trigger);

  const input = screen.getByDisplayValue("Call back");
  await expect
    .poll(() => input.closest<HTMLElement>("[data-slot=content]")?.style.display)
    .toBe("none");
  await user.click(trigger);
  expect(screen.getByRole("textbox", { name: "Note" })).toBe(input);
});
