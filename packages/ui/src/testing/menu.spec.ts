import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { menuItem, pickMenuItem } from "./menu";
import { openPopup } from "./popup";

storyTest(
  ["components-menu--default"],
  "pickMenuItem picks an item through its submenu, anchored or in a phone sheet",
  async ({ page }) => {
    await pickMenuItem(page.getByRole("button", { name: "Open Menu" }), ["Share", "Email"]);

    await expect(page.getByRole("menu")).toHaveCount(0);
  },
);

storyTest(
  ["components-menu--filter-and-sort"],
  "menuItem finds switch items and segments, which take toBeChecked",
  async ({ page }) => {
    const menu = await openPopup(page.getByRole("button", { name: "Filter" }));

    await menuItem(menu, "Group by type").click();
    await menuItem(menu, "Name").click();

    await expect(menuItem(menu, "Group by type")).not.toBeChecked();
    await expect(menuItem(menu, "Name")).toBeChecked();
  },
);
