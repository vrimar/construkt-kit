import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-hovercard--default"])) {
  test(
    `${id} a press inside the card keeps it open after its trigger took focus`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const trigger = page.getByRole("button", { name: "Hover me" });
      await trigger.click();
      await expect(trigger).toBeFocused();
      const body = page.getByText("This card appears on hover.");
      await expect(body).toBeVisible();

      await body.click();

      await expect(trigger).toHaveAttribute("data-open");
    },
  );

  test(
    `${id} keyboard focus on the trigger opens the card`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);

      await page.keyboard.press("Tab");

      await expect(page.getByRole("button", { name: "Hover me" })).toBeFocused();
      await expect(page.getByText("This card appears on hover.")).toBeVisible();
    },
  );

  test(
    `${id} a tap on the trigger leaves the card closed`,
    { tag: [...storyTags(id), "@phone-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const trigger = page.getByRole("button", { name: "Hover me" });

      await gallery.press(trigger);
      await page.waitForTimeout(900);

      await expect(trigger).toHaveAttribute("data-closed");
      await expect(page.getByText("This card appears on hover.")).toBeHidden();
    },
  );
}
