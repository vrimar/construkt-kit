import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type MouseEvent, useState } from "react";
import { describe, expect, it, vi } from "vitest";

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

  it("reports the search field's close button as a close press, not an item pick", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <CommandPalette.Root
        open
        onOpenChange={onOpenChange}
      >
        <CommandPalette.Input />
        <CommandPalette.List>
          <CommandPalette.Item
            value="alpha"
            label="Alpha"
          />
        </CommandPalette.List>
      </CommandPalette.Root>,
    );
    const control = screen.getByRole("combobox").parentElement as HTMLElement;

    await user.click(within(control).getByRole("button", { name: "Close" }));

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(
      false,
      expect.objectContaining({ reason: "close-press" }),
    );
  });

  it("clicks a link item on Enter instead of picking it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    render(
      <CommandPalette.Root open>
        <CommandPalette.Input />
        <CommandPalette.List>
          <CommandPalette.Item
            value="docs"
            label="Docs"
            render={<a href="/docs" />}
            onClick={onClick}
            onSelect={onSelect}
          />
        </CommandPalette.List>
      </CommandPalette.Root>,
    );
    await user.click(screen.getByRole("combobox"));

    await user.keyboard("{Enter}");

    await waitFor(() => expect(onClick).toHaveBeenCalledOnce());
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("leaves a link item to the browser when a new-tab click opens it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CommandPalette.Root open>
        <CommandPalette.Input />
        <CommandPalette.List>
          <CommandPalette.Item
            value="docs"
            label="Docs"
            render={<a href="#docs" />}
            closeOnSelect={false}
            onSelect={onSelect}
          />
        </CommandPalette.List>
      </CommandPalette.Root>,
    );
    const item = screen.getByRole("option", { name: "Docs" });

    await user.keyboard("{Control>}{Meta>}");
    await user.click(item);
    await user.keyboard("{/Meta}{/Control}");
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(item);
    expect(onSelect).toHaveBeenCalledOnce();
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

  it("reports no page change on closing once it is back on its first page", async () => {
    const user = userEvent.setup();
    const onPagesChange = vi.fn();
    const onExitComplete = vi.fn();
    render(
      <CommandPalette.Root
        defaultOpen
        onPagesChange={onPagesChange}
        onExitComplete={onExitComplete}
      >
        <CommandPalette.Input />
        <CommandPalette.List>
          <CommandPalette.Item
            value="theme"
            label="Change theme"
            opensPage="themes"
          />
        </CommandPalette.List>
      </CommandPalette.Root>,
    );
    await user.click(screen.getByRole("combobox"));

    await user.keyboard("{Enter}{Backspace}{Escape}");
    await waitFor(() => expect(onExitComplete).toHaveBeenCalledOnce());

    expect(onPagesChange.mock.calls).toEqual([
      [[{ value: "themes", label: "Change theme" }]],
      [[]],
    ]);
  });
});
