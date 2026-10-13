import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ActionBar } from ".";

const SelectableActionBar = ({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
      >
        Toggle selection
      </button>
      <button type="button">Row</button>
      <ActionBar.Root
        open={open}
        onOpenChange={(e) => {
          onOpenChange?.(e.open);
          setOpen(e.open);
        }}
      >
        <ActionBar.Content>
          <ActionBar.SelectionTrigger type="button">2 selected</ActionBar.SelectionTrigger>
          <button type="button">Delete</button>
          <ActionBar.CloseTrigger />
        </ActionBar.Content>
      </ActionBar.Root>
    </>
  );
};

const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

describe("ActionBar", () => {
  it("exposes the bar as a labelled region rather than a dialog", async () => {
    render(<SelectableActionBar />);

    await userEvent.click(screen.getByRole("button", { name: "Toggle selection" }));

    expect(await screen.findByRole("region", { name: "Selection actions" })).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders nothing while closed", () => {
    render(<SelectableActionBar />);
    expect(screen.queryByText("2 selected")).toBeNull();
  });

  it("is not placed by an anchorless popover positioner", async () => {
    render(<SelectableActionBar />);
    await userEvent.click(screen.getByRole("button", { name: "Toggle selection" }));

    const content = screen.getByText("2 selected").parentElement;
    const positioner = content?.parentElement;
    expect(positioner?.parentElement).toBe(document.body);
    expect(positioner?.getAttribute("style")).toBeNull();
    expect(positioner?.hasAttribute("data-part")).toBe(false);
  });

  it("stays open when the page behind it is clicked", async () => {
    const onOpenChange = vi.fn();
    render(<SelectableActionBar onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Toggle selection" }));
    await settle();

    await userEvent.click(screen.getByRole("button", { name: "Row" }));
    await settle();

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.queryByText("2 selected")).not.toBeNull();
  });

  it("closes from an outside toggle in one click", async () => {
    render(<SelectableActionBar />);
    const toggle = screen.getByRole("button", { name: "Toggle selection" });
    await userEvent.click(toggle);
    await settle();

    await userEvent.click(toggle);

    await waitFor(() => expect(screen.queryByText("2 selected")).toBeNull());
  });

  it("leaves focus where it was when it opens", async () => {
    render(<SelectableActionBar />);
    const toggle = screen.getByRole("button", { name: "Toggle selection" });
    await userEvent.click(toggle);
    await settle();

    expect(document.activeElement).toBe(toggle);
  });

  it("closes on Escape and from its close trigger", async () => {
    const onOpenChange = vi.fn();
    render(<SelectableActionBar onOpenChange={onOpenChange} />);
    const toggle = screen.getByRole("button", { name: "Toggle selection" });

    await userEvent.click(toggle);
    await settle();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByText("2 selected")).toBeNull());

    await userEvent.click(toggle);
    await userEvent.click(await screen.findByRole("button", { name: "close" }));
    await waitFor(() => expect(screen.queryByText("2 selected")).toBeNull());
    expect(onOpenChange.mock.calls).toEqual([[false], [false]]);
  });
});
