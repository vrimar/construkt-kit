import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-toast--default"])) {
  test(
    `${id} a hovered toast outlasts its duration and leaves once the pointer does`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "Success" }).click();
      const toast = page.getByRole("status", { name: "Success!" });

      await toast.hover();
      await page.waitForTimeout(2500);
      await expect(toast).toBeVisible();

      await page.mouse.move(4, 4);
      await expect(toast).toBeHidden();
    },
  );
}

for (const id of selectStories(["components-toast--stacked"])) {
  const tag = [...storyTags(id), "@desktop-only"];

  test(
    `${id} hovering the stack spreads it out and leaving stacks it again`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const front = page.getByRole("status", { name: "Upload failed" });
      const next = page.getByRole("status", { name: "Changes saved" });
      const gapBelowFront = async () => {
        const [above, below] = await Promise.all([front.boundingBox(), next.boundingBox()]);
        if (!above || !below) throw new Error("A toast has no box.");
        return Math.round(below.y - (above.y + above.height));
      };

      await front.hover();
      await expect.poll(gapBelowFront).toBe(16);

      await page.mouse.move(4, 4);
      await expect.poll(gapBelowFront).toBeLessThan(0);
    },
  );

  test(
    `${id} a swipe past the threshold dismisses a toast and a short one doesn't`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const toast = page.getByRole("status", { name: "Upload failed" });
      const description = page.getByText("report.pdf is larger than 10 MB.");
      await description.hover({ position: { x: 8, y: 8 } });
      const text = await description.boundingBox();
      if (!text) throw new Error("The toast's description has no box.");
      const x = text.x + 8;
      const y = text.y + 8;

      await page.mouse.down();
      await page.mouse.move(x + 24, y, { steps: 6 });
      await page.mouse.up();
      await expect(toast).toHaveAttribute("data-open", "");

      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 120, y, { steps: 8 });
      await page.mouse.up();
      await expect(toast).toBeHidden();
    },
  );
}

for (const id of selectStories(["components-dialog--with-pickers"])) {
  test(
    `${id} a press, focus and Escape in the toaster leave the menu under it open`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "Schedule delivery" }).click();
      await page.getByRole("button", { name: "Remind me" }).click();
      const toast = page.getByRole("status", { name: "We'll remind you the day before" });
      await page.getByRole("button", { name: "Repeat: Never" }).click();
      const item = page.getByRole("menuitem", { name: "Weekly" });
      await expect(item).toBeVisible();

      await toast.click({ position: { x: 24, y: 24 } });
      await expect(toast).toBeFocused();
      await expect(item).toBeVisible();

      await page.keyboard.press("Alt+KeyT");
      await expect(page.getByRole("region", { name: /^Notifications/ })).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(item).toBeVisible();
      await expect(page.getByRole("dialog", { name: "Schedule delivery" })).toBeVisible();
    },
  );
}

for (const id of selectStories(["components-toast--replaced-by-id"])) {
  test(
    `${id} a toast created again under a removed toast's id enters anew and lasts its full duration`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: "Save draft" }));
      await expect(page.getByRole("status", { name: "Draft saved" })).toBeVisible();
      await page.waitForTimeout(1200);
      await page.evaluate(() => {
        const motion: string[] = [];
        Object.assign(window, { toastMotion: motion });
        document.addEventListener(
          "transitionrun",
          (event) => {
            if (event.target instanceof Element && event.target.matches("[role=status]")) {
              motion.push(event.propertyName);
            }
          },
          true,
        );
      });

      await gallery.press(page.getByRole("button", { name: "Save again" }));
      const again = page.getByRole("status", { name: "Draft saved again" });
      await expect(again).toBeVisible();
      await page.waitForTimeout(1300);

      await expect(again).toHaveAttribute("data-open", "");
      expect(
        await page.evaluate(() => (window as unknown as { toastMotion: string[] }).toastMotion),
      ).toContain("opacity");
    },
  );
}
