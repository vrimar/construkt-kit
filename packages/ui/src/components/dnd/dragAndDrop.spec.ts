import { type Page, expect, storyTest } from "@construkt-kit/story-kit/test";
import { startDrag } from "@construkt-kit/testing";

const BOARD = ["components-draganddrop--across-lists"] as const;

const list = (page: Page, name: string) => page.getByText(name, { exact: true }).locator("..");

storyTest(
  BOARD,
  "a native drag lands on the list it lets go over",
  async ({ page }) => {
    const drag = await startDrag(page, page.getByText("Book venue"), { kind: "native" });
    await drag.moveTo(list(page, "Done"));
    await drag.drop();
    await expect(list(page, "Done").getByText("Book venue")).toBeVisible();
  },
  { only: "desktop" },
);

storyTest(
  BOARD,
  "a cancelled native drag lands nowhere, though it passed over a list that takes it",
  async ({ page }) => {
    const drag = await startDrag(page, page.getByText("Book venue"), { kind: "native" });
    await drag.moveTo(list(page, "Done"));
    await drag.cancel(list(page, "To do"));
    await expect(list(page, "To do").getByText("Book venue")).toBeVisible();
    await expect(list(page, "Done").getByText("Book venue")).toHaveCount(0);
  },
  { only: "desktop" },
);
