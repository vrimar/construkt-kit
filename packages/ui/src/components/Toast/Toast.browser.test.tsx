import { act, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Dialog } from "../Dialog";
import { Popover } from "../Popover";
import { Toaster, toaster } from "./Toast";

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

it("mounts a new toast in its starting style, then lets it enter", async () => {
  render(<Toaster />);

  act(() => {
    toaster.create({ title: "Saved", duration: Infinity });
  });

  const toast = screen.getByRole("status");
  expect(toast.hasAttribute("data-starting-style")).toBe(true);
  await expect.poll(() => toast.hasAttribute("data-starting-style")).toBe(false);
  act(() => toaster.remove());
});

it("lets a press through to what a leaving toast covered", async () => {
  render(<Toaster />);
  act(() => {
    toaster.create({ id: "saved", title: "Saved", duration: Infinity });
  });
  const toast = screen.getByRole("status");
  await expect.poll(() => toast.hasAttribute("data-starting-style")).toBe(false);
  const box = toast.getBoundingClientRect();

  act(() => toaster.dismiss("saved"));
  await expect.poll(() => toast.hasAttribute("data-closed")).toBe(true);

  expect(toast.isConnected).toBe(true);
  const under = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
  expect(toast.contains(under)).toBe(false);
});
