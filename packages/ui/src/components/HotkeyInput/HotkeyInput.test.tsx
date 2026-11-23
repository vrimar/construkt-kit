import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { HotkeyInput } from ".";
import { Field } from "../Form";

it("takes its name, description and disabled state from the Field around it", () => {
  render(
    <Field
      label="Search"
      helperText="Opens the command palette."
      disabled
    >
      <HotkeyInput
        value="Mod+K"
        onValueChange={vi.fn()}
      />
    </Field>,
  );

  const control = screen.getByRole<HTMLButtonElement>("button", {
    name: /^Search /,
    description: "Opens the command palette.",
  });
  expect(control.disabled).toBe(true);
  expect(screen.getByText("Search").closest("label")?.htmlFor).toBe(control.id);
});
