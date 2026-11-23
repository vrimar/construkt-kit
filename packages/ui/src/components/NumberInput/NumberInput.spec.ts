import { expect, storyTest } from "@construkt-kit/story-kit/test";

storyTest(
  ["components-numberinput--with-min-max"],
  "arrows step by step, Shift and Page keys by the large step, Home and End jump, all within the range",
  async ({ page }) => {
    const input = page.getByRole("spinbutton");
    await input.focus();

    await page.keyboard.press("ArrowUp");
    await expect(input).toHaveValue("6");
    await page.keyboard.press("Shift+ArrowUp");
    await expect(input).toHaveValue("10");
    await page.keyboard.press("Shift+ArrowDown");
    await expect(input).toHaveValue("0");
    await page.keyboard.press("End");
    await expect(input).toHaveValue("10");
    await page.keyboard.press("Home");
    await expect(input).toHaveValue("0");
    await page.keyboard.press("PageUp");
    await expect(input).toHaveValue("10");
    await page.keyboard.press("PageDown");
    await expect(input).toHaveValue("0");
  },
  { only: "desktop" },
);

storyTest(
  ["components-numberinput--with-min-max"],
  "Enter commits without reporting a blur; leaving reports it once",
  async ({ gallery, page }) => {
    await page.getByRole("spinbutton").focus();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");

    expect(await gallery.calls("onFocusChange")).toEqual([
      [true, { value: "5", valueAsNumber: 5 }],
      [false, { value: "6", valueAsNumber: 6 }],
    ]);
  },
  { only: "desktop" },
);

storyTest(
  ["components-numberinput--with-min-max"],
  "focus that leaves from a tapped trigger commits and reports the blur",
  async ({ gallery, page }) => {
    const input = page.getByRole("spinbutton");
    await gallery.press(input);
    await gallery.press(page.getByRole("button", { name: "increment value" }));
    await expect(input).toHaveValue("6");
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("The page has no viewport to tap outside the input in.");
    await page.touchscreen.tap(viewport.width / 2, viewport.height - 10);

    expect(await gallery.calls("onValueCommit")).toEqual([["6", { valueAsNumber: 6 }]]);
    expect(await gallery.calls("onFocusChange")).toEqual([
      [true, { value: "5", valueAsNumber: 5 }],
      [false, { value: "6", valueAsNumber: 6 }],
    ]);
  },
  { only: "phone" },
);

storyTest(
  ["components-numberinput--with-min-max"],
  "a touch on the decrement trigger that turns into a scroll steps once and leaves the input unfocused",
  async ({ gallery, page }) => {
    const input = page.getByRole("spinbutton");
    await gallery.swipe(page.getByRole("button", { name: "decrease value" }), 0, 200);

    await expect(input).toHaveValue("4");
    await expect(input).not.toBeFocused();
  },
  { only: "phone" },
);

storyTest(
  ["components-numberinput--with-min-max"],
  "a typed value outside the range is clamped on blur",
  async ({ page }) => {
    const input = page.getByRole("spinbutton");
    await input.fill("50");
    await page.keyboard.press("Tab");
    await expect(input).toHaveValue("10");
  },
  { only: "desktop" },
);

storyTest(
  ["components-numberinput--with-min-max"],
  "a press that reaches the max lets go at once, so the arrows work while it is still held",
  async ({ page }) => {
    const input = page.getByRole("spinbutton");
    const increment = page.getByRole("button", { name: "increment value" });
    await input.focus();
    await page.keyboard.press("End");
    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveValue("9");

    await increment.hover();
    await page.mouse.down();
    await expect(input).toHaveValue("10");
    await expect(increment).toBeDisabled();
    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveValue("9");
    await page.mouse.up();
  },
  { only: "desktop" },
);
