import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { listOption, listbox, openSelect, pickOption, selectedOptions } from "./listbox";

storyTest(
  ["components-select--default"],
  "pickOption picks from a select, anchored or in a phone sheet",
  async ({ page }) => {
    await pickOption(page.getByRole("button", { name: "Select fruit" }), "Banana");

    await expect(page.getByRole("button", { name: "Banana" })).toBeVisible();
  },
);

storyTest(
  ["components-select--multiple"],
  "selectedOptions reads a multiple select's picks in list order",
  async ({ page }) => {
    const list = await openSelect(page.getByRole("button", { name: "Select fruits" }));

    await listOption(list, "Cherry").click();
    await listOption(list, "Apple").click();

    await expect(selectedOptions(list)).toHaveText(["Apple", "Cherry"]);
  },
);

storyTest(
  ["components-listbox--overlay-actions"],
  "listbox, listOption and selectedOptions find a list whose items have actions",
  async ({ page }) => {
    const list = listbox(page, "Fruit");

    await listOption(list, "Banana").hover();

    await expect(selectedOptions(list)).toHaveAccessibleName("Dragon fruit");
  },
);
