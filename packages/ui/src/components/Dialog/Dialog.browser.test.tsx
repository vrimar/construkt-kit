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
