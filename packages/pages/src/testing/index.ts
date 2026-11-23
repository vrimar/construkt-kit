import type { Locator, Page } from "@playwright/test";

type Scope = Page | Locator;

/**
 * Signs in through `LoginPage`: types `username` into its Email field and `password` into its
 * Password field, then presses Sign in. Wait for what the app shows once signed in.
 */
export async function signIn(
  scope: Scope,
  { username, password }: { username: string; password: string },
): Promise<void> {
  await scope.getByLabel("Email", { exact: true }).fill(username);
  await scope.getByLabel("Password", { exact: true }).fill(password);
  await scope.getByRole("button", { name: "Sign in", exact: true }).click();
}

/** The error an auth page's form shows above its fields after a failed submit, such as a rejected sign-in. */
export function authFormError(scope: Scope): Locator {
  return scope.locator("form").getByRole("alert");
}

/**
 * The error under the auth page field labelled `label` (`Email`, `Password`, `New password`,
 * `Confirm password`). It shows only once a submit has been tried and while the field is invalid.
 */
export function authFieldError(scope: Scope, label: string): Locator {
  return scope
    .getByLabel(label, { exact: true })
    .locator("xpath=ancestor::*[label][1]")
    .locator("[aria-live]");
}
