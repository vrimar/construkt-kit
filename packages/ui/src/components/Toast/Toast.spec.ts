import { TIMER_SLACK_MS, expect, storyTest } from "@construkt-kit/story-kit/test";

import { getToastDuration } from "./toastStore";

const SUCCESS_DURATION = getToastDuration({ id: "success", type: "success" });

storyTest(
  ["components-toast--default"],
  "a hovered toast outlasts its duration and leaves once the pointer does",
  async ({ page }) => {
    await page.getByRole("button", { name: "Success" }).click();
    const toast = page.getByRole("status", { name: "Success!" });

    await toast.hover();
    await page.waitForTimeout(SUCCESS_DURATION + TIMER_SLACK_MS);
    await expect(toast).toBeVisible();

    await page.mouse.move(4, 4);
    await expect(toast).toBeHidden();
  },
  { only: "desktop" },
);

storyTest(
  ["components-toast--stacked"],
  "hovering the stack spreads it out and leaving stacks it again",
  async ({ page }) => {
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
  { only: "desktop" },
);

storyTest(
  ["components-toast--stacked"],
  "a pointer moving as a hovered toast leaves keeps the rest spread until it leaves the stack",
  async ({ page }) => {
    const front = page.getByRole("status", { name: "Upload failed" });
    const next = page.getByRole("status", { name: "Changes saved" });
    const close = front.getByRole("button", { name: "Close" });
    await front.hover();
    await expect(next).toHaveAttribute("data-expanded", "");
    const box = await close.boundingBox();
    if (!box) throw new Error("The close button has no box.");
    const collapses = await next.evaluateHandle((toast) => {
      const seen = { count: 0 };
      new MutationObserver(() => {
        if (toast.hasAttribute("data-collapsed")) seen.count += 1;
      }).observe(toast, { attributeFilter: ["data-collapsed"] });
      return seen;
    });

    await close.click();
    await page.mouse.move(box.x + box.width / 2 + 4, box.y + box.height / 2 + 4, { steps: 4 });
    await expect(front).toBeHidden();
    expect(await collapses.evaluate((seen) => seen.count)).toBe(0);

    await page.mouse.move(4, 4);
    await expect(next).toHaveAttribute("data-collapsed", "");
  },
  { only: "desktop" },
);

storyTest(
  ["components-toast--stacked"],
  "a swipe past the threshold dismisses a toast and a short one doesn't",
  async ({ page }) => {
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
  { only: "desktop" },
);

storyTest(
  ["components-toast--stacked-at-bottom"],
  "at the bottom end the stack spreads upward on hover, and a swipe down dismisses a toast",
  async ({ page }) => {
    const front = page.getByRole("status", { name: "Upload failed" });
    const next = page.getByRole("status", { name: "Changes saved" });
    const gapAboveFront = async () => {
      const [below, above] = await Promise.all([front.boundingBox(), next.boundingBox()]);
      if (!above || !below) throw new Error("A toast has no box.");
      return Math.round(below.y - (above.y + above.height));
    };
    const description = page.getByText("report.pdf is larger than 10 MB.");

    await description.hover({ position: { x: 8, y: 8 } });
    await expect.poll(gapAboveFront).toBe(16);

    const text = await description.boundingBox();
    if (!text) throw new Error("The toast's description has no box.");
    await page.mouse.down();
    await page.mouse.move(text.x + 8, text.y + 128, { steps: 8 });
    await page.mouse.up();
    await expect(front).toBeHidden();
  },
  { only: "desktop" },
);

storyTest(
  ["components-dialog--with-pickers"],
  "a press, focus and Escape in the toaster leave the menu under it open",
  async ({ page }) => {
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
  { only: "desktop" },
);

storyTest(
  ["components-toast--replaced-by-id"],
  "a toast created again under a removed toast's id enters anew and lasts its full duration",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Save draft" }));
    await expect(page.getByRole("status", { name: "Draft saved" })).toBeVisible();
    await page.waitForTimeout(SUCCESS_DURATION / 2);
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
    await page.waitForTimeout(SUCCESS_DURATION - TIMER_SLACK_MS);

    await expect(again).toHaveAttribute("data-open", "");
    expect(
      await page.evaluate(() => (window as unknown as { toastMotion: string[] }).toastMotion),
    ).toContain("opacity");
  },
);
