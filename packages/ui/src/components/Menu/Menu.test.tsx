import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { Menu } from "./Menu";

const openMenu = async () => {
  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  return screen.findByRole("menu");
};

describe("Menu", () => {
  it("renders an asChild link as the menu item itself", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Menu.Root>
        <Menu.Trigger>Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item
            value="settings"
            icon={<span data-testid="icon" />}
            asChild
          >
            <a href="/settings">Settings</a>
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

  it("wraps the output of a render-prop asChild child", async () => {
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
            asChild
          >
            <RenderLink>{({ active }) => `Docs ${active}`}</RenderLink>
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    await openMenu();
    const item = screen.getByRole("menuitem", { name: "Docs true" });
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
            asChild
          >
            <a
              href="/settings"
              onClick={onClick}
            >
              Settings
            </a>
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    );

    const menu = await openMenu();
    await waitFor(() => expect(document.activeElement).toBe(menu));
    await userEvent.keyboard("{ArrowDown}{Enter}");

    await waitFor(() => expect(onClick).toHaveBeenCalledTimes(1));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "settings" }));
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
});
