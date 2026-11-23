import { type Locator, expect, storyTest, test } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-dialog--no-backdrop"],
  "opens with focus on its content, not the close trigger",
  async ({ page }) => {
    await page.getByRole("button", { name: "Open (no backdrop)" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeFocused();
  },
);

storyTest(
  ["components-dialog--with-pickers"],
  "a menu and a toast opened from inside it take clicks",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Schedule delivery" }));
    const dialog = page.getByRole("dialog", { name: "Schedule delivery" });
    await expect(dialog).toBeVisible();

    await gallery.press(page.getByRole("button", { name: "Repeat: Never" }));
    await gallery.press(page.getByRole("menuitem", { name: "Weekly" }));
    await expect(page.getByRole("button", { name: "Repeat: Weekly" })).toBeVisible();

    await gallery.press(page.getByRole("button", { name: "Remind me" }));
    const toast = page.getByText("We'll remind you the day before");
    await expect(toast).toBeVisible();
    await gallery.press(
      page.getByRole("region", { name: /^Notifications/ }).getByRole("button", { name: "Close" }),
    );
    await expect(toast).toBeHidden();
    await expect(dialog).toBeVisible();
  },
);

storyTest(
  ["components-dialog--with-pickers"],
  "Escape closes the menu inside it before the dialog",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Schedule delivery" }));
    const dialog = page.getByRole("dialog", { name: "Schedule delivery" });
    const repeat = page.getByRole("button", { name: "Repeat: Never" });
    await gallery.press(repeat);
    await expect(page.getByRole("menuitem", { name: "Weekly" })).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(repeat).toHaveAttribute("aria-expanded", "false");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  },
);

storyTest(["components-dialog-submitdialog--loading"], "stays open on Escape", async ({ page }) => {
  const dialog = page.getByRole("dialog", { name: "Rename board" });
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");

  await expect(dialog).toBeVisible();
});

storyTest(
  ["components-dialog--default"],
  "unmounts before the frame its exit animation ends, so it never shows at rest again",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Open dialog" }));
    await page.waitForFunction(() => {
      return document.querySelector("dialog [data-slot=content]")?.getAnimations().length === 0;
    });

    const watch = await page.evaluateHandle(() => {
      const content = document.querySelector("dialog [data-slot=content]");
      const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
      const exit = (async () => {
        if (!content) return null;
        let animations = content.getAnimations();
        while (animations.length === 0 && content.isConnected) {
          await nextFrame();
          animations = content.getAnimations();
        }
        await Promise.allSettled(animations.map((animation) => animation.finished));
        for (let tick = 0; tick < 5; tick++) await Promise.resolve();
        return { animated: animations.length > 0, connected: content.isConnected };
      })();
      return { exit };
    });

    await page.keyboard.press("Escape");

    expect(await watch.evaluate(({ exit }) => exit)).toEqual({
      animated: true,
      connected: false,
    });
  },
);

storyTest(
  ["components-dialog--with-pickers"],
  "keeps a shown toast still when the dialog it was raised in closes",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Schedule delivery" }));
    const dialog = page.getByRole("dialog", { name: "Schedule delivery" });
    await gallery.press(page.getByRole("button", { name: "Remind me" }));
    const toast = page.getByText("We'll remind you the day before");
    await expect(toast).toBeVisible();
    await page.waitForFunction(
      () => document.querySelector("[role=status][data-open]")?.getAnimations().length === 0,
    );
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

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await gallery.settle();

    await expect(toast).toBeVisible();
    expect(
      await page.evaluate(() => (window as unknown as { toastMotion: string[] }).toastMotion),
    ).toEqual([]);
  },
);

const isOpen = (dialog: Locator) =>
  dialog.evaluate((element) => (element as HTMLDialogElement).open);

