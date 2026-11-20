import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Dialog } from "../components/Dialog";
import { Popover } from "../components/Popover";

it("opens a popup from a dark scope in the document's light mode", async () => {
  render(
    <div className="dark">
      <Popover.Root defaultOpen>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content aria-label="Menu" />
      </Popover.Root>
    </div>,
  );

  const popover = await screen.findByRole("dialog", { name: "Menu" });
  await expect.poll(() => popover.closest("[popover]")?.classList.contains("light")).toBe(true);
});

it("opens a dialog from a dark scope in the document's light mode", async () => {
  render(
    <div className="dark">
      <Dialog.Root
        defaultOpen
        title="Settings"
      >
        <Dialog.Content />
      </Dialog.Root>
    </div>,
  );

  const dialog = await screen.findByRole("dialog", { name: "Settings" });
  await expect.poll(() => dialog.classList.contains("light")).toBe(true);
});
