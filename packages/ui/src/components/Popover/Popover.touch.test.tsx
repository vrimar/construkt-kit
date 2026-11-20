import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { sheetOf } from "../../_shared/sheet";
import { Popover, type PopoverRootProps } from "./Popover";

const renderPopover = (props: Omit<PopoverRootProps, "children">) =>
  render(
    <Popover.Root {...props}>
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Content>Body</Popover.Content>
    </Popover.Root>,
  );

it("keeps an overlay that won't take focus anchored on a phone", async () => {
  renderPopover({ autoFocus: false });

  await userEvent.click(screen.getByRole("button", { name: "Open" }));

  expect(sheetOf(await screen.findByText("Body"))).toBeNull();
});

it("keeps the phone sheet open on an outside tap when the popover asks to", async () => {
  renderPopover({ closeOnInteractOutside: false });

  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  const body = await screen.findByText("Body");
  expect(sheetOf(body)).not.toBeNull();
  await new Promise((resolve) => setTimeout(resolve, 400));
  // The sheet blocks pointer events outside it, so the tap lands on <html>, as a real one does.
  await userEvent.click(document.body, { position: { x: 8, y: 8 }, force: true });

  await new Promise((resolve) => setTimeout(resolve, 400));
  expect(screen.queryByText("Body")).not.toBeNull();
});
