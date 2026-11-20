import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-popover--nested"])) {
  const tag = [...storyTags(id), "@desktop-only"];

  test(`${id} Escape closes only the topmost popover`, { tag }, async ({ gallery, page }) => {
    await gallery.open(id);
    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("button", { name: "More options" }).click();
    await expect(page.getByText("Archived items stay hidden.")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByText("Archived items stay hidden.")).toBeHidden();
    await expect(page.getByText("Filter the list by owner and status.")).toBeVisible();
  });

  test(
    `${id} a press that starts inside and ends outside keeps it open`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "Filters" }).click();
      const text = page.getByText("Filter the list by owner and status.");
      const box = await text.boundingBox();
      if (!box) throw new Error("The popover body has no box to press in.");

      await page.mouse.move(box.x + 4, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(4, 4, { steps: 4 });
      await page.mouse.up();

      await expect(text).toBeVisible();
    },
  );

  test(
    `${id} opening a sibling closes the first, and a press in a nested popover keeps its parent`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "Filters" }).click();
      await page.getByRole("button", { name: "More options" }).click();
      await page.getByText("Archived items stay hidden.").click();
      await expect(page.getByText("Filter the list by owner and status.")).toBeVisible();

      await page.getByRole("button", { name: "Sort" }).click();

      await expect(page.getByText("Newest first.")).toBeVisible();
      await expect(page.getByText("Filter the list by owner and status.")).toBeHidden();
    },
  );

  test(`${id} a press outside returns focus to the trigger`, { tag }, async ({ gallery, page }) => {
    await gallery.open(id);
    const trigger = page.getByRole("button", { name: "Filters" });
    await trigger.click();
    await expect(page.getByRole("button", { name: "More options" })).toBeFocused();

    await page.mouse.click(4, 4);

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test(
    `${id} Tab out of a popover closes it and lands after its trigger`,
    { tag },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await page.getByRole("button", { name: "Filters" }).click();
      await expect(page.getByRole("button", { name: "More options" })).toBeFocused();

      await page.keyboard.press("Tab");

      await expect(page.getByRole("button", { name: "Sort" })).toBeFocused();
      await expect(page.getByText("Filter the list by owner and status.")).toBeHidden();
    },
  );
}

for (const id of selectStories(["components-popover--exit-animation"])) {
  test(
    `${id} stays in place while it animates out and when it reopens before it has gone`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const trigger = page.getByRole("button", { name: "Filters" });
      await trigger.click();
      const body = page.getByText("Filter the list by owner and status.");
      await expect(body).toBeVisible();
      const placed = (await body.boundingBox())?.y;
      const top = async () => (await body.boundingBox())?.y;

      await trigger.click();
      await expect.poll(top).toBe(placed);
      await trigger.click();

      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect.poll(top).toBe(placed);
    },
  );
}

for (const id of selectStories(["components-popover--kept-open-on-focus-out"])) {
  test(
    `${id} returns focus to the trigger when closed from inside after keeping open on a focus-out`,
    { tag: [...storyTags(id), "@desktop-only"] },
    async ({ gallery, page }) => {
      await gallery.open(id);
      const trigger = page.getByRole("button", { name: "Filters" });
      await trigger.click();
      const owner = page.getByRole("textbox", { name: "Owner" });
      await expect(owner).toBeFocused();
      await page.getByRole("button", { name: "Elsewhere" }).focus();
      await expect(owner).toBeVisible();
      await owner.click();

      await page.getByRole("button", { name: "Done" }).click();

      await expect(trigger).toBeFocused();
    },
  );
}
