import { type Page, expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const headerOf = (page: Page, name: string) =>
  page.getByRole("columnheader", { name, exact: true });

async function moveOver(page: Page, name: string) {
  const target = await headerOf(page, name).boundingBox();
  if (!target) throw new Error(`Column ${name} has no box.`);
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 });
  return target;
}

for (const id of selectStories(["data-datagrid--column-groups-drop-onto"])) {
  test(
    `${id} a column dragged over another group's column drops onto it, boxed from that column's own header`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);

      await headerOf(page, "a").locator("[data-drag-handle]").hover();
      await page.mouse.down();
      const target = await moveOver(page, "d");
      const box = await page.locator("[data-axis=columns][data-position=onto]").boundingBox();
      await page.mouse.up();

      expect(box?.x).toBeCloseTo(target.x, 0);
      expect(box?.y).toBeCloseTo(target.y, 0);
      expect(await gallery.calls("onColumnsDrop")).toEqual([
        [expect.objectContaining({ ids: ["a"], targetId: "d", position: "onto" })],
      ]);
    },
  );
}

for (const id of selectStories(["data-datagrid--column-groups"])) {
  test(
    `${id} a column dragged over another group's column it can't drop onto lands at its own group's edge`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);

      await headerOf(page, "a").locator("[data-drag-handle]").hover();
      await page.mouse.down();
      await moveOver(page, "d");
      await page.mouse.up();

      expect(await gallery.calls("onColumnsDrop")).toEqual([
        [expect.objectContaining({ ids: ["a"], targetId: "b", position: "after" })],
      ]);
    },
  );
}

for (const id of selectStories(["data-datagrid--cell-tooltips"])) {
  test(
    `${id} editing a cell opens no tooltip, from the double click or from hovering the editor`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);

      await page.getByRole("gridcell", { name: "R2C2" }).dblclick();
      const editor = page.getByRole("textbox");
      await expect(editor).toBeFocused();
      await editor.hover({ position: { x: 8, y: 8 } });
      await page.waitForTimeout(800);

      await expect(page.getByRole("tooltip")).toHaveCount(0);
    },
  );

  test(
    `${id} a header click opens no tooltip, an arrow key opens the focused cell's, and a page scroll closes it`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);

      await page.getByRole("columnheader", { name: "Column 2" }).click();
      await page.mouse.move(8, 600);
      await page.waitForTimeout(100);
      await expect(page.getByRole("tooltip")).toHaveCount(0);

      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("tooltip")).toHaveText("About R2C2");

      await page.mouse.wheel(0, 120);
      await expect(page.getByRole("tooltip")).toHaveCount(0);
    },
  );
}
