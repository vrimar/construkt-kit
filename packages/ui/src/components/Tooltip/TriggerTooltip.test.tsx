import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Menu } from "../Menu";
import { Popover } from "../Popover";

const surfaces = [
  {
    scope: "popover",
    element: (
      <Popover.Root>
        <Popover.Trigger tooltip="More">Open</Popover.Trigger>
        <Popover.Content>Body</Popover.Content>
      </Popover.Root>
    ),
  },
  {
    scope: "menu",
    element: (
      <Menu.Root>
        <Menu.Trigger tooltip="More">Open</Menu.Trigger>
        <Menu.Content>
          <Menu.Item value="edit">Edit</Menu.Item>
        </Menu.Content>
      </Menu.Root>
    ),
  },
];

describe("withTriggerTooltip", () => {
  it.each(surfaces)(
    "keeps the $scope trigger's own state attributes",
    async ({ scope, element }) => {
      render(element);
      const trigger = screen.getByRole("button", { name: "Open" });

      expect(trigger.getAttribute("data-scope")).toBe(scope);
      expect(trigger.getAttribute("data-state")).toBe("closed");

      await userEvent.click(trigger);
      expect(trigger.getAttribute("data-state")).toBe("open");
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
    },
  );

  it.each(surfaces)("keeps the tooltip closed while the $scope is open", async ({ element }) => {
    render(element);
    const trigger = screen.getByRole("button", { name: "Open" });

    await userEvent.click(trigger);
    await userEvent.unhover(trigger);
    await userEvent.hover(trigger);
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
