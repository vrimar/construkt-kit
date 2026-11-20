import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { setupUser, useFakeTime } from "../../_shared/fakeTime";
import { mockMatchMedia, viewportWidth } from "../../_shared/matchMedia";
import { sheetOf } from "../../_shared/sheet";
import { Menu } from "./Menu";

const openMenu = async () => {
  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  return screen.findByRole("menu");
};

describe("Menu", () => {
  it("renders an arrow outside the scrolling content so it is not clipped", async () => {
    render(
      <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Arrow />
          <Menu.Item value="settings">Settings</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    const menu = await openMenu();
    const arrow = document.querySelector(".menu__arrow");
    expect(arrow).not.toBeNull();
    expect(menu.contains(arrow)).toBe(false);
    expect(arrow?.parentElement).toBe(menu.parentElement);
    expect(screen.getByRole("menuitem", { name: "Settings" }).parentElement).toBe(menu);
  });

  it("opens from an arrow key as list navigation and from Enter as a trigger press", async () => {
    const onOpenChange = vi.fn();
    render(
      <Menu.Root onOpenChange={onOpenChange}>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item value="settings">Settings</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    screen.getByRole("button", { name: "Open" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: "list-navigation" }),
    );

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    screen.getByRole("button", { name: "Open" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: "trigger-press" }),
    );
  });

  describe("as a context menu", () => {
    useFakeTime();

    it("returns focus to its trigger after a keyboard-opened menu closes", async () => {
      const user = setupUser();
      render(
        <Menu.Root>
          <Menu.ContextTrigger>Row</Menu.ContextTrigger>
          <Menu.Content>
            <Menu.Item value="rename">Rename</Menu.Item>
          </Menu.Content>
        </Menu.Root>,
      );
      const trigger = screen.getByRole("button", { name: "Row" });

      trigger.focus();
      await user.pointer({ keys: "[MouseRight]", target: trigger });
      await screen.findByRole("menu");
      await user.keyboard("{Escape}");

      await waitFor(() => expect(document.activeElement).toBe(trigger));
    });
  });

  it("renders a render link as the menu item itself", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item
            value="settings"
            icon={<span data-testid="icon" />}
            render={<a href="/settings" />}
          >
            Settings
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    const menu = await openMenu();
    const item = screen.getByRole("menuitem", { name: "Settings" });
    expect(item.tagName).toBe("A");
    expect(item.getAttribute("href")).toBe("/settings");
    expect(item.parentElement).toBe(menu);
    expect(item.firstElementChild).toBe(screen.getByTestId("icon"));
    expect(item.textContent).toBe("Settings");
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("wraps the output of a render link's render-prop children", async () => {
    const RenderLink = ({
      children,
      ...props
    }: {
      children: (state: { active: boolean }) => ReactNode;
    }) => (
      <a
        href="/docs"
        {...props}
      >
        {children({ active: true })}
      </a>
    );
    render(
      <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item
            value="docs"
            icon={<span data-testid="icon" />}
            render={<RenderLink>{({ active }) => `Docs ${active}`}</RenderLink>}
          />
        </Menu.Content>
      </Menu.Root>,
    );

    await openMenu();
    const item = screen.getByRole("menuitem", { name: "Docs true" });
    expect(item.firstElementChild).toBe(screen.getByTestId("icon"));
  });

  it("renders a trigger item's icon before its label", async () => {
    render(
      <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Root>
            <Menu.TriggerItem icon={<span data-testid="icon" />}>More</Menu.TriggerItem>
            <Menu.Content>
              <Menu.Item value="child">Child</Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </Menu.Content>
      </Menu.Root>,
    );

    await openMenu();
    const item = screen.getByRole("menuitem", { name: "More" });
    expect(item.firstElementChild).toBe(screen.getByTestId("icon"));
  });

  it("clicks a link item on Enter so its handler runs and the menu closes", async () => {
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    const onSelect = vi.fn();
    render(
      <Menu.Root onSelect={onSelect}>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item
            value="settings"
            render={
              <a
                href="/settings"
                onClick={onClick}
              />
            }
          >
            Settings
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    const menu = await openMenu();
    await waitFor(() => expect(document.activeElement).toBe(menu));
    await userEvent.keyboard("{ArrowDown}{Enter}");

    await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
    expect(onSelect).toHaveBeenCalledWith("settings");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("marks destructive items", async () => {
    render(
      <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item value="edit">Edit</Menu.Item>
          <Menu.Item
            value="delete"
            destructive
          >
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    await openMenu();
    expect(screen.getByRole("menuitem", { name: "Delete" }).hasAttribute("data-destructive")).toBe(
      true,
    );
    expect(screen.getByRole("menuitem", { name: "Edit" }).hasAttribute("data-destructive")).toBe(
      false,
    );
  });

  describe("on phones", () => {
    // jsdom loads no stylesheet, so the sheet's pointer-events override on its content is absent.
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

    const renderOnPhone = (ui: ReactNode) => {
      mockMatchMedia(viewportWidth(375));
      render(ui);
    };

    it("drills into a submenu inside the same sheet and back out", async () => {
      const onSubmenuSelect = vi.fn();
      renderOnPhone(
        <Menu.Root>
          <Menu.Trigger>Open</Menu.Trigger>
          <Menu.Content>
            <Menu.Item value="rename">Rename</Menu.Item>
            <Menu.Root onSelect={onSubmenuSelect}>
              <Menu.TriggerItem>Export</Menu.TriggerItem>
              <Menu.Content backLabel="Actions">
                <Menu.Item value="csv">CSV</Menu.Item>
              </Menu.Content>
            </Menu.Root>
          </Menu.Content>
        </Menu.Root>,
      );

      await user.click(screen.getByRole("button", { name: "Open" }));
      const menu = await screen.findByRole("menu");
      const sheet = sheetOf(menu);
      await user.click(screen.getByRole("menuitem", { name: "Export" }));

      const csv = await screen.findByRole("menuitem", { name: "CSV" });
      expect(sheetOf(csv)).toBe(sheet);

      await user.click(screen.getByRole("menuitem", { name: "Actions" }));
      await waitFor(() => expect(screen.queryByRole("menuitem", { name: "CSV" })).toBeNull());
      expect(screen.getByRole("menuitem", { name: "Rename" })).not.toBeNull();
      expect(onSubmenuSelect).not.toHaveBeenCalled();
    });

    it("keeps a submenu anchored when its parent is", async () => {
      renderOnPhone(
        <Menu.Root mobileLayout="popover">
          <Menu.Trigger>Open</Menu.Trigger>
          <Menu.Content>
            <Menu.Root>
              <Menu.TriggerItem>Export</Menu.TriggerItem>
              <Menu.Content>
                <Menu.Item value="csv">CSV</Menu.Item>
              </Menu.Content>
            </Menu.Root>
          </Menu.Content>
        </Menu.Root>,
      );

      await user.click(screen.getByRole("button", { name: "Open" }));
      await user.click(await screen.findByRole("menuitem", { name: "Export" }));

      const csv = await screen.findByRole("menuitem", { name: "CSV" });
      expect(sheetOf(csv)).toBeNull();
    });
  });
});
