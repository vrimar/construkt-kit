import type { Locator, Page } from "@playwright/test";

/**
 * Selects the `SegmentGroup` item whose radio is named `name` by pressing the item, the `<label>`
 * holding the visually hidden radio a click can't reach. The radio, `getByRole("radio", { name })`,
 * takes `toBeChecked()`. A string name matches exactly.
 */
export async function selectSegment(scope: Page | Locator, name: string | RegExp): Promise<void> {
  const page = "page" in scope ? scope.page() : scope;
  // `has` matches inside each label, so the radio's locator starts at the page, not at `scope`.
  const radio = page.getByRole("radio", { name, exact: true });
  await scope.locator("label").filter({ has: radio }).click();
}
