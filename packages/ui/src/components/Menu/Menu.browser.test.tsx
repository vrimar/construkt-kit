import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { userEvent } from "vitest/browser";

import { Menu } from "./Menu";

it("opens at its button when it also has a context trigger", async () => {
  render(
    <Menu.Root>
      <Menu.ContextTrigger>Row</Menu.ContextTrigger>
      <Menu.Trigger>Open</Menu.Trigger>
      <Menu.Content>
        <Menu.Item value="rename">Rename</Menu.Item>
      </Menu.Content>
    </Menu.Root>,
  );
  const trigger = screen.getByRole("button", { name: "Open" });

  await userEvent.click(trigger);

  const menu = await screen.findByRole("menu");
  await expect
    .poll(() => menu.getBoundingClientRect().top)
    .toBeCloseTo(trigger.getBoundingClientRect().bottom + 8, 0);
  expect(menu.getBoundingClientRect().left).toBeCloseTo(trigger.getBoundingClientRect().left, 0);
});
