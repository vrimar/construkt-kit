import type { Locator } from "@playwright/test";

import { openPopup } from "./popup";

/**
 * An item of `menu` by its accessible name, whatever its kind: an action, a `Menu.TriggerItem`, a
 * checkbox or switch item, a radio item or a `Menu.SegmentGroup` segment. A string name matches
 * exactly. A checkbox, switch, radio or segment item takes `toBeChecked()`.
 */
export function menuItem(menu: Locator, name: string | RegExp): Locator {
  return menu
    .getByRole("menuitem", { name, exact: true })
    .or(menu.getByRole("menuitemcheckbox", { name, exact: true }))
    .or(menu.getByRole("menuitemradio", { name, exact: true }));
}

/**
 * Opens the menu `trigger` opens and picks the item `path` ends with, opening the submenu each
 * earlier name leads to: `["Owner", "Mine"]` picks Mine in the Owner submenu. Works the same in a
 * phone sheet, where submenus drill down in place.
 */
export async function pickMenuItem(
  trigger: Locator,
  path: string | RegExp | readonly (string | RegExp)[],
): Promise<void> {
  const submenus = typeof path === "string" || path instanceof RegExp ? [path] : [...path];
  const last = submenus.pop();
  if (last === undefined) throw new Error("pickMenuItem needs the name of an item to pick.");
  let menu = await openPopup(trigger);
  for (const name of submenus) {
    menu = await openPopup(menu.getByRole("menuitem", { name, exact: true }));
  }
  await menuItem(menu, last).click();
}
