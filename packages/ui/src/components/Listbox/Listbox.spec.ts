import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-listbox--selections"],
  "the arrow keys start from the selected option once the list takes focus",
  async ({ page }) => {
    const list = page.getByRole("listbox", { name: "check" });
    await list.focus();
    await page.keyboard.press("ArrowDown");

    await expect(list.getByRole("option", { name: "Cherry" })).toHaveAttribute(
      "data-highlighted",
      "",
    );
  },
  { only: "desktop" },
);

storyTest(
  ["components-listbox--multiple"],
  "Shift with an arrow key or Space extends the selection from the highlighted option",
  async ({ page }) => {
    const list = page.getByRole("listbox", { name: "Fruits" });
    const selected = list.getByRole("option", { selected: true });
    await list.focus();

    await page.keyboard.press("Shift+ArrowDown");
    await expect(selected).toHaveText(["Apple", "Banana"]);

    await page.keyboard.press("Shift+Space");
    await page.keyboard.press("ArrowDown");
    await expect(list.getByRole("option", { name: "Cherry" })).toHaveAttribute(
      "data-highlighted",
      "",
    );
    await expect(selected).toHaveText(["Apple", "Banana"]);
  },
  { only: "desktop" },
);

storyTest(
  ["components-listbox--multiple"],
  "Shift+Space extends the selection from the last picked option, past arrow moves",
  async ({ page }) => {
    const list = page.getByRole("listbox", { name: "Fruits" });
    const selected = list.getByRole("option", { selected: true });

    await list.getByRole("option", { name: "Banana" }).click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(list.getByRole("option", { name: "Dragon fruit" })).toHaveAttribute(
      "data-highlighted",
      "",
    );
    await page.keyboard.press("Shift+Space");
    await expect(selected).toHaveText(["Apple", "Banana", "Cherry", "Dragon fruit"]);
  },
  { only: "desktop" },
);
