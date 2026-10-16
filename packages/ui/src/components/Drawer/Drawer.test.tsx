import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { Drawer, useDrawer } from ".";
import { createMatchMediaController } from "../../_shared/matchMedia";

describe("Drawer", () => {
  it("ActionTrigger closes the drawer", async () => {
    render(
      <Drawer.Root defaultOpen>
        <Drawer.Content>
          <Drawer.Title>Filters</Drawer.Title>
          <Drawer.ActionTrigger>Done</Drawer.ActionTrigger>
        </Drawer.Content>
      </Drawer.Root>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => expect(screen.queryByText("Filters")).toBeNull());
  });

  it("swipes in the direction of the placement in effect at the current breakpoint", () => {
    const media = createMatchMediaController(
      (query) => Number(/width >= ([\d.]+)rem/.exec(query)?.[1] ?? Infinity) * 16 <= 800,
    );
    vi.spyOn(window, "matchMedia").mockImplementation(media.matchMedia);
    onTestFinished(() => {
      vi.restoreAllMocks();
    });
    render(
      <Drawer.Root
        defaultOpen
        placement={{ base: "bottom", md: "end" }}
      >
        <Drawer.Content>
          <Drawer.Title>Filters</Drawer.Title>
        </Drawer.Content>
      </Drawer.Root>,
    );

    expect(screen.getByRole("dialog").getAttribute("data-swipe-direction")).toBe("right");
  });

  it("styles a RootProvider by the placement given to useDrawer and swipes that way", () => {
    const StartDrawer = () => (
      <Drawer.RootProvider value={useDrawer({ placement: "start", defaultOpen: true })}>
        <Drawer.Content>
          <Drawer.Title>Filters</Drawer.Title>
        </Drawer.Content>
      </Drawer.RootProvider>
    );
    render(<StartDrawer />);

    const content = screen.getByRole("dialog");
    expect(content.getAttribute("data-swipe-direction")).toBe("left");
    expect(content.className).toContain("drawer__content--placement_start");
  });
});
