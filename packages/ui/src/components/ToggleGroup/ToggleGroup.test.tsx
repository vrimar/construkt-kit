import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToggleGroup } from ".";
import { Toolbar } from "../Toolbar";

describe("ToggleGroup", () => {
  it("joins a toolbar's arrow keys and single tab stop", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Toolbar.Root aria-label="Format">
          <button type="button">Undo</button>
          <ToggleGroup.Root multiple>
            <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
            <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
          </ToggleGroup.Root>
          <button type="button">Redo</button>
        </Toolbar.Root>
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Undo" }));
    for (const name of ["Bold", "Italic", "Redo", "Undo"]) {
      await user.keyboard("{ArrowRight}");
      expect(document.activeElement).toBe(screen.getByRole("button", { name }));
    }
    await user.keyboard("{ArrowRight}{ArrowRight}");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Italic" }));
  });
});
