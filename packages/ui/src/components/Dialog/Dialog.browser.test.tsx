import { render, screen } from "@testing-library/react";
import { Suspense, use, useEffect, useState } from "react";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { Dialog } from ".";

let settingsLoaded: Promise<void> | undefined;

function LoadsAfterOpening() {
  const [loading, setLoading] = useState<Promise<void>>();
  useEffect(() => {
    settingsLoaded ??= new Promise((resolve) => setTimeout(resolve, 20));
    const timer = setTimeout(() => setLoading(settingsLoaded));
    return () => clearTimeout(timer);
  }, []);
  if (loading) use(loading);
  return "Notifications are on.";
}

function ControlledDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
      >
        Open settings
      </button>
      <Dialog.Root
        aria-label="Settings"
        open={open}
        onOpenChange={setOpen}
      >
        <Dialog.Content>
          <Dialog.Body>
            <LoadsAfterOpening />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}

it("stays open when Suspense hides it while its content loads", async () => {
  render(
    <Suspense fallback={null}>
      <ControlledDialog />
    </Suspense>,
  );

  await userEvent.click(screen.getByRole("button", { name: "Open settings" }));
  await expect
    .poll(() => screen.queryByText("Notifications are on.")?.checkVisibility())
    .toBe(true);
  expect(document.querySelector("dialog")?.open).toBe(true);
});

it("frees the page when Suspense hides it before its content first renders", async () => {
  const pending = new Promise<void>(() => {});
  const Pending = () => {
    use(pending);
    return null;
  };
  render(
    <Suspense fallback={<button type="button">Loading</button>}>
      <Dialog.Root
        aria-label="Settings"
        defaultOpen
      >
        <Dialog.Content>
          <Pending />
        </Dialog.Content>
      </Dialog.Root>
    </Suspense>,
  );

  await screen.findByRole("button", { name: "Loading" });
  expect(document.querySelector("dialog:modal")).toBeNull();
});

it("leaves focus alone when the update that closes it turns restoreFocus off", async () => {
  const Deleting = () => {
    const [open, setOpen] = useState(false);
    const [deleted, setDeleted] = useState(false);
    return (
      <Dialog.Root
        aria-label="Row"
        open={open}
        onOpenChange={setOpen}
        restoreFocus={!deleted}
      >
        <Dialog.Trigger>Edit row</Dialog.Trigger>
        <Dialog.Content>
          <button
            type="button"
            onClick={() => {
              setDeleted(true);
              setOpen(false);
            }}
          >
            Delete
          </button>
        </Dialog.Content>
      </Dialog.Root>
    );
  };
  render(<Deleting />);

  await userEvent.click(screen.getByRole("button", { name: "Edit row" }));
  await userEvent.click(await screen.findByRole("button", { name: "Delete" }));
  await expect.poll(() => document.querySelector("dialog")).toBeNull();

  expect(document.activeElement).toBe(document.body);
});

it("renders a close trigger's own element when it has no children", async () => {
  render(
    <Dialog.Root
      aria-label="Settings"
      defaultOpen
    >
      <Dialog.Content>
        <Dialog.CloseTrigger
          render={
            <button
              type="button"
              aria-label="Dismiss"
            />
          }
        />
      </Dialog.Content>
    </Dialog.Root>,
  );

  expect(await screen.findByRole("button", { name: "Dismiss" })).toBeTruthy();
});

it("shows again as a modal with its initial focus when it reopens while animating out", async () => {
  const Bouncing = () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
        >
          Open
        </button>
        <Dialog.Root
          aria-label="Settings"
          open={open}
          onOpenChange={setOpen}
          initialFocusEl={() => document.querySelector<HTMLElement>("[data-start]")}
        >
          <Dialog.Content>
            <button type="button">First</button>
            <button
              type="button"
              data-start=""
              onClick={() => {
                setOpen(false);
                requestAnimationFrame(() => setOpen(true));
              }}
            >
              Bounce
            </button>
          </Dialog.Content>
        </Dialog.Root>
      </>
    );
  };
  render(<Bouncing />);

  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  await userEvent.click(await screen.findByRole("button", { name: "Bounce" }));
  await expect.poll(() => document.querySelector("dialog")?.matches(":modal")).toBe(true);
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Bounce" }));

  await userEvent.keyboard("{Escape}");
  await expect.poll(() => document.querySelector("dialog")).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open" }));
});
