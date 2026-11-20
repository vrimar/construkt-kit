import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

const tagsOf = (id: Parameters<typeof storyTags>[0]) => [...storyTags(id), "@desktop-only"];

for (const id of selectStories(["components-menu--hints"])) {
  test(
    `${id} typeahead moves on from the highlighted item and wraps`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const item = (name: string) => page.getByRole("menuitem", { name, exact: true });
      await page.getByRole("button", { name: "Edit" }).click();
      await expect(page.getByRole("menu")).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowDown");
      await expect(item("Paste")).toHaveAttribute("data-highlighted", "");

      await page.keyboard.press("c");
      await expect(item("Comments")).toHaveAttribute("data-highlighted", "");
      await page.keyboard.press("c");
      await expect(item("Cut")).toHaveAttribute("data-highlighted", "");
      await page.keyboard.press("c");
      await expect(item("Copy")).toHaveAttribute("data-highlighted", "");
    },
  );
}

for (const id of selectStories(["components-menu--disabled-with-reason"])) {
  test(`${id} typeahead skips disabled items`, { tag: tagsOf(id) }, async ({ gallery, page }) => {
    await gallery.open(id);
    const grace = page.getByRole("menuitem", { name: "Grace Hopper" });
    await page.getByRole("button", { name: "Assign" }).click();
    await expect(page.getByRole("menu")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(grace).toHaveAttribute("data-highlighted", "");

    await page.keyboard.press("a");

    await expect(grace).toHaveAttribute("data-highlighted", "");
    await expect(page.locator("[role=menuitem][data-highlighted]")).toHaveCount(1);
  });
}

for (const id of selectStories(["components-menu--default"])) {
  test(
    `${id} focus returns to the trigger after Escape, an outside press and a select`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const trigger = page.getByRole("button", { name: "Open Menu" });
      const menu = page.getByRole("menu");

      await trigger.click();
      await expect(menu).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();

      await trigger.click();
      await expect(menu).toBeFocused();
      await page.mouse.click(640, 600);
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();

      await trigger.click();
      await page.getByRole("menuitem", { name: "Duplicate" }).click();
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
    },
  );

  test(
    `${id} with a submenu open, a press on the menu closes the submenu and one outside closes both`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const trigger = page.getByRole("button", { name: "Open Menu" });
      const share = page.getByRole("menuitem", { name: "Share" });
      const copyLink = page.getByRole("menuitem", { name: "Copy link" });

      await trigger.click();
      await share.hover();
      await expect(copyLink).toBeVisible();
      await page.getByRole("menu").first().getByRole("separator").click();
      await expect(copyLink).toBeHidden();
      await expect(share).toBeVisible();

      await share.hover();
      await expect(copyLink).toBeVisible();
      await page.mouse.click(640, 600);
      await expect(page.getByRole("menu")).toHaveCount(0);
      await expect(trigger).toBeFocused();
    },
  );
}

for (const id of selectStories(["components-menu--context-menu"])) {
  test(
    `${id} focus returns to where it was after Escape, an outside press and a select`,
    { tag: tagsOf(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const area = page.getByRole("button", { name: "Right-click here" });
      const menu = page.getByRole("menu");

      await area.click({ button: "right" });
      await expect(menu).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(area).toBeFocused();

      await area.click({ button: "right" });
      await expect(menu).toBeFocused();
      await page.mouse.click(640, 600);
      await expect(menu).toBeHidden();
      await expect(area).toBeFocused();

      await area.click({ button: "right" });
      await page.getByRole("menuitem", { name: "Copy" }).click();
      await expect(menu).toBeHidden();
      await expect(area).toBeFocused();
    },
  );
}
