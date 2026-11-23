import type { Locator, Page } from "@playwright/test";

import { openPopup } from "./popup";

/**
 * A `Listbox`'s list, or the list a `Select` opens, by its accessible name; any one in `scope`
 * without a name. The list is a `listbox`, or a `grid` once its items have actions
 * (`renderItemActions`). A string name matches exactly.
 */
export function listbox(scope: Page | Locator, name?: string | RegExp): Locator {
  const options = name === undefined ? {} : { name, exact: true };
  return scope.getByRole("listbox", options).or(scope.getByRole("grid", options));
}

/**
 * An option of `list` by its accessible name, its label: an `option`, or a `row` in a list whose
 * items have actions. A string name matches exactly.
 */
export function listOption(list: Locator, name: string | RegExp): Locator {
  return list
    .getByRole("option", { name, exact: true })
    .or(list.getByRole("row", { name, exact: true }));
}

/**
 * The selected options of `list`, in list order. `toHaveText(["Apple", "Cherry"])` reads them while
 * the items have no actions; with actions an option's text includes theirs, and
 * `toHaveAccessibleName` reads its label alone.
 */
export function selectedOptions(list: Locator): Locator {
  return list.getByRole("option", { selected: true }).or(list.getByRole("row", { selected: true }));
}

/**
 * Opens the `Select`, `ApplySelect` or `TagSelect` whose trigger is `trigger`, unless it is open,
 * and returns its list. A `Select`'s trigger shows the selected label, so `toHaveText` on it reads
 * the value. In a `Field` its name is the label followed by the value: `/^Fruit/` finds it.
 */
export async function openSelect(trigger: Locator): Promise<Locator> {
  return listbox(await openPopup(trigger));
}

/**
 * Opens the select `trigger` opens and picks the option named `name`. A single select closes on the
 * pick; a multiple one stays open for the next, and an `ApplySelect` holds its picks until Apply.
 */
export async function pickOption(trigger: Locator, name: string | RegExp): Promise<void> {
  await listOption(await openSelect(trigger), name).click();
}
