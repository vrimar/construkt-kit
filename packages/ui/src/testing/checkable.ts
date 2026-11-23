import type { Locator } from "@playwright/test";

/**
 * Checks or unchecks a `Switch` or `Checkbox` by pressing the `<label>` that holds its visually
 * hidden input, which a click on the input can't reach. `input` is the control by role, such as
 * `getByRole("checkbox", { name })`; nothing is pressed when it is already in that state.
 */
export async function setChecked(input: Locator, checked: boolean): Promise<void> {
  if ((await input.isChecked()) === checked) return;
  await input.locator("xpath=ancestor::label[1]").click();
}
