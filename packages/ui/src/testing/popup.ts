import type { Locator } from "@playwright/test";

export const byId = (id: string): string => `[id=${JSON.stringify(id)}]`;

export async function pinned(locator: Locator): Promise<Locator> {
  const id = await locator.getAttribute("id");
  return id ? locator.page().locator(byId(id)) : locator;
}

/**
 * The content of the open popup `trigger` controls — a Popover, a Menu or submenu, a Select's
 * popup, a Dialog — through the `aria-controls` it carries while the popup is open. Waits for it to
 * open. On a phone, an open sheet hides the page from role queries: pass a trigger found another
 * way, or open it with `openPopup`.
 */
export async function popupFor(trigger: Locator): Promise<Locator> {
  const page = trigger.page();
  const controlling = trigger.and(page.locator("[aria-controls]"));
  await controlling.waitFor({ state: "attached" });
  const id = await controlling.getAttribute("aria-controls");
  if (!id) throw new Error(`${String(trigger)} controls no popup.`);
  return page.locator(byId(id));
}

/**
 * Presses `trigger` unless its popup is already open, and returns the popup's content as
 * `popupFor` finds it: a Popover's content, a Menu (or a submenu from its `Menu.TriggerItem`), a
 * Select's popup, a Dialog. Works the same when the popup opens as a phone sheet.
 */
export async function openPopup(trigger: Locator): Promise<Locator> {
  const target = await pinned(trigger);
  if ((await target.getAttribute("aria-expanded")) !== "true") await target.click();
  return popupFor(target);
}
