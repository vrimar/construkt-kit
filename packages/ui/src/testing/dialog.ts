import type { Locator, Page } from "@playwright/test";

/**
 * A kit modal or popover by its accessible name, usually its title: a `Dialog`, `SubmitDialog`,
 * `DeleteDialog`, `Drawer`, `Popover` or `PromptPopover` is a `dialog`, and a `ConfirmPopover` or a
 * Dialog with `role="alertdialog"` an `alertdialog`; a phone sheet keeps its overlay's role and
 * name. A string name matches exactly.
 */
export function dialog(scope: Page | Locator, name: string | RegExp): Locator {
  return scope
    .getByRole("dialog", { name, exact: true })
    .or(scope.getByRole("alertdialog", { name, exact: true }));
}
