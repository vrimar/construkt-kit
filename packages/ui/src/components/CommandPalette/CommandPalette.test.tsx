import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { CommandPalette, type CommandPalettePage } from ".";

const highlightedLabel = () => {
  const id = screen.getByRole("combobox").getAttribute("aria-activedescendant");
  return id == null ? null : document.getElementById(id)?.textContent;
};

function PaletteWithSubPage() {
  const [pages, setPages] = useState<CommandPalettePage[]>([]);

  return (
    <CommandPalette.Root
      open
      pages={pages}
      onPagesChange={setPages}
    >
      <CommandPalette.Input />
      <CommandPalette.List>
        {pages.length === 0 ? (
          <CommandPalette.Item
            value="theme"
            label="Change theme"
            opensPage="themes"
          />
        ) : (
          <CommandPalette.Item
            value="dark"
            label="Dark"
          />
        )}
      </CommandPalette.List>
    </CommandPalette.Root>
  );
}

describe("CommandPalette", () => {
  it("moves the highlight past disabled items with the arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <CommandPalette.Root open>
        <CommandPalette.Input />
        <CommandPalette.List>
          <CommandPalette.Item
            value="rename"
            label="Rename"
          />
          <CommandPalette.Item
            value="duplicate"
            label="Duplicate"
            disabled
          />
          <CommandPalette.Item
            value="archive"
            label="Archive"
          />
        </CommandPalette.List>
      </CommandPalette.Root>,
    );
    await user.click(screen.getByRole("combobox"));

    await user.keyboard("{ArrowDown}");
    expect(highlightedLabel()).toBe("Archive");
    await user.keyboard("{ArrowUp}");
    expect(highlightedLabel()).toBe("Rename");
  });

  it("keeps Home and End for the text cursor instead of the highlight", async () => {
    const user = userEvent.setup();
    render(
      <CommandPalette.Root open>
        <CommandPalette.Input />
        <CommandPalette.List>
          <CommandPalette.Item
            value="alpha"
            label="Alpha"
          />
          <CommandPalette.Item
            value="beta"
            label="Beta"
          />
        </CommandPalette.List>
      </CommandPalette.Root>,
    );
    const input = screen.getByRole<HTMLInputElement>("combobox");
    await user.click(input);
    await user.keyboard("ab{Home}");

    expect(highlightedLabel()).toBe("Alpha");
    expect(input.selectionStart).toBe(0);

    await user.keyboard("{End}");
    expect(highlightedLabel()).toBe("Alpha");
    expect(input.selectionStart).toBe(2);
  });

  it("names an item by its label and describes it by the rest of its row", () => {
    render(
      <CommandPalette.Root open>
        <CommandPalette.Input />
        <CommandPalette.List>
          <CommandPalette.Item
            value="undo"
            label="Undo"
            description="Revert the last change"
            meta="3 left"
            shortcut="Ctrl+Z"
          />
        </CommandPalette.List>
      </CommandPalette.Root>,
    );

    expect(
      screen.getByRole("option", {
        name: "Undo",
        description: "Revert the last change 3 left Ctrl+Z",
      }),
    ).not.toBeNull();
  });

  it("goes back to the parent page on Backspace in an empty search", async () => {
    const user = userEvent.setup();
    render(<PaletteWithSubPage />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Enter}");
    expect(screen.getByRole("option", { name: "Dark" })).not.toBeNull();

    await user.keyboard("{Backspace}");

    expect(screen.getByRole("option", { name: "Change theme" })).not.toBeNull();
  });
});
