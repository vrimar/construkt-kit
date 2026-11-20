import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const tagsOf = (id: Parameters<typeof storyTags>[0]) => [...storyTags(id), "@desktop-only"];

for (const id of selectStories(["components-colorpicker--open"])) {
  test(
    `${id} arrow keys move the area thumb along its own axis and Page Up steps x by ten`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const thumb = page.getByRole("slider", { name: "saturation and brightness" });

      await thumb.focus();
      await page.keyboard.press("ArrowUp");
      await expect(thumb).toHaveAttribute("aria-valuetext", "saturation 0, brightness 1");
      await page.keyboard.press("ArrowRight");
      await expect(thumb).toHaveAttribute("aria-valuetext", "saturation 1, brightness 1");
      await page.keyboard.press("PageUp");
      await expect(thumb).toHaveAttribute("aria-valuetext", "saturation 11, brightness 1");
    },
  );

  test(
    `${id} a drag on the area to its top end picks full saturation and brightness`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const area = page.locator("[data-slot=area]");
      const content = page.locator("[data-slot=content]");
      const [areaBox, contentBox] = [await area.boundingBox(), await content.boundingBox()];
      if (!areaBox || !contentBox) throw new Error("The color area has no box.");

      await area.dragTo(content, {
        sourcePosition: { x: areaBox.width / 2, y: areaBox.height / 2 },
        targetPosition: {
          x: areaBox.x + areaBox.width + 8 - contentBox.x,
          y: areaBox.y - 8 - contentBox.y,
        },
      });

      await expect(page.getByRole("textbox", { name: "hex" })).toHaveValue("#FF0000");
      await expect(page.getByRole("slider", { name: "saturation and brightness" })).toBeFocused();
    },
  );

  test(
    `${id} Escape mid-drag closes the picker on the pressed color and returns focus to the trigger`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const area = page.locator("[data-slot=area]");
      const trigger = page.getByRole("button", { name: /current color is/ });
      const box = await area.boundingBox();
      if (!box) throw new Error("The color area has no box.");

      await page.mouse.move(box.x + box.width / 4, box.y + box.height / 4);
      await page.mouse.down();
      await expect(page.getByRole("textbox", { name: "hex" })).not.toHaveValue("#000000");
      await page.keyboard.press("Escape");
      await expect(area).toBeHidden();
      const pressed = await trigger.getAttribute("aria-label");
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
      await page.mouse.up();

      await expect(trigger).toHaveAttribute("aria-label", pressed ?? "");
      await expect(trigger).toBeFocused();
    },
  );
}
