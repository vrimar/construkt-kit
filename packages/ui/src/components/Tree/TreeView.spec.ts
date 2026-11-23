import { type Page, expect, storyTest } from "@construkt-kit/story-kit/test";

const selectedValues = (page: Page) =>
  page
    .getByRole("treeitem", { selected: true })
    .evaluateAll((rows) => rows.map((row) => row.getAttribute("data-value")));

storyTest(
  ["components-treeview--basic"],
  "arrows open and enter a branch, return to its parent and close it",
  async ({ page }) => {
    const branch = (name: string) => page.getByRole("button", { name, exact: true });
    const node = (name: string) => page.getByRole("treeitem", { name, exact: true });

    await branch("src").focus();
    await page.keyboard.press("ArrowDown");
    await expect(branch("components")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(node("components")).toHaveAttribute("aria-expanded", "false");
    await expect(branch("components")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(branch("src")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(branch("components")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(node("components")).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("ArrowRight");
    await expect(node("Button.tsx")).toBeFocused();

    await page.keyboard.press("End");
    await expect(branch("config")).toBeFocused();
    await page.keyboard.press("*");
    await expect(node("docs")).toHaveAttribute("aria-expanded", "true");
    await expect(node("config")).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Home");
    await expect(branch("src")).toBeFocused();
  },
  { only: "desktop" },
);

storyTest(
  ["components-treeview--basic"],
  "typeahead moves on from the focused row and wraps",
  async ({ page }) => {
    await page.getByRole("button", { name: "src", exact: true }).focus();

    await page.keyboard.press("d");
    await expect(page.getByRole("treeitem", { name: "Dialog.tsx" })).toBeFocused();
    await page.keyboard.press("d");
    await expect(page.getByRole("button", { name: "docs", exact: true })).toBeFocused();
    await page.keyboard.press("d");
    await expect(page.getByRole("treeitem", { name: "Dialog.tsx" })).toBeFocused();
  },
  { only: "desktop" },
);

storyTest(
  ["components-treeview--multiple-selection"],
  "Shift with an arrow key selects a range from the row tabbed into",
  async ({ page }) => {
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "src", exact: true })).toBeFocused();

    await page.keyboard.press("Shift+ArrowDown");
    await expect(page.getByRole("button", { name: "components", exact: true })).toBeFocused();
    await expect.poll(() => selectedValues(page)).toEqual(["src", "components"]);
    await page.keyboard.press("Shift+ArrowDown");
    await expect.poll(() => selectedValues(page)).toEqual(["src", "components", "button"]);
    await page.keyboard.press("Shift+ArrowUp");
    await expect.poll(() => selectedValues(page)).toEqual(["src", "components"]);
  },
  { only: "desktop" },
);

storyTest(
  ["components-treeview--multiple-selection"],
  "Shift with Space or a click extends the selection from the last pressed row, past arrow moves",
  async ({ page }) => {
    const node = (name: string) => page.getByRole("treeitem", { name, exact: true });

    await node("Button.tsx").click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(node("Dialog.tsx")).toBeFocused();
    await page.keyboard.press("Shift+Space");
    await expect.poll(() => selectedValues(page)).toEqual(["button", "input", "dialog"]);

    await node("Input.tsx").click({ modifiers: ["Shift"] });
    await expect.poll(() => selectedValues(page)).toEqual(["button", "input"]);
  },
  { only: "desktop" },
);

storyTest(
  ["components-treeview--multiple-selection"],
  "Ctrl/⌘+Space toggles the focused row and leaves the rest selected",
  async ({ page }) => {
    await page.getByRole("treeitem", { name: "Button.tsx", exact: true }).click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ControlOrMeta+Space");
    await expect.poll(() => selectedValues(page)).toEqual(["button", "dialog"]);

    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ControlOrMeta+Space");
    await expect.poll(() => selectedValues(page)).toEqual(["dialog"]);
  },
  { only: "desktop" },
);
