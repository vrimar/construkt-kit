import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { mockMatchMedia, viewportWidth } from "../../_shared/matchMedia";
import { ConfirmPopover } from "./ConfirmPopover";
import { Popover } from "./Popover";

it("names content that mounts on open after its title and description", async () => {
  render(
    <Popover.Root>
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Content>
        <Popover.Title>Rename</Popover.Title>
        <Popover.Description>Pick a new name</Popover.Description>
      </Popover.Content>
    </Popover.Root>,
  );

  await userEvent.click(screen.getByRole("button", { name: "Open" }));

  const dialog = await screen.findByRole("dialog", { name: "Rename" });
  expect(dialog.getAttribute("aria-describedby")).not.toBeNull();
  expect(document.getElementById(dialog.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
    "Pick a new name",
  );
});

it("shows a trigger's tooltip until the popover opens", async () => {
  render(
    <ConfirmPopover
      title="Remove this?"
      tooltip="Remove"
      onConfirm={() => {}}
    >
      <button type="button">Trash</button>
    </ConfirmPopover>,
  );
  const trigger = screen.getByRole("button", { name: "Trash" });

  await userEvent.hover(trigger);
  expect((await screen.findByRole("tooltip")).textContent).toBe("Remove");

  await userEvent.click(trigger);
  await expect.poll(() => screen.queryByRole("tooltip")).toBeNull();
  await userEvent.unhover(trigger);
  await userEvent.hover(trigger);
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
});

it("opens a confirm with no trigger against its anchor, and returns focus to returnFocusTo", async () => {
  const AnchoredConfirm = () => {
    const [open, setOpen] = useState(false);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [more, setMore] = useState<HTMLElement | null>(null);
    return (
      <>
        <button
          ref={setMore}
          type="button"
          onClick={() => setOpen(true)}
        >
          More
        </button>
        <span
          ref={setAnchor}
          style={{ display: "block", marginTop: 200, width: 40, height: 20 }}
        />
        {anchor && (
          <ConfirmPopover
            open={open}
            onOpenChange={setOpen}
            anchor={anchor}
            returnFocusTo={() => more}
            title="Delete this?"
            onConfirm={() => {}}
          />
        )}
      </>
    );
  };
  render(<AnchoredConfirm />);

  await userEvent.click(screen.getByRole("button", { name: "More" }));
  const confirm = await screen.findByRole("alertdialog", { name: "Delete this?" });
  const anchor = screen.getByRole("button", { name: "More" }).nextElementSibling as HTMLElement;
  expect(confirm.getBoundingClientRect().top).toBeGreaterThanOrEqual(
    anchor.getBoundingClientRect().bottom,
  );

  await userEvent.keyboard("{Escape}");

  await expect
    .poll(() => document.activeElement)
    .toBe(screen.getByRole("button", { name: "More" }));
});

it("returns focus to returnFocusTo from its phone sheet", async () => {
  mockMatchMedia(viewportWidth(375));
  render(
    <>
      <button type="button">Other</button>
      <Popover.Root returnFocusTo={() => screen.getByRole("button", { name: "Other" })}>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Rename</Popover.Title>
          <button type="button">Save</button>
        </Popover.Content>
      </Popover.Root>
    </>,
  );

  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  await screen.findByRole("button", { name: "Save" });
  await userEvent.keyboard("{Escape}");

  await expect
    .poll(() => document.activeElement)
    .toBe(screen.getByRole("button", { name: "Other" }));
});

it("moves focus in when it mounts open", async () => {
  render(
    <Popover.Root defaultOpen>
      <Popover.Trigger>Ranges</Popover.Trigger>
      <Popover.Content>
        <input aria-label="From" />
      </Popover.Content>
    </Popover.Root>,
  );

  await expect
    .poll(() => document.activeElement)
    .toBe(screen.getByRole("textbox", { name: "From" }));
});
