import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { ActionBar } from ".";
import { Dialog } from "../Dialog";
import { Popover } from "../Popover";

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
        onOpenChange={(next) => {
          onOpenChange?.(next);
          setOpen(next);
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

const toggle = () => screen.getByRole("button", { name: "Toggle selection" });

it("floats at the bottom of the page as a labelled region, not a dialog", async () => {
  render(<SelectableActionBar />);

  await userEvent.click(toggle());

  const region = await screen.findByRole("region", { name: "Selection actions" });
  expect(region.parentElement?.parentElement).toBe(document.body);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("stays open, and leaves focus alone, when the page behind it is used", async () => {
  const onOpenChange = vi.fn();
  render(<SelectableActionBar onOpenChange={onOpenChange} />);

  await userEvent.click(toggle());
  await screen.findByText("2 selected");
  expect(document.activeElement).toBe(toggle());
  await userEvent.click(screen.getByRole("button", { name: "Row" }));

  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.queryByText("2 selected")).not.toBeNull();
});

it("closes from an outside toggle in one click", async () => {
  render(<SelectableActionBar />);
  await userEvent.click(toggle());
  await screen.findByText("2 selected");

  await userEvent.click(toggle());

  await expect.poll(() => screen.queryByText("2 selected")).toBeNull();
});

it("closes on Escape and from its close trigger", async () => {
  const onOpenChange = vi.fn();
  render(<SelectableActionBar onOpenChange={onOpenChange} />);

  await userEvent.click(toggle());
  await screen.findByText("2 selected");
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => screen.queryByText("2 selected")).toBeNull();

  await userEvent.click(toggle());
  await userEvent.click(await screen.findByRole("button", { name: "Close" }));
  await expect.poll(() => screen.queryByText("2 selected")).toBeNull();
  expect(onOpenChange.mock.calls).toEqual([[false], [false]]);
});

it("leaves Escape to a popover open before it opened", async () => {
  const PopoverSelection = () => {
    const [selected, setSelected] = useState(false);
    return (
      <>
        <Popover.Root defaultOpen>
          <Popover.Trigger>Filters</Popover.Trigger>
          <Popover.Content>
            <button
              type="button"
              onClick={() => setSelected(true)}
            >
              Select all
            </button>
          </Popover.Content>
        </Popover.Root>
        <ActionBar.Root
          open={selected}
          onOpenChange={setSelected}
        >
          <ActionBar.Content>2 selected</ActionBar.Content>
        </ActionBar.Root>
      </>
    );
  };
  render(<PopoverSelection />);

  await userEvent.click(await screen.findByRole("button", { name: "Select all" }));
  await screen.findByText("2 selected");
  await userEvent.keyboard("{Escape}");

  await expect.poll(() => screen.queryByRole("button", { name: "Select all" })).toBeNull();
  expect(screen.queryByText("2 selected")).not.toBeNull();
});

it("takes Escape inside a dialog before the dialog does", async () => {
  render(
    <Dialog.Root
      defaultOpen
      title="Pick rows"
    >
      <Dialog.Content>
        <ActionBar.Root
          defaultOpen
          placement="inline"
        >
          <ActionBar.Content>2 selected</ActionBar.Content>
        </ActionBar.Root>
      </Dialog.Content>
    </Dialog.Root>,
  );

  await screen.findByText("2 selected");
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => screen.queryByText("2 selected")).toBeNull();
  expect(screen.queryByRole("dialog")).not.toBeNull();

  await userEvent.keyboard("{Escape}");
  await expect.poll(() => screen.queryByRole("dialog")).toBeNull();
});
