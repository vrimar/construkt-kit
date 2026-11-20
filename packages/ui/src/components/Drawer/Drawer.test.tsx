import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Drawer } from ".";
import { mockMatchMedia, viewportWidth } from "../../_shared/matchMedia";

describe("Drawer", () => {
  it("ActionTrigger closes the drawer", async () => {
    render(
      <Drawer.Root
        defaultOpen
        title="Filters"
      >
        <Drawer.Content>
          <Drawer.ActionTrigger>Done</Drawer.ActionTrigger>
        </Drawer.Content>
      </Drawer.Root>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => expect(screen.queryByText("Filters")).toBeNull());
  });

  it("swipes in the direction of the placement in effect at the current breakpoint", () => {
    mockMatchMedia(viewportWidth(800));
    render(
      <Drawer.Root
        defaultOpen
        title="Filters"
        placement={{ base: "bottom", md: "end" }}
      >
        <Drawer.Content>Body</Drawer.Content>
      </Drawer.Root>,
    );

    expect(screen.getByText("Body").getAttribute("data-swipe-direction")).toBe("right");
  });

  it("swipes towards the side its direction lays an end drawer out on", () => {
    render(
      <div dir="rtl">
        <Drawer.Root
          defaultOpen
          title="Filters"
        >
          <Drawer.Content>Body</Drawer.Content>
        </Drawer.Root>
      </div>,
    );

    expect(screen.getByText("Body").getAttribute("data-swipe-direction")).toBe("left");
  });
});
