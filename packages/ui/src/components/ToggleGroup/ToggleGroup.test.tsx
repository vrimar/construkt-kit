import { useToggleGroup } from "@ark-ui/react/toggle-group";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToggleGroup } from ".";
import { Toolbar } from "../Toolbar";

function ProvidedGroup() {
  const toggleGroup = useToggleGroup({ multiple: true });
  return (
    <ToggleGroup.RootProvider value={toggleGroup}>
      <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
      <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
    </ToggleGroup.RootProvider>
  );
}

describe("ToggleGroup", () => {
  it("joins a toolbar's arrow keys and single tab stop through RootProvider", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Toolbar.Root aria-label="Format">
          <button type="button">Undo</button>
          <ProvidedGroup />
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
