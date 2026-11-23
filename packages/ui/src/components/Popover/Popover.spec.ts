import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-popover--nested"],
  "Escape closes only the topmost popover",
  async ({ page }) => {
    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("button", { name: "More options" }).click();
    await expect(page.getByText("Archived items stay hidden.")).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByText("Archived items stay hidden.")).toBeHidden();
    await expect(page.getByText("Filter the list by owner and status.")).toBeVisible();
  },
  { only: "desktop" },
);

storyTest(
  ["components-popover--nested"],
  "a press that starts inside and ends outside keeps it open",
  async ({ page }) => {
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
  { only: "desktop" },
);

storyTest(
  ["components-popover--nested"],
  "opening a sibling closes the first, and a press in a nested popover keeps its parent",
  async ({ page }) => {
    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("button", { name: "More options" }).click();
    await page.getByText("Archived items stay hidden.").click();
    await expect(page.getByText("Filter the list by owner and status.")).toBeVisible();

    await page.getByRole("button", { name: "Sort" }).click();

    await expect(page.getByText("Newest first.")).toBeVisible();
    await expect(page.getByText("Filter the list by owner and status.")).toBeHidden();
  },
  { only: "desktop" },
);

storyTest(
  ["components-popover--nested"],
  "a press outside returns focus to the trigger",
  async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Filters" });
    await trigger.click();
    await expect(page.getByRole("button", { name: "More options" })).toBeFocused();

    await page.mouse.click(4, 4);

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
  },
  { only: "desktop" },
);

storyTest(
  ["components-popover--nested"],
  "Tab out of a popover closes it and lands after its trigger",
  async ({ page }) => {
    await page.getByRole("button", { name: "Filters" }).click();
    await expect(page.getByRole("button", { name: "More options" })).toBeFocused();

    await page.keyboard.press("Tab");

    await expect(page.getByRole("button", { name: "Sort" })).toBeFocused();
    await expect(page.getByText("Filter the list by owner and status.")).toBeHidden();
  },
  { only: "desktop" },
);

storyTest(
  ["components-popover--exit-animation"],
  "stays in place while it animates out and when it reopens before it has gone",
  async ({ page }) => {
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
  { only: "desktop" },
);

storyTest(
  ["components-popover--kept-open-on-focus-out"],
  "returns focus to the trigger when closed from inside after keeping open on a focus-out",
  async ({ page }) => {
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
  { only: "desktop" },
);