storyTest(
  ["components-dialog--with-page-dialog"],
  "a page's own dialog closing inside it leaves it open",
  async ({ gallery, page }) => {
    const help = page.getByRole("dialog", { name: "Help" });

    await gallery.press(page.getByRole("button", { name: "Show help" }));
    await gallery.press(help.getByRole("button", { name: "Got it" }));
    await expect(help).toBeHidden();
    await gallery.press(page.getByRole("button", { name: "Show help" }));
    await help.evaluate((element) => (element as HTMLDialogElement).requestClose());
    await expect(help).toBeHidden();
    await gallery.settle();

    await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
    expect(await gallery.calls("onOpenChange")).toEqual([]);
  },
);

storyTest(
  ["components-dialog--held-open"],
  "shows itself again after a close its owner doesn't follow",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Run in background" }));

    await expect.poll(() => isOpen(page.locator("dialog"))).toBe(true);
    await expect(page.getByRole("dialog", { name: "Uploading files" })).toBeVisible();
    expect(await gallery.calls("onOpenChange")).toEqual([
      [false, expect.objectContaining({ reason: "close-press" })],
    ]);
  },
);

storyTest(
  ["components-dialog--escape-disabled"],
  "refuses Escape, and a native close such as a second back press",
  async ({ gallery, page }) => {
    const dialog = page.locator("dialog");

    await page.keyboard.press("Escape");
    await dialog.evaluate((element) => (element as HTMLDialogElement).close());

    await expect.poll(() => isOpen(dialog)).toBe(true);
    await expect(page.getByRole("dialog", { name: "Rename board" })).toBeVisible();
    expect(await gallery.calls("onOpenChange")).toEqual([]);
  },
);

storyTest(
  ["components-dialog--escape-disabled"],
  "closes on its form's dialog submit, reported as a close press",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "Save" }));

    await expect(page.getByRole("dialog", { name: "Rename board" })).toBeHidden();
    expect(await gallery.calls("onOpenChange")).toEqual([
      [false, expect.objectContaining({ reason: "close-press" })],
    ]);
  },
);

storyTest(
  ["components-dialog--escape-disabled"],
  "closes on a close command, reported as a close press",
  async ({ gallery, page }) => {
    test.skip(
      !(await page.evaluate(() => "command" in HTMLButtonElement.prototype)),
      "This browser has no invoker commands.",
    );
    const dialog = page.getByRole("dialog", { name: "Rename board" });
    await dialog.evaluate((element) => {
      const discard = document.createElement("button");
      discard.type = "button";
      discard.textContent = "Discard";
      discard.setAttribute("command", "close");
      discard.setAttribute("commandfor", element.id);
      element.querySelector("[data-slot=footer]")?.append(discard);
    });

    await gallery.press(dialog.getByRole("button", { name: "Discard" }));

    await expect(dialog).toBeHidden();
    expect(await gallery.calls("onOpenChange")).toEqual([
      [false, expect.objectContaining({ reason: "close-press" })],
    ]);
  },
);

storyTest(
  ["components-dialog--sibling-dialogs"],
  "a press inside the dialog opened over it leaves it open",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "View payment" }));
    const payment = page.getByRole("dialog", { name: "Payment" });

    await gallery.press(payment.getByText("Paid by card"));
    await gallery.settle();

    await expect(payment).toBeVisible();
    await expect(page.locator("dialog[open]")).toHaveCount(2);
  },
);

storyTest(
  ["components-dialog--sibling-dialogs"],
  "a press outside both closes only the dialog opened over it",
  async ({ gallery, page }) => {
    await gallery.press(page.getByRole("button", { name: "View payment" }));
    const payment = page.getByRole("dialog", { name: "Payment" });
    await expect(payment).toBeVisible();

    await page.mouse.click(8, 8);

    await expect(payment).toBeHidden();
    await expect(page.getByRole("dialog", { name: "Invoice INV-204" })).toBeVisible();
  },
  { only: "desktop" },
);

storyTest(
  ["components-dialog--opened-from-menu"],
  "closing the dialog a menu item opened returns focus to the menu's trigger",
  async ({ gallery, page }) => {
    const trigger = page.getByRole("button", { name: "Board actions" });
    await gallery.press(trigger);
    await gallery.press(page.getByRole("menuitem", { name: "Rename board" }));
    const dialog = page.getByRole("dialog", { name: "Rename board" });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  },
);
