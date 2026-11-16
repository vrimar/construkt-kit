import { render, screen, waitFor } from "@testing-library/react";
import { PointerEventsCheckLevel, type UserEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { setupUser, settle, useFakeTime } from "../../_shared/fakeTime";
import { mockMatchMedia, viewportWidth } from "../../_shared/matchMedia";
import { Popover, type PopoverRootProps } from "./Popover";

const renderOpen = async (props: Omit<PopoverRootProps, "children">) => {
  render(
    <Popover.Root
      open
      {...props}
    >
      <Popover.Trigger>Open</Popover.Trigger>
      <Popover.Content>Body</Popover.Content>
    </Popover.Root>,
  );
  const content = screen.getByText("Body");
  const positioner = content.parentElement;
  await waitFor(() => expect(positioner?.style.getPropertyValue("--x")).not.toBe(""));
  return { placement: content.getAttribute("data-placement"), positioner };
};

describe("Popover", () => {
  useFakeTime();
  let user: UserEvent;
  beforeEach(() => {
    user = setupUser();
  });
  it("keeps placement when positioning is passed", async () => {
    const { placement, positioner } = await renderOpen({
      placement: "left",
      positioning: { gutter: 4 },
    });

    expect(placement).toBe("left");
    expect(positioner?.style.getPropertyValue("--x")).toBe("-4px");
  });

  it("uses positioning.placement when placement is omitted", async () => {
    const { placement } = await renderOpen({ positioning: { placement: "right" } });

    expect(placement).toBe("right");
  });

  it("names lazily mounted content after its title and description", async () => {
    render(
      <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>
          <Popover.Title>Rename</Popover.Title>
          <Popover.Description>Pick a new name</Popover.Description>
        </Popover.Content>
      </Popover.Root>,
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog.getAttribute("aria-labelledby")).not.toBeNull());
    expect(document.getElementById(dialog.getAttribute("aria-labelledby") ?? "")?.textContent).toBe(
      "Rename",
    );
    expect(
      document.getElementById(dialog.getAttribute("aria-describedby") ?? "")?.textContent,
    ).toBe("Pick a new name");
  });

  it("prefers placement over positioning.placement", async () => {
    const { placement } = await renderOpen({
      placement: "top",
      positioning: { placement: "right" },
    });

    expect(placement).toBe("top");
  });

  describe("on phones", () => {
    const sheetOf = (element: Element) => element.closest("[data-overlay-sheet]");

    const renderOnPhone = (props: Omit<PopoverRootProps, "children">) => {
      mockMatchMedia(viewportWidth(375));
      render(
        <Popover.Root {...props}>
          <Popover.Trigger>Open</Popover.Trigger>
          <Popover.Content>Body</Popover.Content>
        </Popover.Root>,
      );
    };

    it("keeps an overlay that won't take focus anchored", async () => {
      renderOnPhone({ autoFocus: false });

      await user.click(screen.getByRole("button", { name: "Open" }));

      expect(sheetOf(await screen.findByText("Body"))).toBeNull();
    });

    it("keeps a sheet open on an outside tap when the overlay asks to", async () => {
      // jsdom loads no stylesheet, so the sheet's pointer-events override on its content is absent.
      user = setupUser({ pointerEventsCheck: PointerEventsCheckLevel.Never });
      renderOnPhone({ closeOnInteractOutside: false });

      await user.click(screen.getByRole("button", { name: "Open" }));
      const body = await screen.findByText("Body");
      expect(sheetOf(body)).not.toBeNull();
      await settle();
      await user.click(
        document.querySelector('[data-scope="drawer"][data-part="backdrop"]') as Element,
      );

      await settle();
      expect(screen.queryByText("Body")).not.toBeNull();
    });
  });
});
