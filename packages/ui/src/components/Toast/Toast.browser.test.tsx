import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Dialog } from "../Dialog";
import { Popover } from "../Popover";
import { Toaster } from "./Toast";

it("keeps the toaster showing when a dialog closes as a popover opens", async () => {
  const { rerender } = render(
    <>
      <Toaster />
      <Dialog.Root
        defaultOpen
        title="Own set"
      >
        <Dialog.Content />
      </Dialog.Root>
    </>,
  );
  await screen.findByRole("dialog", { name: "Own set" });
  await expect
    .poll(() => screen.getByRole("region", { name: /Notifications/ }).closest("dialog"))
    .not.toBeNull();

  rerender(
    <>
      <Toaster />
      <Popover.Root defaultOpen>
        <Popover.Trigger>Sets</Popover.Trigger>
        <Popover.Content aria-label="Banner sets" />
      </Popover.Root>
    </>,
  );

  await screen.findByRole("dialog", { name: "Banner sets" });
  await expect
    .poll(() => screen.getByRole("region", { name: /Notifications/ }).matches(":popover-open"))
    .toBe(true);
});
